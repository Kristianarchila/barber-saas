/**
 * @file usePushNotifications.js
 * @description React hook to manage Web Push subscriptions.
 *
 * Usage (auto-registers on mount for BARBERO role):
 *   import { usePushNotifications } from '../hooks/usePushNotifications';
 *   const { isSupported, permission, subscribe, unsubscribe } = usePushNotifications();
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
    const [permission, setPermission] = useState(Notification?.permission ?? 'default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

    // Subscribe this device
    const subscribe = useCallback(async () => {
        if (!isSupported) return;
        try {
            const reg = await navigator.serviceWorker.ready;

            // Get VAPID public key
            const { data } = await api.get('/push/vapid-public-key');
            const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

            // Ask permission + create subscription
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
            });

            // Save to backend
            await api.post('/push/subscribe', {
                subscription: sub.toJSON()
            });

            setIsSubscribed(true);
            setPermission('granted');
            console.log('[Push] Subscription saved ✅');
        } catch (err) {
            console.warn('[Push] Could not subscribe:', err.message);
        }
    }, [isSupported]);

    // Unsubscribe this device
    const unsubscribe = useCallback(async () => {
        if (!isSupported) return;
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await api.delete('/push/subscribe', { data: { endpoint: sub.endpoint } });
                await sub.unsubscribe();
                setIsSubscribed(false);
            }
        } catch (err) {
            console.warn('[Push] Could not unsubscribe:', err.message);
        }
    }, [isSupported]);

    // On mount: check if already subscribed
    useEffect(() => {
        if (!isSupported) return;
        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(sub => {
                setIsSubscribed(!!sub);
            });
        });
    }, [isSupported]);

    return { isSupported, permission, isSubscribed, subscribe, unsubscribe };
}
