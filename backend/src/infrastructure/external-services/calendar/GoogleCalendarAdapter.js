/**
 * Google Calendar Adapter
 */
class GoogleCalendarAdapter {
    constructor(clientId, clientSecret, redirectUri) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.tokenUrl = 'https://oauth2.googleapis.com/token';
        this.calendarUrl = 'https://www.googleapis.com/calendar/v3';
    }

    /**
     * Get OAuth2 Authorize URL
     */
    getAuthUrl(state) {
        const scopes = [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email'
        ].join(' ');

        return `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${this.clientId}` +
            `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scopes)}` +
            `&access_type=offline` +
            `&prompt=consent` +
            `&state=${state}`;
    }

    /**
     * Exchange Auth Code for Tokens
     */
    async getTokens(code) {
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Google Auth error: ${error.error_description || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Refresh Access Token
     */
    async refreshToken(refreshToken) {
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            throw new Error('Could not refresh Google token');
        }

        return await response.json();
    }

    /**
     * Create Calendar Event
     */
    async createEvent(accessToken, eventData) {
        const response = await fetch(`${this.calendarUrl}/calendars/primary/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Google Calendar error: ${error.error?.message || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Delete Calendar Event
     */
    async deleteEvent(accessToken, eventId) {
        const response = await fetch(`${this.calendarUrl}/calendars/primary/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok && response.status !== 404) {
            throw new Error('Could not delete Google Calendar event');
        }

        return true;
    }
}

module.exports = GoogleCalendarAdapter;
