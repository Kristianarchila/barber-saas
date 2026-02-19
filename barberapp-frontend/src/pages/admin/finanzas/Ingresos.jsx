import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, TrendingUp, Calendar, Filter, ChevronRight } from "lucide-react";
import { obtenerPagos, obtenerResumenIngresos } from "../../../services/pagosService";
import { Card, Badge } from "../../../components/ui";
import { ErrorAlert } from "../../../components/ErrorComponents";
import { useApiCall } from "../../../hooks/useApiCall";

export default function Ingresos() {
    const [pagos, setPagos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [filtros, setFiltros] = useState({
        fechaInicio: new Date().toISOString().slice(0, 7) + "-01",
        fechaFin: new Date().toISOString().slice(0, 10)
    });

    // Hook para cargar datos
    const { execute: cargarDatos, loading, error } = useApiCall(
        async () => {
            const [pagosData, resumenData] = await Promise.all([
                obtenerPagos(filtros),
                obtenerResumenIngresos(filtros.fechaInicio.slice(0, 7))
            ]);
            return { pagosData, resumenData };
        },
        {
            errorMessage: 'Error al cargar los ingresos e informes de recaudación.',
            onSuccess: ({ pagosData, resumenData }) => {
                setPagos(pagosData);
                setResumen(resumenData);
            }
        }
    );

    useEffect(() => {
        cargarDatos();
    }, [filtros]);

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP"
        }).format(monto);
    };

    const getMetodoIcon = (metodo) => {
        const icons = {
            EFECTIVO: "💵",
            TARJETA_DEBITO: "💳",
            TARJETA_CREDITO: "💳",
            TRANSFERENCIA: "🏦",
            MERCADO_PAGO: "💰"
        };
        return icons[metodo] || "💰";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <ErrorAlert
                    title="Error al cargar recaudación"
                    message={error}
                    onRetry={cargarDatos}
                    variant="error"
                />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <DollarSign className="text-green-600" size={32} />
                        Gestión de Ingresos
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Seguimiento detallado de ventas y métodos de pago
                    </p>
                </div>
            </header>

            {/* Resumen Cards */}
            {resumen && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Ingresos Brutos */}
                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Ingresos Brutos</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">
                            {formatearMonto(resumen.ingresosBrutos)}
                        </h3>
                    </Card>

                    {/* Comisiones */}
                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 rounded-xl text-red-600">
                                <CreditCard size={20} />
                            </div>
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Comisiones</p>
                        <h3 className="text-2xl font-black text-red-600 mt-1">
                            -{formatearMonto(resumen.comisionesTotales)}
                        </h3>
                    </Card>

                    {/* Ingresos Netos */}
                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-xl text-green-600">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Utilidad Neta</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">
                            {formatearMonto(resumen.ingresosNetos)}
                        </h3>
                    </Card>

                    {/* Hoy */}
                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <Calendar size={20} />
                            </div>
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Recaudación Hoy</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">
                            {formatearMonto(resumen.ingresosHoy)}
                        </h3>
                    </Card>
                </div>
            )}

            {/* Desglose por Método */}
            {resumen && (
                <div className="space-y-6">
                    <h2 className="heading-4 text-gray-900">Desglose por Método de Pago</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Efectivo */}
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:ring-1 hover:ring-green-100 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <DollarSign size={20} />
                                </div>
                                <span className="font-black text-gray-900 uppercase text-xs tracking-widest">Efectivo</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">
                                {formatearMonto(resumen.desglosePorMetodo.efectivo.monto)}
                            </p>
                            <p className="caption text-gray-400 font-bold mt-2">
                                {resumen.desglosePorMetodo.efectivo.porcentaje}% de la recaudación
                            </p>
                        </div>

                        {/* Tarjeta */}
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:ring-1 hover:ring-blue-100 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <CreditCard size={20} />
                                </div>
                                <span className="font-black text-gray-900 uppercase text-xs tracking-widest">Tarjeta</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">
                                {formatearMonto(resumen.desglosePorMetodo.tarjeta.monto)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                <p className="caption text-gray-400 font-bold">
                                    {resumen.desglosePorMetodo.tarjeta.porcentaje}% del total
                                </p>
                                <span className="caption text-red-500 font-black">
                                    COM: -{formatearMonto(resumen.desglosePorMetodo.tarjeta.comision)}
                                </span>
                            </div>
                        </div>

                        {/* Transferencia */}
                        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:ring-1 hover:ring-purple-100 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <CreditCard size={20} />
                                </div>
                                <span className="font-black text-gray-900 uppercase text-xs tracking-widest">Transferencia</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">
                                {formatearMonto(resumen.desglosePorMetodo.transferencia.monto)}
                            </p>
                            <p className="caption text-gray-400 font-bold mt-2">
                                {resumen.desglosePorMetodo.transferencia.porcentaje}% del total
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <Card className="flex items-center gap-6 p-6 shadow-sm border-none ring-1 ring-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                        <Filter size={20} />
                    </div>
                    <p className="caption text-gray-500 font-bold uppercase">Filtrar Periodo</p>
                </div>
                <div className="flex items-center gap-4 flex-1">
                    <input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                        className="input font-bold"
                    />
                    <span className="text-gray-300 font-black">al</span>
                    <input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                        className="input font-bold"
                    />
                </div>
            </Card>

            {/* Tabla de Pagos */}
            <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-left caption text-gray-500 font-black uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-5 text-left caption text-gray-500 font-black uppercase tracking-widest">Cliente</th>
                                <th className="px-6 py-5 text-left caption text-gray-500 font-black uppercase tracking-widest">Métodos de Pago</th>
                                <th className="px-6 py-5 text-right caption text-gray-500 font-black uppercase tracking-widest">Total</th>
                                <th className="px-6 py-5 text-right caption text-gray-500 font-black uppercase tracking-widest">Comisión</th>
                                <th className="px-6 py-5 text-right caption text-gray-500 font-black uppercase tracking-widest">Neto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pagos.map((pago) => (
                                <tr key={pago._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 body-small font-bold text-gray-900">
                                        {new Date(pago.fecha).toLocaleDateString("es-CL")}
                                    </td>
                                    <td className="px-6 py-4 body-small font-bold text-gray-600">
                                        {pago.reservaId?.nombreCliente || "Directo en Local"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {pago.detallesPago.map((detalle, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-600 border border-gray-200"
                                                >
                                                    {getMetodoIcon(detalle.metodoPago)}
                                                    {formatearMonto(detalle.monto)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right body-small font-black text-gray-900">
                                        {formatearMonto(pago.montoTotal)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-red-500 body-small font-bold">
                                        -{formatearMonto(pago.comisionTotal)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-lg font-black body-small">
                                            {formatearMonto(pago.ingresoNeto)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagos.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="text-gray-200" size={32} />
                        </div>
                        <p className="body-large text-gray-400 font-bold italic">No hay pagos registrados en este período</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
