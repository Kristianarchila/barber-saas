const autocannon = require('autocannon');

const runStressTest = () => {
    const instance = autocannon({
        url: 'http://localhost:5000/api/public/reserva/test-barberia',
        method: 'POST',
        connections: 10, // concurrent connections
        duration: 10,    // seconds
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            nombreCliente: 'Stress Test',
            emailCliente: 'stress@test.com',
            servicioId: 'placeholder_id', // Would need real ID for full test
            barberoId: 'placeholder_id',  // Would need real ID for full test
            fecha: '2026-02-15',
            hora: '10:00'
        })
    }, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Stress Test Result:', result);
        }
    });

    autocannon.track(instance, { renderProgressBar: true });
};

// This script is meant to be run manually or during CI/CD
// runStressTest();
