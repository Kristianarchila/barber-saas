const https = require('https');

/**
 * OpenAI Adapter
 * Handles communication with OpenAI API
 * Uses native Node.js https module to avoid ESM compatibility issues with node-fetch v3
 */
class OpenAIAdapter {
    constructor(apiKey, model = 'gpt-4o-mini') {
        this.apiKey = apiKey;
        this.model = model;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    /**
     * Generate text completion
     * @param {Object[]} messages - [{ role, content }]
     * @param {Object} options - Additional OpenAI options
     * @returns {Promise<string>} Generated text content
     */
    async generateChatCompletion(messages, options = {}) {
        if (!this.apiKey) {
            console.warn('⚠️ OpenAI API Key no configurada. Las sugerencias de IA estarán desactivadas.');
            return null;
        }

        const body = JSON.stringify({
            model: this.model,
            messages,
            temperature: 0.7,
            max_tokens: 500,
            ...options
        });

        return new Promise((resolve, reject) => {
            const req = https.request(
                {
                    hostname: 'api.openai.com',
                    path: '/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Length': Buffer.byteLength(body)
                    }
                },
                (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            if (res.statusCode < 200 || res.statusCode >= 300) {
                                console.error('❌ Error de OpenAI API:', parsed);
                                return reject(new Error(`OpenAI API error: ${parsed.error?.message || res.statusMessage}`));
                            }
                            resolve(parsed.choices?.[0]?.message?.content?.trim());
                        } catch (e) {
                            reject(new Error(`Error parsing OpenAI response: ${e.message}`));
                        }
                    });
                }
            );

            req.on('error', (err) => {
                console.error('❌ Error al conectar con OpenAI:', err);
                reject(err);
            });

            req.write(body);
            req.end();
        });
    }
}

module.exports = OpenAIAdapter;
