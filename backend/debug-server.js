try {
    require('./src/server.js');
} catch (error) {
    console.error('=== ERROR COMPLETO ===');
    console.error('Mensaje:', error.message);
    console.error('\nStack:');
    console.error(error.stack);
    console.error('\nCode:', error.code);
}
