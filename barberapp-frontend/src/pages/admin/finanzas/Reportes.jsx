import { useState, useEffect } from "react";
import { getReporte } from "../../../services/transactionService";
import { Card, Button, Badge, Skeleton } from "../../../components/ui";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Users as UsersIcon,
    Scissors,
    Download,
    Filter,
    BarChart3,
    ArrowUpRight,
    PieChart as PieIcon
} from "lucide-react";
import dayjs from "dayjs";

export default function Reportes() {
    const [loading, setLoading] = useState(true);
    const [reporte, setReporte] = useState(null);
    const [filters, setFilters] = useState({
        desde: dayjs().startOf('month').format('YYYY-MM-DD'),
        hasta: dayjs().endOf('month').format('YYYY-MM-DD')
    });

    useEffect(() => {
        fetchReporte();
    }, [filters]);

    const fetchReporte = async () => {
        try {
            setLoading(true);
            const data = await getReporte(filters);
            setReporte(data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
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

    const getPercentage = (value, total) => {
        if (!total) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <div className="space-y-8 animate-slide-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gradient-primary flex items-center gap-3">
                        <TrendingUp size={40} className="text-primary-500" />
                        Reportes & Analytics
                    </h1>
                    <p className="text-neutral-400 text-lg mt-2">
                        Análisis profundo de la rentabilidad y rendimiento de tu negocio
                    </p>
                </div>
                <div className="flex items-center gap-3 p-2 bg-neutral-900 rounded-[28px] border border-neutral-800">
                    <div className="flex items-center gap-2 px-4 py-2">
                        <Calendar size={18} className="text-primary-500" />
                        <input
                            type="date"
                            className="bg-transparent text-white font-bold outline-none [color-scheme:dark]"
                            value={filters.desde}
                            onChange={(e) => setFilters({ ...filters, desde: e.target.value })}
                        />
                    </div>
                    <div className="w-px h-8 bg-neutral-800" />
                    <div className="flex items-center gap-2 px-4 py-2">
                        <input
                            type="date"
                            className="bg-transparent text-white font-bold outline-none [color-scheme:dark]"
                            value={filters.hasta}
                            onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="h-40" className="rounded-[40px]" />)}
                </div>
            ) : (
                <>
                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="p-8 bg-neutral-900 border-neutral-800 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary-500 opacity-5 rounded-full group-hover:scale-150 transition-all duration-700" />
                            <div className="relative z-10 flex gap-6 items-center">
                                <div className="p-4 bg-primary-500 bg-opacity-20 rounded-3xl">
                                    <DollarSign className="text-primary-500" size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Ingresos Brutos</p>
                                    <h3 className="text-3xl font-black text-white mt-1">{formatCurrency(reporte?.resumen?.totalIngresos)}</h3>
                                    <p className="text-xs text-success-500 font-bold mt-1 flex items-center gap-1">
                                        <TrendingUp size={14} /> +12% vs anterior
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 bg-neutral-900 border-neutral-800 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-success-500 opacity-5 rounded-full group-hover:scale-150 transition-all duration-700" />
                            <div className="relative z-10 flex gap-6 items-center">
                                <div className="p-4 bg-success-500 bg-opacity-20 rounded-3xl">
                                    <UsersIcon className="text-success-500" size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Costo Staff</p>
                                    <h3 className="text-3xl font-black text-white mt-1">{formatCurrency(reporte?.resumen?.totalBarberos)}</h3>
                                    <p className="text-xs text-neutral-500 font-bold mt-1">
                                        Representa el {getPercentage(reporte?.resumen?.totalBarberos, reporte?.resumen?.totalIngresos)}%
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 bg-neutral-900 border-neutral-800 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-accent-500 opacity-5 rounded-full group-hover:scale-150 transition-all duration-700" />
                            <div className="relative z-10 flex gap-6 items-center">
                                <div className="p-4 bg-accent-500 bg-opacity-20 rounded-3xl">
                                    <TrendingUp className="text-accent-500" size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Utilidad Neta</p>
                                    <h3 className="text-3xl font-black text-white mt-1">{formatCurrency(reporte?.resumen?.totalBarberia)}</h3>
                                    <p className="text-xs text-accent-500 font-bold mt-1">
                                        Margen de {getPercentage(reporte?.resumen?.totalBarberia, reporte?.resumen?.totalIngresos)}%
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* RENTABILIDAD POR STAFF */}
                        <Card className="p-8 bg-neutral-900 border-neutral-800 rounded-[40px]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <UsersIcon size={20} className="text-primary-500" />
                                        Rendimiento Staff
                                    </h3>
                                    <p className="text-neutral-500 text-xs mt-1">Ingresos generados por cada barbero</p>
                                </div>
                                <BarChart3 className="text-neutral-800" size={40} />
                            </div>

                            <div className="space-y-6">
                                {reporte?.topBarberos?.map((barbero) => {
                                    const percent = getPercentage(barbero.totalIngresos, reporte?.resumen?.totalIngresos);
                                    return (
                                        <div key={barbero._id} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-neutral-300">{barbero.nombre}</span>
                                                <span className="font-black text-white">{formatCurrency(barbero.totalIngresos)}</span>
                                            </div>
                                            <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black uppercase text-neutral-600">
                                                <span>{barbero.totalTransacciones} servicios</span>
                                                <span>{percent}% del total</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* TENDENCIA MENSUAL */}
                        <Card className="p-8 bg-neutral-900 border-neutral-800 rounded-[40px]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <PieIcon size={20} className="text-primary-500" />
                                        Tendencia de Ingresos
                                    </h3>
                                    <p className="text-neutral-500 text-xs mt-1">Comparativa de los últimos meses</p>
                                </div>
                            </div>

                            <div className="flex items-end justify-between h-64 mt-12 px-4">
                                {reporte?.ingresosPorMes?.reverse().map((mes, idx) => {
                                    const maxIngreso = Math.max(...reporte.ingresosPorMes.map(m => m.totalIngresos));
                                    const height = getPercentage(mes.totalIngresos, maxIngreso);
                                    const monthName = dayjs().month(mes._id.month - 1).format('MMM');

                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-4 w-12 group">
                                            <div className="relative w-full">
                                                {/* Tooltip on hover */}
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                                    {formatCurrency(mes.totalIngresos)}
                                                </div>
                                                {/* Bar */}
                                                <div
                                                    className={`w-full rounded-t-xl transition-all duration-1000 bg-gradient-to-t ${idx === reporte.ingresosPorMes.length - 1
                                                            ? "from-primary-600 to-primary-400 shadow-glow-primary"
                                                            : "from-neutral-800 to-neutral-700"
                                                        }`}
                                                    style={{ height: `${height * 1.5}px` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter">{monthName}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 p-4 bg-neutral-950 rounded-2xl flex items-center gap-4 justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary-500 rounded-full" />
                                    <span className="text-[10px] font-bold text-neutral-500 font-black uppercase">Mes Actual</span>
                                </div>
                                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-black">
                                    Ver Proyección <ArrowUpRight size={14} />
                                </Button>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {/* FOOTER ACTIONS */}
            <div className="flex flex-col md:flex-row gap-6 pt-8">
                <Button variant="ghost" className="flex-1 bg-neutral-900 border-neutral-800 p-8 rounded-[40px] text-left justify-start gap-6 hover:shadow-glow-primary transition-all">
                    <div className="p-4 bg-primary-500 bg-opacity-20 rounded-3xl">
                        <Download className="text-primary-500" size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-white text-lg lowercase">Exportar Reporte Completo</h4>
                        <p className="text-neutral-500 text-sm">PDF, Excel o CSV con todos los datos filtrados.</p>
                    </div>
                </Button>

                <Button variant="ghost" className="flex-1 bg-neutral-900 border-neutral-800 p-8 rounded-[40px] text-left justify-start gap-6">
                    <div className="p-4 bg-accent-500 bg-opacity-20 rounded-3xl">
                        <Scissors className="text-accent-500" size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-white text-lg lowercase">Servicios más Rentables</h4>
                        <p className="text-neutral-500 text-sm">Visualizar cuáles servicios generan mayor margen.</p>
                    </div>
                </Button>
            </div>
        </div>
    );
}
