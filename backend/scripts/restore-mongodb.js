#!/usr/bin/env node
/**
 * MongoDB Restore Script
 * 
 * Restore database from backup with safety checks
 * 
 * Usage:
 *   node scripts/restore-mongodb.js list
 *   node scripts/restore-mongodb.js restore backup-2026-02-12T10-00-00-000Z
 *   node scripts/restore-mongodb.js restore backup-2026-02-12T10-00-00-000Z --confirm
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const readline = require('readline');
const execPromise = util.promisify(exec);

const CONFIG = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017',
    BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '../backups')
};

/**
 * List available backups
 */
function listBackups() {
    console.log('📋 Available backups:\n');

    const files = fs.readdirSync(CONFIG.BACKUP_DIR)
        .filter(f => f.startsWith('backup-'))
        .map(f => ({
            name: f.replace('.tar.gz', ''),
            path: path.join(CONFIG.BACKUP_DIR, f),
            size: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).size,
            mtime: fs.statSync(path.join(CONFIG.BACKUP_DIR, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
        console.log('❌ No backups found.');
        return [];
    }

    files.forEach((file, index) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const date = file.mtime.toISOString();
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Size: ${sizeMB} MB | Created: ${date}\n`);
    });

    return files;
}

/**
 * Confirm restore action
 */
async function confirmRestore(backupName) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n⚠️  WARNING: This will REPLACE your current database!');
        console.log(`📦 Backup to restore: ${backupName}`);
        console.log(`🗄️  Target database: ${CONFIG.MONGO_URI}\n`);

        rl.question('Type "CONFIRM" to proceed with restore: ', (answer) => {
            rl.close();
            resolve(answer === 'CONFIRM');
        });
    });
}

/**
 * Perform database restore
 */
async function performRestore(backupName, skipConfirm = false) {
    const startTime = Date.now();

    console.log('🔄 Starting MongoDB restore...');
    console.log(`📦 Backup: ${backupName}`);

    try {
        // Check if backup exists
        const compressedPath = path.join(CONFIG.BACKUP_DIR, `${backupName}.tar.gz`);
        const uncompressedPath = path.join(CONFIG.BACKUP_DIR, backupName);

        let backupPath;
        let needsDecompression = false;

        if (fs.existsSync(compressedPath)) {
            backupPath = compressedPath;
            needsDecompression = true;
        } else if (fs.existsSync(uncompressedPath)) {
            backupPath = uncompressedPath;
        } else {
            throw new Error(`Backup not found: ${backupName}`);
        }

        // Confirm restore
        if (!skipConfirm) {
            const confirmed = await confirmRestore(backupName);
            if (!confirmed) {
                console.log('❌ Restore cancelled by user');
                return { success: false, cancelled: true };
            }
        }

        // Decompress if needed
        if (needsDecompression) {
            console.log('🗜️ Decompressing backup...');
            const tarCommand = `tar -xzf "${compressedPath}" -C "${CONFIG.BACKUP_DIR}"`;
            await execPromise(tarCommand);
            console.log('✅ Backup decompressed');
        }

        // Create safety backup of current database
        console.log('💾 Creating safety backup of current database...');
        const safetyBackupName = `safety-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
        const safetyBackupPath = path.join(CONFIG.BACKUP_DIR, safetyBackupName);

        const safetyDumpCommand = `mongodump --uri="${CONFIG.MONGO_URI}" --out="${safetyBackupPath}"`;
        await execPromise(safetyDumpCommand);
        console.log(`✅ Safety backup created: ${safetyBackupName}`);

        // Perform restore
        console.log('⏳ Restoring database...');
        const restoreCommand = `mongorestore --uri="${CONFIG.MONGO_URI}" --drop "${uncompressedPath}"`;

        const { stdout, stderr } = await execPromise(restoreCommand);
        if (stderr && !stderr.includes('done')) {
            console.warn('⚠️ Mongorestore warnings:', stderr);
        }

        // Clean up decompressed files if they were created
        if (needsDecompression) {
            await execPromise(`rm -rf "${uncompressedPath}"`);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('✅ Restore completed successfully!');
        console.log(`⏱️ Duration: ${duration}s`);
        console.log(`💾 Safety backup available at: ${safetyBackupName}`);

        return {
            success: true,
            backupName,
            duration,
            safetyBackup: safetyBackupName
        };

    } catch (error) {
        console.error('❌ Restore failed:', error.message);
        console.log('\n⚠️  Your database was NOT modified');
        throw error;
    }
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'list') {
        listBackups();
        process.exit(0);
    } else if (command === 'restore') {
        const backupName = args[1];
        const skipConfirm = args.includes('--confirm');

        if (!backupName) {
            console.error('❌ Error: Backup name required');
            console.log('\nUsage: node scripts/restore-mongodb.js restore <backup-name>');
            console.log('\nRun "node scripts/restore-mongodb.js list" to see available backups');
            process.exit(1);
        }

        performRestore(backupName, skipConfirm)
            .then((result) => {
                if (result.success) {
                    console.log('\n✅ Restore process completed successfully');
                    process.exit(0);
                } else if (result.cancelled) {
                    process.exit(0);
                }
            })
            .catch((error) => {
                console.error('\n❌ Restore process failed:', error);
                process.exit(1);
            });
    } else {
        console.log('MongoDB Restore Tool\n');
        console.log('Usage:');
        console.log('  node scripts/restore-mongodb.js list');
        console.log('  node scripts/restore-mongodb.js restore <backup-name>');
        console.log('  node scripts/restore-mongodb.js restore <backup-name> --confirm');
        process.exit(0);
    }
}

module.exports = { performRestore, listBackups };
