import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, ShieldCheck } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Button, Card } from '../ui';
import { toast } from 'react-hot-toast';

export default function PushNotificationBanner() {
    const { isSupported, permission, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Show banner only if supported and not subscribed/denied
        if (isSupported && !isSubscribed && permission !== 'denied') {
            const dismissed = localStorage.getItem('push_banner_dismissed');
            if (!dismissed) {
                // Delay showing to not overwhelm
                const timer = setTimeout(() => setIsVisible(true), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [isSupported, isSubscribed, permission]);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            await subscribe();
            toast.success('¡Notificaciones activadas!');
            setIsVisible(false);
        } catch (err) {
            toast.error('No se pudieron activar las notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('push_banner_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <Card className="mb-6 p-4 border-blue-200 bg-blue-50/50 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Bell size={48} className="text-blue-600" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 animate-pulse">
                    <Bell size={24} />
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-blue-900 leading-tight">Activar Notificaciones de Citas</h4>
                    <p className="text-sm text-blue-700/80 mt-0.5">
                        Recibe alertas al instante cuando un cliente reserve contigo, incluso con la app cerrada.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        onClick={handleSubscribe}
                        loading={loading}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm"
                    >
                        Activar
                    </Button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                        title="Ignorar por ahora"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </Card>
    );
}
