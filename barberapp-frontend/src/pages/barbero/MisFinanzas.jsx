import { useEffect, useState } from "react";
import { Card, Stat, Skeleton, Button } from "../../components/ui";
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Wallet,
    ArrowUpRight,
    TrendingDown,
    Info
} from "lucide-react";
import { getMiBalance } from "../../services/transactionService";
import { Link, useParams } from "react-router-dom";

export default function MisFinanzas() {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        cargarBalance();
    }, []);

    const cargarBalance = async () => {
        try {
            setLoading(true);
            const data = await getMiBalance();
            setBalance(data);
        } catch (error) {
            console.error("Error cargando balance:", error);
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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gradient-primary">
                        💰 Mi Billetera
                    </h1>
                    <p className="text-slate-400 text-lg mt-2">
                        Controla tus ganancias y transacciones en tiempo real
                    </p>
                </div>
                <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                        <Wallet className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Estado de Cuenta</p>
                        <p className="text-white font-black text-xl">
                            {loading ? "..." : balance?.liquidado ? "Al día" : "Pagos Pendientes"}
                        </p>
                    </div>
                </div>
            </header>

            {/* KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="h-32" />)
                ) : (
                    <>
                        <Stat
                            title="Ganancias Totales"
                            value={formatCurrency(balance?.total?.totalMontoBarbero)}
                            icon={<DollarSign />}
                            color="success"
                            trend="up"
                            change="Balance histórico"
                            subtitle={`${balance?.total?.totalTransacciones || 0} servicios realizados`}
                        />
                        <Stat
                            title="Por Cobrar"
                            value={formatCurrency(balance?.pendiente?.totalMontoBarbero)}
                            icon={<Wallet />}
                            color="warning"
                            badge={`${balance?.pendiente?.totalTransacciones || 0} pendientes`}
                            subtitle="Sujeto a liquidación del admin"
                        />
                        <Stat
                            title="Eficiencia"
                            value={`${balance?.porcentajeEfectividad || 0}%`}
                            icon={<TrendingUp />}
                            color="accent"
                            subtitle="Cumplimiento de metas"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONFIGURACIÓN APLICADA */}
                <Card className="lg:col-span-1 border-slate-800 bg-slate-900/40">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Info size={18} className="text-indigo-400" />
                            Mi Configuración
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                            <span className="text-slate-400 text-sm">Split Base</span>
                            <span className="text-white font-bold">{balance?.configuracion?.porcentajeBarbero || 50}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                            <span className="text-slate-400 text-sm">Cobro por Producto</span>
                            <span className="text-white font-bold">$0</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-400 text-sm">Próximo Pago</span>
                            <span className="text-indigo-400 font-bold">Cada Lunes</span>
                        </div>

                        <div className="p-4 bg-indigo-500/10 rounded-xl mt-4">
                            <p className="text-xs text-indigo-300 leading-relaxed italic">
                                "Tus ganancias se calculan automáticamente restando la comisión de la barbería e impuestos configurados."
                            </p>
                        </div>
                    </div>
                </Card>

                {/* ACCIONES Y RECOMENDACIONES */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-r from-indigo-900/20 to-slate-900/20 border-indigo-500/30">
                        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2">
                                    ¿Quieres aumentar tus ingresos?
                                </h3>
                                <p className="text-indigo-300/80">
                                    Recuerda invitar a tus clientes a reservar por la web para mantener tu agenda llena.
                                </p>
                            </div>
                            <Link to={`/${slug}/barbero/citas`}>
                                <Button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-6 rounded-2xl font-black text-lg shadow-glow-primary">
                                    Ver Agenda <ArrowUpRight className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link to={`/${slug}/barbero/finanzas/transacciones`}>
                            <Card className="hover:bg-slate-800/50 transition-all cursor-pointer group">
                                <div className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-indigo-500/20 transition-all">
                                        <Calendar className="text-slate-400 group-hover:text-indigo-400" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Ver Historial</h4>
                                        <p className="text-xs text-slate-500">Revisa servicio por servicio</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                        <Card className="opacity-50 grayscale cursor-not-allowed">
                            <div className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-xl">
                                    <TrendingUp className="text-slate-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold">Mis Reportes</h4>
                                    <p className="text-xs text-slate-500">Próximamente...</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
