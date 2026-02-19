try {
    require('./src/routes/clienteStats.routes.js');
    console.log('✅ clienteStats.routes.js cargado correctamente');
} catch (error) {
    console.error('❌ ERROR EN clienteStats.routes.js:');
    console.error('Mensaje:', error.message);
    console.error('\nStack completo:');
    console.error(error.stack);
}
