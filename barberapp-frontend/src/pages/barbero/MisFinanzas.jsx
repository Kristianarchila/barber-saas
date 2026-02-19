import { useEffect, useState } from "react";
import { getMiBalance, getMisTransacciones } from "../../services/transactionService";
import { Card, Button, Stat, Skeleton, Badge } from "../../components/ui";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
    DollarSign,
    TrendingUp,
    Wallet,
    Clock,
    ArrowUpRight,
    History,
    Info,
    ChevronRight
} from "lucide-react";

dayjs.locale("es");

export default function MisFinanzas() {
    const [balance, setBalance] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarBalance();
    }, []);

    const cargarBalance = async () => {
        try {
            setLoading(true);
            const [balanceData, transData] = await Promise.all([
                getMiBalance(),
                getMisTransacciones({ limit: 5 })
            ]);
            setBalance(balanceData);
            setMovimientos(transData || []);
        } catch (err) {
            console.error("Error cargando balance:", err);
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

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-32 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-100 rounded-xl" />
                <div className="h-64 bg-gray-100 rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
            {/* HEADER FINANZAS */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <Wallet className="text-blue-600" size={32} />
                        Mis Finanzas
                    </h1>
                    <p className="body-large text-gray-600 mt-2">Control total de tus ganancias y cobros</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="caption text-gray-400">Estado de Cuenta</p>
                        <p className="text-green-600 font-semibold text-sm">Activo y Verificado</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <Button onClick={cargarBalance} variant="ghost" className="text-gray-600 hover:text-gray-900 rounded-lg">
                        Actualizar
                    </Button>
                </div>
            </header>

            {/* BALANCE CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Card Principal: Lo que cobrarás */}
                <Card className="lg:col-span-8 bg-blue-600 text-white border-none p-10 relative overflow-hidden group shadow-lg rounded-xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={120} strokeWidth={3} />
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                            <Clock size={18} />
                            <span className="text-sm font-bold uppercase tracking-wider">Pendiente de Cobro</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-blue-100 font-medium">Monto acumulado hasta hoy:</p>
                            <h2 className="text-6xl font-black tracking-tight">
                                {formatCurrency(balance?.pendiente?.totalMontoBarbero)}
                            </h2>
                        </div>

                        <div className="pt-6 flex flex-wrap gap-4">
                            <div className="bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/10 flex-1 min-w-[200px]">
                                <p className="text-blue-100/60 caption mb-1">Citas Realizadas</p>
                                <p className="text-2xl font-black">{balance?.pendiente?.cantidadReservas || 0}</p>
                            </div>
                            <div className="bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/10 flex-1 min-w-[200px]">
                                <p className="text-blue-100/60 caption mb-1">Periodo Actual</p>
                                <p className="text-2xl font-black">Semanal</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Card Secundaria: Total Histórico */}
                <Card className="lg:col-span-4 bg-white border-gray-200 p-8 flex flex-col justify-between rounded-xl shadow-sm">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <DollarSign size={28} />
                        </div>
                        <div>
                            <p className="caption text-gray-400 mb-1">Total Generado (Mes)</p>
                            <h3 className="text-3xl font-black text-gray-900">
                                {formatCurrency(balance?.total?.totalMontoBarbero)}
                            </h3>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-200 mt-8">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Comisiones Totales</span>
                            <span className="text-red-600 font-bold">-{formatCurrency(balance?.total?.totalComision)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* DETALLE Y CONFIGURACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Ultimos Movimientos */}
                <Card className="border-gray-200 bg-white p-8 flex flex-col justify-between rounded-xl shadow-sm">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="heading-3 flex items-center gap-2">
                                <History className="text-blue-600" size={20} /> Últimos Servicios
                            </h3>
                            <Badge variant="neutral">Top 5</Badge>
                        </div>

                        <div className="space-y-4">
                            {movimientos.length > 0 ? (
                                movimientos.map((m, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <TrendingUp size={18} />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-bold text-sm">{m.descripcion || 'Servicio'}</p>
                                                <p className="text-gray-500 text-xs">{dayjs(m.createdAt).format('DD MMM, HH:mm')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-900 font-black">{formatCurrency(m.montosFinales?.montoBarbero)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 text-sm">No hay transacciones recientes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button variant="ghost" className="w-full mt-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                        Ver Historial Completo
                    </Button>
                </Card>

                {/* Información de Pago */}
                <Card className="border-gray-200 bg-white p-8 rounded-xl shadow-sm">
                    <div className="space-y-6">
                        <h3 className="heading-3 flex items-center gap-2">
                            <Info className="text-blue-600" size={20} /> Información de Pago
                        </h3>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Tus ganancias se liquidan cada <span className="text-gray-900 font-bold">Lunes</span> automáticamente a tu cuenta registrada.
                            </p>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-xs">
                                    <span className="caption text-gray-400">Banco</span>
                                    <span className="text-gray-900 font-bold">Cuenta registrada</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="caption text-gray-400">Estado</span>
                                    <span className="text-green-600 font-bold">Verificada</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                            <Info size={20} className="text-amber-600 shrink-0" />
                            <p className="text-amber-900 text-xs leading-relaxed">
                                Asegúrate de que tus datos bancarios estén actualizados para evitar retrasos en tus pagos.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
