const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * ResendAdapter - Adapter for Resend Email API
 * Uses node-fetch to send emails via Resend's REST API.
 */
class ResendAdapter {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.resend.com/emails';
    }

    /**
     * Send an email using Resend
     * @param {Object} options - Email options (from, to, subject, html)
     * @returns {Promise<Object>} Resend API response
     */
    async sendEmail({ from, to, subject, html, text }) {
        if (!this.apiKey) {
            throw new Error('RESEND_API_KEY no configurada');
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: from || 'Barber SaaS <onboarding@resend.dev>',
                    to: Array.isArray(to) ? to : [to],
                    subject,
                    html,
                    text
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar email via Resend');
            }

            return {
                success: true,
                messageId: data.id,
                data
            };
        } catch (error) {
            console.error('❌ ResendAdapter Error:', error.message);
            throw error;
        }
    }
}

module.exports = ResendAdapter;
