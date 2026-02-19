const fetch = require('node-fetch');

/**
 * OpenAI Adapter
 * Handles communication with OpenAI API
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

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    temperature: 0.7,
                    max_tokens: 500,
                    ...options
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Error de OpenAI API:', errorData);
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim();
        } catch (error) {
            console.error('❌ Error al conectar con OpenAI:', error);
            throw error;
        }
    }
}

module.exports = OpenAIAdapter;
