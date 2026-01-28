import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Stat, Button, Skeleton } from "../../../components/ui";
import { DollarSign, TrendingUp, Users, Clock, Receipt, PieChart, CreditCard, ArrowRight } from "lucide-react";
import { getReporte } from "../../../services/transactionService";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default function FinanzasDashboard() {
    const [loading, setLoading] = useState(true);
    const [reporte, setReporte] = useState(null);

    useEffect(() => {
        cargarReporte();
    }, []);

    const cargarReporte = async () => {
        try {
            setLoading(true);
            // Obtener reporte del mes actual
            const desde = dayjs().startOf('month').format('YYYY-MM-DD');
            const hasta = dayjs().endOf('month').format('YYYY-MM-DD');
            const data = await getReporte({ desde, hasta });
            setReporte(data);
        } catch (error) {
            console.error("Error cargando reporte:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <header>
                <h1 className="text-4xl font-black text-gradient-primary">
                    💰 Dashboard Financiero
                </h1>
                <p className="text-neutral-400 text-lg mt-2">
                    Resumen de ingresos y distribución del mes
                </p>
            </header>

            {/* KPIS */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rectangular" height="h-32" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Stat
                        title="Ingresos del Mes"
                        value={formatCurrency(reporte?.resumen?.totalIngresos)}
                        icon={<DollarSign />}
                        color="primary"
                        subtitle={`${reporte?.resumen?.totalTransacciones || 0} transacciones`}
                    />
                    <Stat
                        title="Pagado a Barberos"
                        value={formatCurrency(reporte?.resumen?.totalBarberos)}
                        icon={<Users />}
                        color="success"
                        subtitle={`${Math.round((reporte?.resumen?.totalBarberos / reporte?.resumen?.totalIngresos) * 100) || 50}% del total`}
                    />
                    <Stat
                        title="Pendiente de Pago"
                        value={formatCurrency(reporte?.resumen?.totalIngresos - reporte?.resumen?.totalBarberos - reporte?.resumen?.totalBarberia)}
                        icon={<Clock />}
                        color="warning"
                        badge={`${reporte?.resumen?.transaccionesAprobadas || 0} pendientes`}
                    />
                    <Stat
                        title="Comisión Barbería"
                        value={formatCurrency(reporte?.resumen?.totalBarberia)}
                        icon={<TrendingUp />}
                        color="accent"
                        subtitle={`${Math.round((reporte?.resumen?.totalBarberia / reporte?.resumen?.totalIngresos) * 100) || 50}% del total`}
                    />
                </div>
            )}

            {/* ACCESOS RÁPIDOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/finanzas/transacciones">
                    <Card className="hover:shadow-glow-primary transition-all cursor-pointer group">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl group-hover:bg-opacity-30 transition-all">
                                    <Receipt className="text-primary-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Ver Transacciones</h3>
                                    <p className="text-neutral-400 text-sm">Historial completo</p>
                                </div>
                            </div>
                            <ArrowRight className="text-neutral-600 group-hover:text-primary-500 transition-all" size={20} />
                        </div>
                    </Card>
                </Link>

                <Link to="/finanzas/revenue-split">
                    <Card className="hover:shadow-glow-primary transition-all cursor-pointer group">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent-500 bg-opacity-20 rounded-xl group-hover:bg-opacity-30 transition-all">
                                    <PieChart className="text-accent-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Configurar Splits</h3>
                                    <p className="text-neutral-400 text-sm">Porcentajes y reglas</p>
                                </div>
                            </div>
                            <ArrowRight className="text-neutral-600 group-hover:text-accent-500 transition-all" size={20} />
                        </div>
                    </Card>
                </Link>

                <Link to="/finanzas/pagos">
                    <Card className="hover:shadow-glow-primary transition-all cursor-pointer group">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-success-500 bg-opacity-20 rounded-xl group-hover:bg-opacity-30 transition-all">
                                    <CreditCard className="text-success-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Procesar Pagos</h3>
                                    <p className="text-neutral-400 text-sm">
                                        {reporte?.resumen?.transaccionesAprobadas > 0 && (
                                            <span className="text-warning-500 font-semibold">
                                                {reporte.resumen.transaccionesAprobadas} pendientes
                                            </span>
                                        )}
                                        {!reporte?.resumen?.transaccionesAprobadas && "Sin pendientes"}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="text-neutral-600 group-hover:text-success-500 transition-all" size={20} />
                        </div>
                    </Card>
                </Link>
            </div>

            {/* TOP BARBEROS */}
            {!loading && reporte?.topBarberos && reporte.topBarberos.length > 0 && (
                <Card>
                    <div className="p-6 border-b border-neutral-800">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="text-primary-500" size={24} />
                            Top Barberos por Ingresos
                        </h3>
                        <p className="text-neutral-400 text-sm mt-1">Los barberos con mayores ingresos este mes</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {reporte.topBarberos.map((barbero, idx) => (
                                <div key={barbero._id} className="flex items-center justify-between p-4 bg-neutral-800 bg-opacity-50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{barbero.nombre}</p>
                                            <p className="text-neutral-400 text-sm">{barbero.totalTransacciones} transacciones</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-lg">{formatCurrency(barbero.totalIngresos)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* EMPTY STATE */}
            {!loading && (!reporte?.resumen || reporte.resumen.totalTransacciones === 0) && (
                <Card className="border-neutral-700">
                    <div className="py-16 text-center">
                        <div className="w-20 h-20 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="text-primary-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Sin transacciones este mes
                        </h3>
                        <p className="text-neutral-400 mb-6">
                            Las transacciones se generarán automáticamente al completar reservas
                        </p>
                        <Link to="/agenda">
                            <Button variant="primary">
                                Ir a Agenda
                            </Button>
                        </Link>
                    </div>
                </Card>
            )}
        </div>
    );
}
