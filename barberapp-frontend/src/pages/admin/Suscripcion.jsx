import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '../../components/ui';
import {
    Check, X, Crown, Zap, TrendingUp, Calendar, ShieldCheck,
    RefreshCw, Loader2, Clock, Bitcoin, Copy, CheckCheck
} from 'lucide-react';
import { useBarberia } from '../../context/BarberiaContext';
import subscriptionService from '../../services/subscriptionService';
import UsdtPaymentModal from '../../components/admin/UsdtPaymentModal';

// Plan catalog (fallback if API fails)
const PLANS = {
    basico: {
        key: 'basico',
        nombre: 'Básico',
        precioUsdt: 15,
        descripcion: 'Ideal para barberías pequeñas',
        color: 'blue',
        icon: <Zap size={24} className="text-blue-600" />,
        limites: { maxBarberos: 3, maxReservasMes: 100, maxServicios: 10 },
        features: ['Reservas online', 'Gestión horarios', 'Servicios', 'Reportes básicos', '0% comisión'],
    },
    pro: {
        key: 'pro',
        nombre: 'Pro',
        precioUsdt: 29,
        descripcion: 'Para barberías en crecimiento',
        color: 'purple',
        icon: <TrendingUp size={24} className="text-purple-600" />,
        limites: { maxBarberos: 10, maxReservasMes: 500, maxServicios: 30 },
        features: ['Todo lo del Básico', 'WhatsApp', 'Reportes avanzados', 'Multi-admin', '0% comisión'],
        highlighted: true,
    },
    premium: {
        key: 'premium',
        nombre: 'Premium',
        precioUsdt: 49,
        descripcion: 'Sin límites, soporte prioritario',
        color: 'amber',
        icon: <Crown size={24} className="text-amber-600" />,
        limites: { maxBarberos: -1, maxReservasMes: -1, maxServicios: -1 },
        features: ['Todo ilimitado', 'Soporte prioritario 24/7', 'Manager dedicado', '0% comisión'],
    },
};

const STATUS_MAP = {
    ACTIVE: { label: 'Activa', cls: 'bg-emerald-100 text-emerald-700' },
    TRIALING: { label: 'Trial gratuito', cls: 'bg-blue-100 text-blue-700' },
    PAST_DUE: { label: 'Pago vencido', cls: 'bg-red-100 text-red-700' },
    CANCELED: { label: 'Cancelada', cls: 'bg-gray-100 text-gray-600' },
    INCOMPLETE: { label: 'Verificando pago', cls: 'bg-amber-100 text-amber-700' },
};

export default function Suscripcion() {
    const { barberia: contextBarberia, loading: contextLoading } = useBarberia();
    const [subData, setSubData] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null); // Opens USDT modal
    const { slug } = useParams ? useParams() : { slug: '' };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sub, inv] = await Promise.all([
                subscriptionService.getCurrentSubscription().catch(e => e.response?.status === 404 ? { subscription: null } : Promise.reject(e)),
                subscriptionService.getInvoices().catch(() => ({ invoices: [] }))
            ]);
            setSubData(sub.subscription);
            setPayments(inv.invoices || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const currentPlanKey = subData?.plan?.toLowerCase() || 'free';
    const statusInfo = STATUS_MAP[subData?.status] || STATUS_MAP.TRIALING;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

    if (loading || contextLoading) {
        return (
            <div className="space-y-6">
                <Skeleton variant="rectangular" width="w-64" height="h-10" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" width="w-full" height="h-80" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Facturación y Plan</h1>
                    <p className="body-large text-gray-600 mt-1">Gestiona tu suscripción y pagos con USDT (TRC-20)</p>
                </div>
                <button onClick={fetchData} className="btn btn-ghost">
                    <RefreshCw size={16} /> Actualizar
                </button>
            </div>

            {/* CURRENT SUBSCRIPTION CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card card-padding">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-xl">
                                {PLANS[currentPlanKey]?.icon || <Bitcoin size={24} className="text-gray-500" />}
                            </div>
                            <div>
                                <p className="caption text-gray-500">Plan contratado</p>
                                <h2 className="heading-2">{PLANS[currentPlanKey]?.nombre || currentPlanKey.toUpperCase()}</h2>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${statusInfo.cls}`}>
                            {statusInfo.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <div className="flex items-center gap-2 caption text-gray-500 mb-1">
                                <Bitcoin size={14} /> Método de pago
                            </div>
                            <p className="font-bold text-gray-900">💎 USDT TRC-20</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 caption text-gray-500 mb-1">
                                <Calendar size={14} /> {subData?.cancelAtPeriodEnd ? 'Acceso hasta' : 'Periodo actual hasta'}
                            </div>
                            <p className="font-semibold text-gray-900">{formatDate(subData?.currentPeriodEnd)}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 caption text-gray-500 mb-1">
                                <ShieldCheck size={14} /> Precio mensual
                            </div>
                            <p className="font-bold text-gray-900">${PLANS[currentPlanKey]?.precioUsdt || 0} USDT</p>
                        </div>
                    </div>

                    {subData?.status === 'INCOMPLETE' && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                            <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                <strong>Pago en verificación.</strong> Estamos confirmando tu transacción USDT. Esto puede tomar hasta 24 horas.
                            </p>
                        </div>
                    )}
                </div>

                {/* TRIAL INFO */}
                <div className="card card-padding flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💎</span>
                    </div>
                    <h3 className="heading-3">Pago 100% Cripto</h3>
                    <p className="body-small text-gray-500">Sin tarjeta. Sin bancos. Solo USDT (TRC-20) a precio fijo USD.</p>
                </div>
            </div>

            {/* USAGE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Barberos', current: contextBarberia?.barberos?.length || 0, max: PLANS[currentPlanKey]?.limites?.maxBarberos },
                    { label: 'Servicios', current: contextBarberia?.servicios?.length || 0, max: PLANS[currentPlanKey]?.limites?.maxServicios },
                    { label: 'Reservas/Mes', current: 0, max: PLANS[currentPlanKey]?.limites?.maxReservasMes },
                ].map((stat, i) => (
                    <div key={i} className="card card-padding">
                        <div className="flex items-center justify-between mb-2">
                            <p className="caption text-gray-500">{stat.label}</p>
                            <span className="text-sm font-bold text-gray-900">
                                {stat.current} / {stat.max === -1 ? '∞' : stat.max}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.max === -1 ? 30 : Math.min((stat.current / stat.max) * 100, 100)}%` }}
                                className="bg-emerald-500 h-full rounded-full"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* PAYMENT HISTORY */}
            <div>
                <h2 className="heading-2 mb-4">Historial de Pagos USDT</h2>
                {payments.length > 0 ? (
                    <div className="card overflow-hidden">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Fecha</th><th>Monto</th><th>Concepto</th><th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p, i) => (
                                    <tr key={i}>
                                        <td>{formatDate(p.date)}</td>
                                        <td className="font-bold">${p.amount} USDT</td>
                                        <td className="text-gray-600">{p.concept || 'Pago manual'}</td>
                                        <td><span className="badge badge-success">Confirmado</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="card card-padding text-center py-10 text-gray-400">
                        No hay pagos registrados aún.
                    </div>
                )}
            </div>

            {/* AVAILABLE PLANS */}
            <div>
                <h2 className="heading-2 mb-6">Cambiar Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.values(PLANS).map((plan) => {
                        const isCurrent = plan.key === currentPlanKey;
                        return (
                            <div
                                key={plan.key}
                                className={`card card-padding relative ${plan.highlighted ? 'ring-2 ring-purple-500' : ''} ${isCurrent ? 'ring-2 ring-emerald-500' : ''}`}
                            >
                                {plan.highlighted && !isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full">MÁS POPULAR</span>
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="mb-3"><span className="badge badge-success">Plan Actual</span></div>
                                )}

                                <div className="text-center mb-6">
                                    <div className="inline-flex p-3 bg-gray-100 rounded-xl mb-3">{plan.icon}</div>
                                    <h3 className="heading-3">{plan.nombre}</h3>
                                    <p className="body-small text-gray-500 mt-1 mb-3">{plan.descripcion}</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-black text-gray-900">${plan.precioUsdt}</span>
                                        <span className="text-gray-500 text-sm">USDT/mes</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                            <Check size={14} className="text-emerald-500 flex-shrink-0" /> {f}
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-100 mt-2">
                                        <span className="text-gray-500">Barberos</span>
                                        <span className="font-bold">{plan.limites.maxBarberos === -1 ? 'Ilimitados' : plan.limites.maxBarberos}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Reservas/mes</span>
                                        <span className="font-bold">{plan.limites.maxReservasMes === -1 ? 'Ilimitadas' : plan.limites.maxReservasMes}</span>
                                    </div>
                                </div>

                                <button
                                    className={`btn w-full ${isCurrent ? 'btn-ghost cursor-default' : 'btn-primary'}`}
                                    disabled={isCurrent}
                                    onClick={() => !isCurrent && setSelectedPlan(plan.key)}
                                >
                                    {isCurrent ? 'Plan Actual' : `Pagar $${plan.precioUsdt} USDT`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* USDT PAYMENT MODAL */}
            {selectedPlan && (
                <UsdtPaymentModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onSuccess={() => { setSelectedPlan(null); fetchData(); }}
                />
            )}
        </div>
    );
}

// Tiny helper — useParams might not be imported if not used via router
function useParams() {
    try {
        return require('react-router-dom').useParams();
    } catch {
        return {};
    }
}
