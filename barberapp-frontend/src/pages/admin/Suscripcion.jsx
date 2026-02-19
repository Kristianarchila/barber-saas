import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '../../components/ui';
import { CreditCard, Check, X, Crown, Zap, TrendingUp, Calendar, ShieldCheck, Download, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { useBarberia } from '../../context/BarberiaContext';
import subscriptionService from '../../services/subscriptionService';

// Fallback catalog if API fails or for initial render
const FALLBACK_PLANS = {
    basico: {
        nombre: 'Básico',
        precio: 29990,
        descripcion: 'Ideal para barberías pequeñas empezando',
        limites: { maxBarberos: 3, maxReservasMes: 100, maxServicios: 10, maxFotos: 5 },
        features: { reservasOnline: true, gestionHorarios: true, gestionServicios: true, notificacionesEmail: false }
    },
    pro: {
        nombre: 'Pro',
        precio: 59990,
        descripcion: 'Para barberías en crecimiento',
        limites: { maxBarberos: 10, maxReservasMes: 500, maxServicios: 30, maxFotos: 20 },
        features: { reservasOnline: true, gestionHorarios: true, gestionServicios: true, notificacionesEmail: true, reportesAvanzados: true, integracionWhatsApp: true, personalizacion: true }
    },
    premium: {
        nombre: 'Premium',
        precio: 99990,
        descripcion: 'Sin límites para grandes operaciones',
        limites: { maxBarberos: -1, maxReservasMes: -1, maxServicios: -1, maxFotos: -1 },
        features: { reservasOnline: true, gestionHorarios: true, gestionServicios: true, notificacionesEmail: true, reportesAvanzados: true, integracionWhatsApp: true, personalizacion: true, soportePrioritario: true }
    }
};

export default function Suscripcion() {
    const { barberia: contextBarberia, loading: contextLoading, refreshBarberia } = useBarberia();
    const [subData, setSubData] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const { slug } = useParams();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subscription, payments] = await Promise.all([
                subscriptionService.getCurrentSubscription().catch(err => {
                    // Handle 404 gracefully - no subscription yet
                    if (err.response?.status === 404) {
                        return { subscription: null };
                    }
                    throw err;
                }),
                subscriptionService.getInvoices().catch(() => ({ invoices: [] }))
            ]);
            setSubData(subscription.subscription);
            setInvoices(payments.invoices);
        } catch (error) {
            console.error('Error fetching subscription data:', error);
            // Set empty state on error
            setSubData(null);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async (planId) => {
        try {
            setActionLoading(planId);
            const response = await subscriptionService.createCheckoutSession({
                planId,
                email: contextBarberia?.email,
                nombre: contextBarberia?.nombre
            });
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error starting checkout:', error);
            alert('Error al iniciar el pago. Inténtalo de nuevo.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar tu suscripción? Tendrás acceso hasta el final del período actual.')) return;

        try {
            setActionLoading('cancel');
            await subscriptionService.cancelSubscription();
            await fetchData();
            alert('Suscripción cancelada correctamente.');
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert('Error al cancelar la suscripción.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReactivateSubscription = async () => {
        try {
            setActionLoading('reactivate');
            await subscriptionService.reactivateSubscription();
            await fetchData();
            alert('Suscripción reactivada correctamente.');
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            alert('Error al reactivar la suscripción.');
        } finally {
            setActionLoading(null);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            activa: { className: 'badge-success', label: 'Activa' },
            trial: { className: 'badge-warning', label: 'Trial de 14 días' },
            suspendida: { className: 'badge-error', label: 'Suspendida' },
            pendiente_pago: { className: 'badge-error', label: 'Pago Pendiente' },
            canceled: { className: 'badge-ghost', label: 'Cancelación Pendiente' }
        };
        return estados[estado] || { className: 'badge-ghost', label: estado };
    };

    const getPlanIcon = (planName) => {
        const icons = {
            basico: <Zap className="text-blue-600" size={24} />,
            pro: <TrendingUp className="text-purple-600" size={24} />,
            premium: <Crown className="text-amber-600" size={24} />
        };
        return icons[planName] || <CreditCard size={24} />;
    };

    if (loading || contextLoading) {
        return (
            <div className="space-y-6">
                <Skeleton variant="rectangular" width="w-64" height="h-10" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rectangular" width="w-full" height="h-96" />
                    ))}
                </div>
            </div>
        );
    }

    const currentPlan = subData?.plan || 'basico';
    const planDetails = subData?.planDetails || FALLBACK_PLANS[currentPlan];
    const status = subData?.estado || 'trial';
    const isCanceled = subData?.subscription?.cancelAtPeriodEnd;

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Facturación y Plan</h1>
                    <p className="body-large text-gray-600 mt-2">
                        Gestiona tu suscripción, métodos de pago y descarga tus facturas
                    </p>
                </div>
                <button onClick={fetchData} className="btn btn-ghost">
                    <RefreshCw size={16} />
                    Actualizar datos
                </button>
            </div>

            {/* CURRENT SUBSCRIPTION INFO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card card-padding">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                                {getPlanIcon(currentPlan)}
                            </div>
                            <div>
                                <p className="caption text-gray-500">Plan contratado</p>
                                <h2 className="heading-2">{planDetails?.nombre}</h2>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`badge ${getEstadoBadge(status).className}`}>
                                {getEstadoBadge(status).label}
                            </span>
                            {isCanceled && (
                                <span className="badge badge-error text-xs">Termina pronto</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                        <div>
                            <div className="flex items-center gap-2 caption text-gray-500 mb-2">
                                <CreditCard size={14} />
                                Precio Mensual
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(planDetails?.precio)}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 caption text-gray-500 mb-2">
                                <Calendar size={14} />
                                {isCanceled ? 'Acceso hasta' : 'Próximo cobro'}
                            </div>
                            <p className="label text-gray-900">{formatDate(subData?.subscription?.currentPeriodEnd || subData?.proximoPago)}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 caption text-gray-500 mb-2">
                                <ShieldCheck size={14} />
                                Método de Pago
                            </div>
                            <p className="label text-gray-900">Stripe Billing</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {isCanceled ? (
                            <button
                                onClick={handleReactivateSubscription}
                                disabled={actionLoading === 'reactivate'}
                                className="btn btn-primary"
                            >
                                {actionLoading === 'reactivate' && <Loader2 className="animate-spin" size={16} />}
                                Reactivar Suscripción
                            </button>
                        ) : status !== 'trial' ? (
                            <button
                                onClick={handleCancelSubscription}
                                disabled={actionLoading === 'cancel'}
                                className="btn btn-ghost"
                            >
                                {actionLoading === 'cancel' && <Loader2 className="animate-spin" size={16} />}
                                Cancelar Suscripción
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                Activar Plan Premium
                            </button>
                        )}
                    </div>
                </div>

                {/* TRIAL INFO OR QUICK STATS */}
                <div className="card card-padding">
                    {subData?.trialInfo && !subData.trialInfo.isExpired ? (
                        <div className="h-full flex flex-col justify-between">
                            <div>
                                <h3 className="heading-3 mb-2">Tu prueba gratuita</h3>
                                <p className="body-small text-gray-600 mb-6">Estamos encantados de tenerte. Aprovecha estos días para configurar tu negocio.</p>

                                <div className="relative w-32 h-32 mx-auto">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={352}
                                            strokeDashoffset={352 - (subData.trialInfo.daysRemaining / 14) * 352}
                                            className="text-blue-600 transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-900">{subData.trialInfo.daysRemaining}</span>
                                        <span className="caption text-gray-500">días</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center body-small text-gray-500 mt-4">Expira el {formatDate(subData.trialInfo.endDate)}</p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <ShieldCheck className="text-green-600" size={32} />
                            </div>
                            <h3 className="heading-3 mb-2">Cuenta Protegida</h3>
                            <p className="body-small text-gray-600">Tu suscripción está gestionada de forma segura por Stripe.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* USAGE LIMITS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Barberos', current: contextBarberia?.barberos?.length || 0, max: planDetails?.limites.maxBarberos, color: 'bg-blue-600' },
                    { label: 'Servicios', current: contextBarberia?.servicios?.length || 0, max: planDetails?.limites.maxServicios, color: 'bg-purple-600' },
                    { label: 'Reservas/Mes', current: 0, max: planDetails?.limites.maxReservasMes, color: 'bg-green-600' },
                    { label: 'Fotos Galería', current: 0, max: planDetails?.limites.maxFotos, color: 'bg-amber-600' }
                ].map((stat, i) => (
                    <div key={i} className="card card-padding">
                        <div className="flex items-center justify-between mb-3">
                            <p className="caption text-gray-500">{stat.label}</p>
                            <span className="body-small font-bold text-gray-900">
                                {stat.current} / {stat.max === -1 ? '∞' : stat.max}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.max === -1 ? 50 : Math.min((stat.current / stat.max) * 100, 100)}%` }}
                                className={`${stat.color} h-full rounded-full`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* INVOICE HISTORY */}
            <div>
                <h2 className="heading-2 mb-4">Historial de Pagos</h2>
                {invoices.length > 0 ? (
                    <div className="card overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                    <th>ID</th>
                                    <th className="text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>{formatDate(invoice.date)}</td>
                                        <td className="font-bold">{formatCurrency(invoice.amount)}</td>
                                        <td>
                                            <span className={`badge ${invoice.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                {invoice.status === 'paid' ? 'Pagado' : invoice.status}
                                            </span>
                                        </td>
                                        <td className="text-gray-500 font-mono text-sm">{invoice.id.substring(0, 8)}...</td>
                                        <td className="text-right">
                                            <a
                                                href={invoice.invoicePdf}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Descargar <Download size={14} />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="card card-padding text-center py-12">
                        <p className="text-gray-500">Aún no hay facturas registradas.</p>
                    </div>
                )}
            </div>

            {/* AVAILABLE PLANS */}
            <div id="plans-section">
                <h2 className="heading-2 mb-6">Planes Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(FALLBACK_PLANS).map(([key, plan]) => {
                        const isCurrentPlan = key === currentPlan;
                        return (
                            <div
                                key={key}
                                className={`card card-padding ${isCurrentPlan ? 'ring-2 ring-blue-600' : ''}`}
                            >
                                {isCurrentPlan && (
                                    <div className="mb-4">
                                        <span className="badge badge-primary">Plan Actual</span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <div className="inline-flex p-3 bg-gray-100 rounded-lg mb-4">
                                        {getPlanIcon(key)}
                                    </div>
                                    <h3 className="heading-3 mb-2">{plan.nombre}</h3>
                                    <p className="body-small text-gray-600 mb-4">{plan.descripcion}</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.precio)}</span>
                                        <span className="caption text-gray-500">/mes</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <p className="caption text-gray-500">Características clave</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Barberos</span>
                                            <span className="font-bold text-gray-900">{plan.limites.maxBarberos === -1 ? 'Ilimitados' : plan.limites.maxBarberos}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Reservas</span>
                                            <span className="font-bold text-gray-900">{plan.limites.maxReservasMes === -1 ? 'Ilimitadas' : plan.limites.maxReservasMes}</span>
                                        </div>
                                        {Object.entries(plan.features).slice(0, 3).map(([feature, enabled]) => (
                                            <div key={feature} className="flex items-center gap-2">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    {enabled ? <Check size={12} className="text-green-600" /> : <X size={12} className="text-gray-400" />}
                                                </div>
                                                <span className={`text-sm ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className={`btn w-full ${isCurrentPlan ? 'btn-ghost' : 'btn-primary'}`}
                                    disabled={isCurrentPlan || actionLoading === key}
                                    onClick={() => handleCheckout(key)}
                                >
                                    {actionLoading === key && <Loader2 className="animate-spin" size={16} />}
                                    {isCurrentPlan ? 'Plan Actual' : 'Cambiar Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EXTERNAL BILLING LINK */}
            <div className="card card-padding bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <ExternalLink className="text-blue-600" size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="heading-3 mb-2">
                            Gestionar métodos de pago en Stripe
                        </h3>
                        <p className="body-small text-gray-600">
                            Para actualizar tu tarjeta de crédito o ver facturas detalladas anteriores, utiliza el portal oficial de facturación segura.
                        </p>
                    </div>
                    <button className="btn btn-ghost">
                        Portal de Cliente <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
