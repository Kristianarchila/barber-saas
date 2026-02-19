const cron = require('node-cron');
const container = require('../shared/Container');


/**
 * Cron job to expire waiting list notifications
 * Runs every hour
 */
cron.schedule('0 * * * *', async () => {
    try {
        console.log('🔄 Running waiting list expiration job...');

        const waitingListRepository = container.waitingListRepository;

        // Find all expired notifications
        const expiredEntries = await waitingListRepository.findExpiredNotifications();

        if (expiredEntries.length === 0) {
            console.log('✅ No expired waiting list entries found');
            return;
        }

        // Mark them as expired
        for (const entry of expiredEntries) {
            await waitingListRepository.markAsExpired(entry._id);
            console.log(`⏰ Expired waiting list entry: ${entry._id}`);
        }

        console.log(`✅ Expired ${expiredEntries.length} waiting list entries`);

    } catch (error) {
        console.error('❌ Error in waiting list expiration job:', error);
    }
});

console.log('📅 Waiting list expiration cron job initialized (runs every hour)');

module.exports = {};
