#!/usr/bin/env node
/**
 * MongoDB Backup Script
 * 
 * Automated backup system with:
 * - Daily automated backups
 * - Retention policy (7 daily, 4 weekly, 12 monthly)
 * - Compression
 * - Cloud upload (optional)
 * - Slack/Email notifications
 * 
 * Usage:
 *   node scripts/backup-mongodb.js
 *   node scripts/backup-mongodb.js --type=manual
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const CONFIG = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017',
    BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '../backups'),
    RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 7,
    RETENTION_WEEKS: parseInt(process.env.BACKUP_RETENTION_WEEKS) || 4,
    RETENTION_MONTHS: parseInt(process.env.BACKUP_RETENTION_MONTHS) || 12,
    COMPRESS: process.env.BACKUP_COMPRESS !== 'false',
    SLACK_WEBHOOK: process.env.SLACK_BACKUP_WEBHOOK,
    EMAIL_NOTIFICATIONS: process.env.BACKUP_EMAIL_NOTIFICATIONS === 'true'
};

/**
 * Main backup function
 */
async function performBackup() {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(CONFIG.BACKUP_DIR, backupName);

    console.log('🔄 Starting MongoDB backup...');
    console.log(`📁 Backup location: ${backupPath}`);

    try {
        // Ensure backup directory exists
        if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
            fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
            console.log('✅ Created backup directory');
        }

        // Execute mongodump
        const dumpCommand = `mongodump --uri="${CONFIG.MONGO_URI}" --out="${backupPath}"`;
        console.log('⏳ Running mongodump...');

        const { stdout, stderr } = await execPromise(dumpCommand);
        if (stderr && !stderr.includes('done dumping')) {
            console.warn('⚠️ Mongodump warnings:', stderr);
        }

        // Compress backup if enabled
        if (CONFIG.COMPRESS) {
            console.log('🗜️ Compressing backup...');
            const tarCommand = `tar -czf "${backupPath}.tar.gz" -C "${CONFIG.BACKUP_DIR}" "${backupName}"`;
            await execPromise(tarCommand);

            // Remove uncompressed directory (cross-platform)
            fs.rmSync(backupPath, { recursive: true, force: true });
            console.log('✅ Backup compressed');
        }

        // Calculate backup size
        const backupFile = CONFIG.COMPRESS ? `${backupPath}.tar.gz` : backupPath;
        const stats = fs.statSync(backupFile);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('✅ Backup completed successfully!');
        console.log(`📊 Size: ${sizeMB} MB`);
        console.log(`⏱️ Duration: ${duration}s`);

        // Clean old backups
        await cleanOldBackups();

        // Send notifications
        await sendNotification({
            success: true,
            backupName,
            sizeMB,
            duration,
            timestamp: new Date().toISOString()
        });

        return { success: true, backupName, sizeMB, duration };

    } catch (error) {
        console.error('❌ Backup failed:', error.message);

        await sendNotification({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });

        throw error;
    }
}

/**
 * Clean old backups based on retention policy
 */
async function cleanOldBackups() {
    console.log('🧹 Cleaning old backups...');

    try {
        const files = fs.readdirSync(CONFIG.BACKUP_DIR)
            .filter(f => f.startsWith('backup-'))
            .map(f => ({
                name: f,
                path: path.join(CONFIG.BACKUP_DIR, f),
                mtime: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime);

        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const oneWeekMs = 7 * oneDayMs;
        const oneMonthMs = 30 * oneDayMs;

        let dailyCount = 0;
        let weeklyCount = 0;
        let monthlyCount = 0;

        for (const file of files) {
            const ageMs = now - file.mtime;
            const ageDays = ageMs / oneDayMs;

            let shouldKeep = false;

            // Keep daily backups
            if (ageDays < CONFIG.RETENTION_DAYS && dailyCount < CONFIG.RETENTION_DAYS) {
                shouldKeep = true;
                dailyCount++;
            }
            // Keep weekly backups
            else if (ageDays < CONFIG.RETENTION_WEEKS * 7 && weeklyCount < CONFIG.RETENTION_WEEKS) {
                if (file.mtime.getDay() === 0) { // Sunday
                    shouldKeep = true;
                    weeklyCount++;
                }
            }
            // Keep monthly backups
            else if (ageDays < CONFIG.RETENTION_MONTHS * 30 && monthlyCount < CONFIG.RETENTION_MONTHS) {
                if (file.mtime.getDate() === 1) { // First day of month
                    shouldKeep = true;
                    monthlyCount++;
                }
            }

            if (!shouldKeep) {
                fs.rmSync(file.path, { recursive: true, force: true });
                console.log(`🗑️ Deleted old backup: ${file.name}`);
            }
        }

        console.log(`✅ Retention policy applied (${dailyCount} daily, ${weeklyCount} weekly, ${monthlyCount} monthly)`);

    } catch (error) {
        console.error('⚠️ Error cleaning old backups:', error.message);
    }
}

/**
 * Send notification about backup status
 */
async function sendNotification(data) {
    if (CONFIG.SLACK_WEBHOOK) {
        try {
            const message = data.success
                ? `✅ *Backup Successful*\n` +
                `• Name: \`${data.backupName}\`\n` +
                `• Size: ${data.sizeMB} MB\n` +
                `• Duration: ${data.duration}s\n` +
                `• Time: ${data.timestamp}`
                : `❌ *Backup Failed*\n` +
                `• Error: ${data.error}\n` +
                `• Time: ${data.timestamp}`;

            await fetch(CONFIG.SLACK_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message })
            });

            console.log('📢 Slack notification sent');
        } catch (error) {
            console.error('⚠️ Failed to send Slack notification:', error.message);
        }
    }
}

/**
 * List all available backups
 */
function listBackups() {
    console.log('📋 Available backups:\n');

    const files = fs.readdirSync(CONFIG.BACKUP_DIR)
        .filter(f => f.startsWith('backup-'))
        .map(f => ({
            name: f,
            path: path.join(CONFIG.BACKUP_DIR, f),
            size: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).size,
            mtime: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
        console.log('No backups found.');
        return;
    }

    files.forEach((file, index) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const date = file.mtime.toISOString().split('T')[0];
        const time = file.mtime.toTimeString().split(' ')[0];
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Size: ${sizeMB} MB | Date: ${date} ${time}\n`);
    });

    console.log(`Total backups: ${files.length}`);
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'list') {
        listBackups();
    } else {
        performBackup()
            .then(() => {
                console.log('\n✅ Backup process completed successfully');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n❌ Backup process failed:', error);
                process.exit(1);
            });
    }
}

module.exports = { performBackup, listBackups, cleanOldBackups };
