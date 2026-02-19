#!/usr/bin/env node
/**
 * Backup Scheduler
 * 
 * Runs automated backups using node-cron
 * 
 * Schedule:
 * - Daily at 2:00 AM
 * - Weekly on Sunday at 3:00 AM
 * - Monthly on 1st at 4:00 AM
 * 
 * Usage:
 *   node scripts/schedule-backups.js
 */

const cron = require('node-cron');
const { performBackup } = require('./backup-mongodb');

console.log('🕐 Backup Scheduler Started');
console.log('📅 Schedule:');
console.log('   • Daily: 2:00 AM');
console.log('   • Weekly: Sunday 3:00 AM');
console.log('   • Monthly: 1st day 4:00 AM\n');

// Daily backup at 2:00 AM
cron.schedule('0 2 * * *', async () => {
    console.log('\n⏰ [DAILY] Starting scheduled backup...');
    try {
        await performBackup();
        console.log('✅ [DAILY] Scheduled backup completed\n');
    } catch (error) {
        console.error('❌ [DAILY] Scheduled backup failed:', error.message, '\n');
    }
}, {
    timezone: "America/Santiago" // Adjust to your timezone
});

// Weekly backup on Sunday at 3:00 AM
cron.schedule('0 3 * * 0', async () => {
    console.log('\n⏰ [WEEKLY] Starting scheduled backup...');
    try {
        await performBackup();
        console.log('✅ [WEEKLY] Scheduled backup completed\n');
    } catch (error) {
        console.error('❌ [WEEKLY] Scheduled backup failed:', error.message, '\n');
    }
}, {
    timezone: "America/Santiago"
});

// Monthly backup on 1st at 4:00 AM
cron.schedule('0 4 1 * *', async () => {
    console.log('\n⏰ [MONTHLY] Starting scheduled backup...');
    try {
        await performBackup();
        console.log('✅ [MONTHLY] Scheduled backup completed\n');
    } catch (error) {
        console.error('❌ [MONTHLY] Scheduled backup failed:', error.message, '\n');
    }
}, {
    timezone: "America/Santiago"
});

// Health check every hour
cron.schedule('0 * * * *', () => {
    console.log(`✅ Scheduler health check - ${new Date().toISOString()}`);
});

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n👋 Backup scheduler stopped');
    process.exit(0);
});

console.log('✅ Scheduler is running. Press Ctrl+C to stop.\n');
