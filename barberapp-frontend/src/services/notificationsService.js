import api from "./api";

const notificationsService = {
    /**
     * Obtener la clave pública VAPID
     */
    async getVapidPublicKey(slug) {
        const response = await api.get(`/barberias/${slug}/notifications/vapid-public-key`);
        return response.data;
    },

    /**
     * Solicitar permisos de notificación del navegador
     */
    async requestPermission() {
        if (!("Notification" in window)) {
            throw new Error("Este navegador no soporta notificaciones");
        }

        const permission = await Notification.requestPermission();
        return permission === "granted";
    },

    /**
     * Registrar Service Worker y suscribirse a push notifications
     */
    async subscribeToPush(slug) {
        try {
            // 1. Verificar soporte
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                throw new Error("Las notificaciones push no están soportadas en este navegador");
            }

            // 2. Registrar service worker si no está registrado
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                registration = await navigator.serviceWorker.register("/sw.js");
                await navigator.serviceWorker.ready;
            }

            // 3. Verificar si ya tiene suscripción
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // 4. Obtener clave pública VAPIDestado
                const { publicKey } = await this.getVapidPublicKey(slug);

                // 5. Suscribirse
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(publicKey),
                });
            }

            // 6. Enviar suscripción al servidor
            const response = await api.post(`/barberias/${slug}/notifications/subscribe`, {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")),
                    auth: this.arrayBufferToBase64(subscription.getKey("auth")),
                },
                userAgent: navigator.userAgent,
            });

            return response.data;
        } catch (error) {
            console.error("Error subscribing to push:", error);
            throw error;
        }
    },

    /**
     * Cancelar suscripción a push notifications
     */
    async unsubscribeFromPush(slug) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) return;

            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) return;

            await api.delete(`/barberias/${slug}/notifications/unsubscribe`, {
                data: { endpoint: subscription.endpoint },
            });

            await subscription.unsubscribe();
        } catch (error) {
            console.error("Error unsubscribing from push:", error);
            throw error;
        }
    },

    /**
     * Enviar notificación de prueba
     */
    async sendTestNotification(slug) {
        const response = await api.post(`/barberias/${slug}/notifications/test`);
        return response.data;
    },

    /**
     * Obtener historial de notificaciones
     */
    async getNotificationLogs(slug, params = {}) {
        const response = await api.get(`/barberias/${slug}/notifications/logs`, { params });
        return response.data;
    },

    /**
     * Obtener configuración de notificaciones
     */
    async getNotificationSettings(slug) {
        const response = await api.get(`/barberias/${slug}/notifications/settings`);
        return response.data;
    },

    /**
     * Actualizar configuración de notificaciones
     */
    async updateNotificationSettings(slug, settings) {
        const response = await api.put(`/barberias/${slug}/notifications/settings`, settings);
        return response.data;
    },

    /**
     * Verificar si el usuario ha dado permisos
     */
    hasPermission() {
        return "Notification" in window && Notification.permission === "granted";
    },

    /**
     * Convertir clave VAPID de base64 a Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    /**
     * Convertir ArrayBuffer a Base64
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },
};

export default notificationsService;
