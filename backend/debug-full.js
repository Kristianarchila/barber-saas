const { spawn } = require('child_process');

const node = spawn('node', ['src/server.js'], {
    cwd: __dirname,
    stdio: 'pipe'
});

let output = '';

node.stdout.on('data', (data) => {
    output += data.toString();
    console.log(data.toString());
});

node.stderr.on('data', (data) => {
    output += data.toString();
    console.error(data.toString());
});

node.on('close', (code) => {
    console.log(`\n\n=== PROCESO TERMINADO CON CÓDIGO: ${code} ===`);
    if (code !== 0) {
        console.log('\n=== OUTPUT COMPLETO ===');
        console.log(output);
    }
});

setTimeout(() => {
    if (node.exitCode === null) {
        console.log('\n✅ Servidor arrancó correctamente');
        node.kill();
    }
}, 3000);
