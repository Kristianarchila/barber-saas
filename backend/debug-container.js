console.log('=== TESTING CONTAINER ===');
try {
    const Container = require('./src/shared/Container');
    console.log('✅ Container imported');
    console.log('Container type:', typeof Container);
    console.log('Container.getInstance type:', typeof Container.getInstance);

    const instance = Container.getInstance();
    console.log('✅ Container instance created');
    console.log('Instance has clienteStatsRepository?', 'clienteStatsRepository' in instance);
    console.log('Instance has barberiaRepository?', 'barberiaRepository' in instance);
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
}
