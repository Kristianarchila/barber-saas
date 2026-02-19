const http = require('http');
const fs = require('fs');

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/public/barberias/barberialamejor',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const output = `Status Code: ${res.statusCode}\n\nResponse:\n${data}\n\nParsed:\n${JSON.stringify(JSON.parse(data), null, 2)}`;
        console.log(output);
        fs.writeFileSync('error-response.txt', output);
        console.log('\nError details written to error-response.txt');
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end();
