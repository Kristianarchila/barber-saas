import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Stat, Button, Skeleton, Badge } from "../../../components/ui";
import { DollarSign, TrendingUp, Users, Clock, Receipt, PieChart, CreditCard, ArrowRight, Package, Calendar, RefreshCcw } from "lucide-react";
import { getReporte } from "../../../services/transactionService";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default function FinanzasDashboard() {
    const [loading, setLoading] = useState(true);
    const [reporte, setReporte] = useState(null);
    const [rango, setRango] = useState({
        desde: dayjs().startOf('month').format('YYYY-MM-DD'),
        hasta: dayjs().endOf('month').format('YYYY-MM-DD')
    });

    useEffect(() => {
        cargarReporte();
    }, []);

    const cargarReporte = async () => {
        try {
            setLoading(true);
            const data = await getReporte({
                desde: rango.desde,
                hasta: rango.hasta
            });
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <DollarSign className="text-blue-600" size={32} />
                        Dashboard Financiero
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Resumen de ingresos y rentabilidad operativa
                    </p>
                </div>
                {!loading && reporte && (
                    <div className="flex items-center gap-4 bg-white border border-gray-100 p-2 pr-4 rounded-2xl shadow-sm">
                        <div className={`w-12 h-12 ${reporte.crecimiento >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} rounded-xl flex items-center justify-center font-bold`}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="caption text-gray-400 font-bold uppercase tracking-wider">Crecimiento</p>
                            <p className={`text-xl font-black ${reporte.crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {reporte.crecimiento >= 0 ? '+' : ''}{reporte.crecimiento}%
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* FILTROS DE FECHA */}
            <Card className="flex flex-col md:flex-row items-center gap-6 p-6 shadow-sm border-none ring-1 ring-gray-100">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="caption text-gray-400 font-bold uppercase tracking-widest">Rango de Fecha</p>
                        <p className="text-gray-900 font-black text-sm">Selecciona el periodo</p>
                    </div>
                </div>

                <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                    <input
                        type="date"
                        value={rango.desde}
                        onChange={(e) => setRango({ ...rango, desde: e.target.value })}
                        className="input flex-1 font-bold"
                    />
                    <span className="text-gray-400 font-black">a</span>
                    <input
                        type="date"
                        value={rango.hasta}
                        onChange={(e) => setRango({ ...rango, hasta: e.target.value })}
                        className="input flex-1 font-bold"
                    />
                </div>

                <Button
                    className="btn-primary w-full md:w-auto px-10 shadow-lg shadow-blue-100"
                    onClick={cargarReporte}
                    disabled={loading}
                >
                    {loading ? (
                        <RefreshCcw size={18} className="animate-spin" />
                    ) : (
                        "FILTRAR DÍAS"
                    )}
                </Button>
            </Card>

            {/* RENTABILIDAD & GAUGES */}
            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <Card className="lg:col-span-4 bg-white shadow-sm border-none ring-1 ring-gray-100 p-8 flex flex-col items-center justify-center text-center">
                        <div className="relative">
                            <svg className="w-48 h-24" viewBox="0 0 100 50">
                                <path
                                    d="M 10 50 A 40 40 0 0 1 90 50"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 10 50 A 40 40 0 0 1 90 50"
                                    fill="none"
                                    stroke="url(#gradient-gauge)"
                                    strokeWidth="10"
                                    strokeDasharray={`${Math.round(((reporte?.resumen?.totalBarberia / reporte?.resumen?.totalIngresos) * 126) || 0)} 126`}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="gradient-gauge" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#2563eb" />
                                        <stop offset="100%" stopColor="#60a5fa" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-x-0 bottom-0 text-3xl font-black text-gray-900">
                                {Math.round((reporte?.resumen?.totalBarberia / reporte?.resumen?.totalIngresos) * 100) || 0}%
                            </div>
                        </div>
                        <h3 className="mt-4 font-black text-gray-900 uppercase tracking-widest text-xs">Margen de Barbería</h3>
                        <p className="text-gray-500 text-xs mt-1">Participación sobre ingresos totales</p>
                    </Card>

                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 flex flex-col justify-between group hover:ring-blue-200 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                                    <DollarSign size={24} />
                                </div>
                                <div className="text-right">
                                    <p className="caption text-gray-400 font-bold uppercase tracking-widest">Ingresos Hoy</p>
                                    <h4 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(reporte?.resumenHoy?.ingresos)}</h4>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xs text-green-600 font-black flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                    <TrendingUp size={14} /> {reporte?.resumenHoy?.transacciones} ventas
                                </span>
                                <div className="caption text-gray-400 font-bold uppercase">Caja Activa</div>
                            </div>
                        </Card>

                        <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 flex flex-col justify-between hover:ring-red-200 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-red-50 rounded-2xl text-red-600">
                                    <CreditCard size={24} />
                                </div>
                                <div className="text-right">
                                    <p className="caption text-gray-400 font-bold uppercase tracking-widest">Impuestos Est. (19%)</p>
                                    <h4 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(reporte?.resumen?.totalImpuestos)}</h4>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-bold italic">Cifra proyectada mes</span>
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[19%]" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* KPIS */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} variant="rectangular" height="h-32" className="rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit mb-4">
                            <DollarSign size={20} />
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Ingresos Mes</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(reporte?.resumen?.totalIngresos)}</h3>
                        <p className="caption text-gray-400 mt-2">{reporte?.resumen?.totalTransacciones || 0} transacciones</p>
                    </div>

                    <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 w-fit mb-4">
                            <Users size={20} />
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Pagado Staff</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(reporte?.resumen?.totalBarberos)}</h3>
                        <p className="caption text-gray-400 mt-2">{Math.round((reporte?.resumen?.totalBarberos / reporte?.resumen?.totalIngresos) * 100) || 0}% del total</p>
                    </div>

                    <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600 w-fit mb-4">
                            <Clock size={20} />
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Pendiente Pago</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">
                            {formatCurrency(reporte?.resumen?.totalIngresos - reporte?.resumen?.totalBarberos - reporte?.resumen?.totalBarberia)}
                        </h3>
                        <div className="inline-block px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded mt-2 uppercase">
                            {reporte?.resumen?.transaccionesAprobadas || 0} por liquidar
                        </div>
                    </div>

                    <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 w-fit mb-4">
                            <TrendingUp size={20} />
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Comisión Local</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(reporte?.resumen?.totalBarberia)}</h3>
                        <p className="caption text-gray-400 mt-2">{Math.round((reporte?.resumen?.totalBarberia / reporte?.resumen?.totalIngresos) * 100) || 0}% de utilidad</p>
                    </div>
                </div>
            )}

            {/* ACCESOS RÁPIDOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link to="/admin/finanzas/transacciones">
                    <Card className="hover:shadow-md transition-all cursor-pointer group border-none ring-1 ring-gray-100 py-2">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all text-gray-400">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Ver Transacciones</h3>
                                    <p className="caption text-gray-500">Historial de movimientos</p>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-300 group-hover:text-blue-600 transition-all" size={20} />
                        </div>
                    </Card>
                </Link>

                <Link to="/admin/finanzas/revenue-split">
                    <Card className="hover:shadow-md transition-all cursor-pointer group border-none ring-1 ring-gray-100 py-2">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all text-gray-400">
                                    <PieChart size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Configurar Splits</h3>
                                    <p className="caption text-gray-500">Porcentajes y reglas</p>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-300 group-hover:text-indigo-600 transition-all" size={20} />
                        </div>
                    </Card>
                </Link>

                <Link to="/admin/finanzas/pagos">
                    <Card className="hover:shadow-md transition-all cursor-pointer group border-none ring-1 ring-gray-100 py-2">
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-green-50 group-hover:text-green-600 transition-all text-gray-400">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Procesar Pagos</h3>
                                    <p className="caption text-gray-500">
                                        {reporte?.resumen?.transaccionesAprobadas > 0 ? (
                                            <span className="text-amber-600 font-bold">
                                                {reporte.resumen.transaccionesAprobadas} pendientes
                                            </span>
                                        ) : "Sin pendientes hoy"}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="text-gray-300 group-hover:text-green-600 transition-all" size={20} />
                        </div>
                    </Card>
                </Link>
            </div>

            {/* RANKINGS */}
            {!loading && reporte && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* BARBEROS RANKING */}
                    <Card className="shadow-sm ring-1 ring-gray-100 border-none overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="heading-4 flex items-center gap-3">
                                    <Users className="text-blue-600" size={24} />
                                    Ranking de Barberos
                                </h3>
                                <p className="caption text-gray-500 mt-1">Productividad y ventas por staff</p>
                            </div>
                            <span className="badge badge-primary">MES ACTUAL</span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {reporte.topBarberos.map((barbero, idx) => (
                                    <div key={barbero._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white shadow-sm ring-1 ring-gray-100 rounded-xl flex items-center justify-center text-gray-900 font-black text-lg">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-black">{barbero.nombre}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="caption font-bold text-gray-400">{barbero.totalTransacciones} Ventas registradas</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-900 font-black text-lg">{formatCurrency(barbero.totalIngresos)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* PRODUCTOS RANKING */}
                    <Card className="shadow-sm ring-1 ring-gray-100 border-none overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="heading-4 flex items-center gap-3">
                                    <Package className="text-indigo-600" size={24} />
                                    Productos Estrella
                                </h3>
                                <p className="caption text-gray-500 mt-1">Rotación de inventario este periodo</p>
                            </div>
                            <span className="badge badge-secondary">RANKING</span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {[
                                    { nombre: 'SCORE GORILLA', cant: 15, total: 22500 },
                                    { nombre: 'COCA COLA', cant: 15, total: 15000 },
                                    { nombre: 'GATORADE', cant: 9, total: 18000 },
                                    { nombre: 'TALCO TEXTURA', cant: 4, total: 12000 }
                                ].map((prod, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white shadow-sm ring-1 ring-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-all">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-black">{prod.nombre}</p>
                                                <p className="caption text-gray-400 font-bold uppercase">{prod.cant} unidades vendidas</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-900 font-black">{formatCurrency(prod.total)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
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
