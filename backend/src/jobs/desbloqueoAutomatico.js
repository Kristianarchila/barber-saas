const cron = require('node-cron');
const container = require('../shared/Container');

// Schedule: Run every hour at minute 0
// Format: minute hour day month dayOfWeek
const schedule = '0 * * * *';

function startDesbloqueoAutomaticoJob() {
    cron.schedule(schedule, async () => {
        console.log(`[${new Date().toISOString()}] 🔓 Starting automatic unblock job...`);

        try {
            const clienteStatsRepo = container.clienteStatsRepository;

            // Find clients that should be unblocked
            const toUnblock = await clienteStatsRepo.findToUnblock();

            if (toUnblock.length === 0) {
                console.log(`[${new Date().toISOString()}] ℹ️  No clients to unblock`);
                return;
            }

            console.log(`[${new Date().toISOString()}] 🔓 Unblocking ${toUnblock.length} client(s)...`);

            // Unblock each client
            for (const cliente of toUnblock) {
                try {
                    await clienteStatsRepo.desbloquear(cliente.email, cliente.barberiaId);
                    console.log(`[${new Date().toISOString()}] ✅ Unblocked: ${cliente.email}`);
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] ❌ Error unblocking ${cliente.email}:`, error);
                }
            }

            console.log(`[${new Date().toISOString()}] ✅ Automatic unblock job completed`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] ❌ Error in automatic unblock job:`, error);
        }
    }, {
        scheduled: true,
        timezone: "America/Santiago" // Adjust to your timezone
    });

    console.log(`✅ Automatic unblock job scheduled: ${schedule} (America/Santiago)`);
}

module.exports = { startDesbloqueoAutomaticoJob };
