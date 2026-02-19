try {
    require('./src/app.js');
} catch (error) {
    console.error('ERROR COMPLETO:');
    console.error(error.message);
    console.error('\nSTACK:');
    console.error(error.stack);
    console.error('\nCODE:', error.code);
    console.error('\nREQUIRE STACK:', error.requireStack);
}
