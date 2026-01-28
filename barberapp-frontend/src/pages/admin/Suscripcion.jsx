import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Badge, Button, Skeleton } from '../../components/ui';
import { CreditCard, Check, X, Crown, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useBarberia } from '../../context/BarberiaContext';

export default function Suscripcion() {
    const { barberia, loading: contextLoading } = useBarberia();
    const [loading, setLoading] = useState(true);
    const { slug } = useParams();

    // Catálogo de planes (sincronizado con backend)
    const PLANS_CATALOG = {
        basico: {
            nombre: 'Básico',
            precio: 29990,
            descripcion: 'Ideal para barberías pequeñas empezando',
            limites: {
                maxBarberos: 3,
                maxReservasMes: 100,
                maxServicios: 10,
                maxFotos: 5
            },
            features: {
                reservasOnline: true,
                gestionHorarios: true,
                gestionServicios: true,
                notificacionesEmail: false,
                reportesBasicos: true,
                reportesAvanzados: false,
                integracionWhatsApp: false,
                personalizacion: false,
                soportePrioritario: false,
                multipleAdmins: false
            }
        },
        pro: {
            nombre: 'Pro',
            precio: 59990,
            descripcion: 'Para barberías en crecimiento',
            limites: {
                maxBarberos: 10,
                maxReservasMes: 500,
                maxServicios: 30,
                maxFotos: 20
            },
            features: {
                reservasOnline: true,
                gestionHorarios: true,
                gestionServicios: true,
                notificacionesEmail: true,
                reportesBasicos: true,
                reportesAvanzados: true,
                integracionWhatsApp: true,
                personalizacion: true,
                soportePrioritario: false,
                multipleAdmins: true
            }
        },
        premium: {
            nombre: 'Premium',
            precio: 99990,
            descripcion: 'Sin límites para grandes operaciones',
            limites: {
                maxBarberos: -1,
                maxReservasMes: -1,
                maxServicios: -1,
                maxFotos: -1
            },
            features: {
                reservasOnline: true,
                gestionHorarios: true,
                gestionServicios: true,
                notificacionesEmail: true,
                reportesBasicos: true,
                reportesAvanzados: true,
                integracionWhatsApp: true,
                personalizacion: true,
                soportePrioritario: true,
                multipleAdmins: true
            }
        }
    };

    useEffect(() => {
        // Wait for context to load
        if (!contextLoading) {
            setLoading(false);
        }
    }, [contextLoading]);

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
            activa: { variant: 'success', label: 'Activa' },
            trial: { variant: 'warning', label: 'Trial' },
            suspendida: { variant: 'error', label: 'Suspendida' },
            cancelada: { variant: 'neutral', label: 'Cancelada' }
        };
        return estados[estado] || { variant: 'neutral', label: estado };
    };

    const getPlanIcon = (planName) => {
        const icons = {
            basico: <Zap className="text-primary-500" size={24} />,
            pro: <TrendingUp className="text-secondary-500" size={24} />,
            premium: <Crown className="text-accent-500" size={24} />
        };
        return icons[planName] || <CreditCard size={24} />;
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <Skeleton variant="rectangular" width="w-64" height="h-10" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rectangular" height="h-96" />
                    ))}
                </div>
            </div>
        );
    }

    const currentPlan = barberia?.plan || 'basico';
    const currentPlanData = PLANS_CATALOG[currentPlan];
    const estadoBadge = getEstadoBadge(barberia?.estado);

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <header className="space-y-2">
                <h1 className="text-4xl font-black text-gradient-primary">
                    💳 Suscripción
                </h1>
                <p className="text-neutral-400 text-lg">
                    Gestiona tu plan y facturación
                </p>
            </header>

            {/* CURRENT SUBSCRIPTION */}
            <Card variant="gradient" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-10 rounded-full blur-3xl" />
                <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white bg-opacity-10 rounded-xl">
                                {getPlanIcon(currentPlan)}
                            </div>
                            <div>
                                <p className="text-white opacity-80 text-sm font-medium uppercase tracking-wider">
                                    Plan Actual
                                </p>
                                <h2 className="text-3xl font-black text-white">
                                    {currentPlanData?.nombre}
                                </h2>
                            </div>
                        </div>
                        <Badge variant={estadoBadge.variant}>
                            {estadoBadge.label}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white border-opacity-20">
                        <div>
                            <p className="text-white opacity-60 text-xs mb-1">Precio Mensual</p>
                            <p className="text-white font-bold text-2xl">{formatCurrency(currentPlanData?.precio)}</p>
                        </div>
                        <div>
                            <p className="text-white opacity-60 text-xs mb-1">Próximo Pago</p>
                            <p className="text-white font-bold text-lg">{formatDate(barberia?.proximoPago)}</p>
                        </div>
                        <div>
                            <p className="text-white opacity-60 text-xs mb-1">Días Restantes</p>
                            <p className="text-white font-bold text-lg">
                                {barberia?.proximoPago
                                    ? Math.ceil((new Date(barberia.proximoPago) - new Date()) / (1000 * 60 * 60 * 24))
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* USAGE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-400">Barberos</p>
                            <Badge variant="primary" size="sm">
                                {barberia?.barberos?.length || 0} / {currentPlanData?.limites.maxBarberos === -1 ? '∞' : currentPlanData?.limites.maxBarberos}
                            </Badge>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                                className="gradient-primary h-full rounded-full transition-all"
                                style={{
                                    width: `${currentPlanData?.limites.maxBarberos === -1 ? 50 : Math.min((barberia?.barberos?.length || 0) / currentPlanData?.limites.maxBarberos * 100, 100)}%`
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-400">Servicios</p>
                            <Badge variant="info" size="sm">
                                {barberia?.servicios?.length || 0} / {currentPlanData?.limites.maxServicios === -1 ? '∞' : currentPlanData?.limites.maxServicios}
                            </Badge>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                                className="gradient-secondary h-full rounded-full transition-all"
                                style={{
                                    width: `${currentPlanData?.limites.maxServicios === -1 ? 50 : Math.min((barberia?.servicios?.length || 0) / currentPlanData?.limites.maxServicios * 100, 100)}%`
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-400">Reservas/Mes</p>
                            <Badge variant="success" size="sm">
                                {currentPlanData?.limites.maxReservasMes === -1 ? '∞' : currentPlanData?.limites.maxReservasMes}
                            </Badge>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                                className="gradient-success h-full rounded-full transition-all"
                                style={{ width: '30%' }}
                            />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-400">Fotos</p>
                            <Badge variant="warning" size="sm">
                                0 / {currentPlanData?.limites.maxFotos === -1 ? '∞' : currentPlanData?.limites.maxFotos}
                            </Badge>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                                className="gradient-accent h-full rounded-full transition-all"
                                style={{ width: '0%' }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* AVAILABLE PLANS */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Planes Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(PLANS_CATALOG).map(([key, plan]) => {
                        const isCurrentPlan = key === currentPlan;
                        return (
                            <Card
                                key={key}
                                className={`relative ${isCurrentPlan ? 'border-2 border-primary-500' : ''}`}
                            >
                                {isCurrentPlan && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Badge variant="primary">Plan Actual</Badge>
                                    </div>
                                )}

                                <div className="p-6 space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex p-4 bg-primary-500 bg-opacity-20 rounded-2xl mb-4">
                                            {getPlanIcon(key)}
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2">{plan.nombre}</h3>
                                        <p className="text-neutral-400 text-sm mb-4">{plan.descripcion}</p>
                                        <div className="text-4xl font-black text-gradient-primary">
                                            {formatCurrency(plan.precio)}
                                        </div>
                                        <p className="text-neutral-500 text-xs mt-1">por mes</p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-neutral-500 uppercase">Límites</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-400">Barberos</span>
                                                <span className="font-bold text-white">
                                                    {plan.limites.maxBarberos === -1 ? '∞' : plan.limites.maxBarberos}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-400">Reservas/mes</span>
                                                <span className="font-bold text-white">
                                                    {plan.limites.maxReservasMes === -1 ? '∞' : plan.limites.maxReservasMes}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-400">Servicios</span>
                                                <span className="font-bold text-white">
                                                    {plan.limites.maxServicios === -1 ? '∞' : plan.limites.maxServicios}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-neutral-500 uppercase">Características</p>
                                        <div className="space-y-2">
                                            {Object.entries(plan.features).map(([feature, enabled]) => (
                                                <div key={feature} className="flex items-center gap-2">
                                                    {enabled ? (
                                                        <Check size={16} className="text-success-500" />
                                                    ) : (
                                                        <X size={16} className="text-neutral-600" />
                                                    )}
                                                    <span className={`text-sm ${enabled ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant={isCurrentPlan ? 'ghost' : 'primary'}
                                        className="w-full"
                                        disabled={isCurrentPlan}
                                    >
                                        {isCurrentPlan ? 'Plan Actual' : 'Cambiar a ' + plan.nombre}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* CONTACT SUPPORT */}
            <Card className="border-warning-500 border-opacity-30">
                <div className="flex items-start gap-4 p-6">
                    <div className="p-3 bg-warning-500 bg-opacity-20 rounded-xl">
                        <AlertCircle className="text-warning-500" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">
                            ¿Necesitas cambiar tu plan?
                        </h3>
                        <p className="text-neutral-400 text-sm mb-4">
                            Contacta con soporte para actualizar tu suscripción o resolver cualquier duda sobre facturación.
                        </p>
                        <Button variant="primary" size="sm">
                            Contactar Soporte
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
