const cron = require('node-cron');
const container = require('../shared/Container');

// Schedule: Run at 00:00 on day 1 of every month
// Format: minute hour day month dayOfWeek
const schedule = '0 0 1 * *';

function startResetMonthlyCancelacionesJob() {
    cron.schedule(schedule, async () => {
        console.log(`[${new Date().toISOString()}] 🔄 Starting monthly cancellation reset job...`);

        try {
            const resetUseCase = new (require('../application/use-cases/clientes/ResetMonthlyCancelaciones'))(
                container.clienteStatsRepository
            );

            const result = await resetUseCase.execute();

            console.log(`[${new Date().toISOString()}] ✅ Monthly cancellation reset completed:`, result);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error in monthly cancellation reset job:`, error);
        }
    }, {
        scheduled: true,
        timezone: "America/Santiago" // Adjust to your timezone
    });

    console.log(`✅ Monthly cancellation reset job scheduled: ${schedule} (America/Santiago)`);
}

module.exports = { startResetMonthlyCancelacionesJob };
