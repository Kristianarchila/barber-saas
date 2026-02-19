const fetch = require('node-fetch');

async function debugLogin() {
    const url = 'http://localhost:4000/api/auth/login';
    console.log(`Testing ${url}...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: 'test' })
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

debugLogin();
