import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Download,
    Award,
    PieChart as PieChartIcon,
    BarChart3,
    ArrowUpRight,
    Target,
    Briefcase,
    Crown,
    Loader2,
    FileText,
    Eye,
    X
} from "lucide-react";
import {
    obtenerResumenGeneral,
    obtenerRendimientoBarberos,
    obtenerServiciosVendidos,
    obtenerAnalisisPagos,
    obtenerTendenciasIngresos
} from "../../../services/reportesService";
import { descargarReportePDF } from "../../../services/valesService";
import { Card, Button, Badge } from "../../../components/ui";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import dayjs from "dayjs";


export default function ReportesCompleto() {
    const [resumen, setResumen] = useState(null);
    const [barberos, setBarberos] = useState([]);
    const [servicios, setServicios] = useState(null);
    const [analisisPagos, setAnalisisPagos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));

    useEffect(() => {
        cargarDatos();
    }, [fechaInicio, fechaFin]);


    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [
                resumenData,
                barberosData,
                serviciosData,
                pagosData,
            ] = await Promise.all([
                obtenerResumenGeneral(null, fechaInicio, fechaFin),
                obtenerRendimientoBarberos(null, fechaInicio, fechaFin),
                obtenerServiciosVendidos(null, fechaInicio, fechaFin),
                obtenerAnalisisPagos(null, fechaInicio, fechaFin),
            ]);
            setResumen(resumenData);
            setBarberos(barberosData);
            setServicios(serviciosData);
            setAnalisisPagos(pagosData);
        } catch (error) {
            console.error("Error al cargar reportes:", error);
        } finally {
            setLoading(false);
        }
    };


    const generarPDF = async () => {
        try {
            setGeneratingPDF(true);
            await descargarReportePDF(fechaInicio, fechaFin);
        } catch (error) {
            console.error('Error PDF:', error);
            alert('Error al generar el reporte');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const verReporte = async () => {
        try {
            setLoadingPreview(true);
            const slug = window.location.pathname.split('/')[1];
            const api = (await import('../../../services/api')).default;
            const res = await api.get(
                `/barberias/${slug}/admin/reportes/financiero/pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
                { responseType: 'blob' }
            );
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            setPdfUrl(url);
        } catch (error) {
            console.error('Error al cargar preview:', error);
            alert('Error al cargar la vista previa');
        } finally {
            setLoadingPreview(false);
        }
    };

    const cerrarPreview = () => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
    };

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }).format(monto || 0);
    };


    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <BarChart3 className="text-blue-600" size={32} />
                        Inteligencia de Negocio
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Auditoría financiera y métricas de rendimiento operativo
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap items-center">
                    <DateRangePicker
                        fechaInicio={fechaInicio}
                        fechaFin={fechaFin}
                        onChange={({ fechaInicio: i, fechaFin: f }) => { setFechaInicio(i); setFechaFin(f); }}
                        label="Período del reporte"
                    />
                    <Button
                        onClick={verReporte}
                        disabled={loadingPreview}
                        className="bg-blue-600 border-none hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 active:scale-95"
                    >
                        {loadingPreview ? <Loader2 className="animate-spin" size={18} /> : <Eye size={18} />}
                        Ver Reporte
                    </Button>
                </div>

            </header>

            {/* DASHBOARD EJECUTIVO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-gray-50 rounded-[32px] animate-pulse" />)
                ) : resumen && (
                    <>
                        <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                        <TrendingUp size={24} />
                                    </div>
                                    <Badge className="bg-green-50 text-green-700 border-none px-3 py-1 text-[10px] font-black">
                                        +{resumen.variacionIngresos}%
                                    </Badge>
                                </div>
                                <p className="caption font-black text-gray-400 uppercase tracking-widest mb-1">Ingresos Totales</p>
                                <h2 className="text-3xl font-black text-gray-900 leading-tight">{formatearMonto(resumen.ingresosTotales)}</h2>
                                <p className="caption font-bold text-gray-400 mt-auto flex items-center gap-1">
                                    <ArrowUpRight size={12} className="text-green-500" />
                                    vs período anterior
                                </p>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <DollarSign size={140} />
                            </div>
                        </Card>

                        <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                        <TrendingDown size={24} />
                                    </div>
                                </div>
                                <p className="caption font-black text-gray-400 uppercase tracking-widest mb-1">Egresos & Costos</p>
                                <h2 className="text-3xl font-black text-gray-900 leading-tight">{formatearMonto(resumen.egresosTotales)}</h2>
                                <p className="caption font-bold text-gray-400 mt-auto">Operación y Staff</p>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Briefcase size={140} />
                            </div>
                        </Card>

                        <Card className="p-8 bg-gray-900 border-none shadow-xl relative overflow-hidden group">
                            <div className="flex flex-col h-full relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                                        <Crown size={24} />
                                    </div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                                <p className="caption font-black text-gray-400 uppercase tracking-widest mb-1">Utilidad Neta</p>
                                <h2 className="text-3xl font-black text-white leading-tight">{formatearMonto(resumen.utilidadNeta)}</h2>
                                <p className="caption font-bold text-blue-400/60 mt-auto">Profit Directo</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.07] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <TrendingUp size={160} className="text-white" />
                            </div>
                        </Card>

                        <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <p className="caption font-black text-gray-400 uppercase tracking-widest mb-1">Clientes Únicos</p>
                                <h2 className="text-3xl font-black text-gray-900 leading-tight">{resumen.clientesAtendidos}</h2>
                                <p className="caption font-bold text-gray-400 mt-auto flex items-center gap-2">
                                    <Badge variant="premium" className="px-2 py-0">Ticket {formatearMonto(resumen.ticketPromedio)}</Badge>
                                </p>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <Users size={140} />
                            </div>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* RENDIMIENTO STAFF */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                <Award size={20} />
                            </div>
                            <h3 className="heading-3 text-gray-900">Rendimiento por Profesional</h3>
                        </div>
                        <p className="caption font-black text-gray-400">AUDITORÍA DE PRODUCCIÓN</p>
                    </div>

                    <Card className="p-0 shadow-sm border-none ring-1 ring-gray-100 bg-white overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest">Profesional</th>
                                        <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-center">Cortes</th>
                                        <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-right">Ingresos</th>
                                        <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-right">Ticket Avg</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i}>
                                                <td colSpan="4" className="px-8 py-6 h-20 bg-gray-50/30 animate-pulse" />
                                            </tr>
                                        ))
                                    ) : barberos.map((barbero, idx) => (
                                        <tr key={barbero.barberoId} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="body-small font-black text-gray-900">{barbero.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <Badge className="bg-gray-100 text-gray-600 border-none font-black px-4">{barbero.cortesRealizados}</Badge>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="body-small font-black text-green-600">{formatearMonto(barbero.ingresosTotales)}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-gray-400 text-sm">
                                                {formatearMonto(barbero.promedioCliente)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* MÉTODOS DE PAGO */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                <PieChartIcon size={20} />
                            </div>
                            <h3 className="heading-3 text-gray-900">Mix de Pagos</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {loading ? [1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-3xl animate-pulse" />) : analisisPagos && (
                                <>
                                    {[
                                        { label: 'Efectivo', data: analisisPagos.efectivo, icon: '💵', color: 'green' },
                                        { label: 'Tarjeta', data: analisisPagos.tarjeta, icon: '💳', color: 'blue' },
                                        { label: 'Transferencia', data: analisisPagos.transferencia, icon: '🏦', color: 'purple' }
                                    ].map((m) => (
                                        <Card key={m.label} className="p-6 border-none ring-1 ring-gray-100 bg-white shadow-sm flex flex-col items-center text-center">
                                            <span className="text-3xl mb-3">{m.icon}</span>
                                            <p className="caption font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                                            <p className="text-xl font-black text-gray-900 mt-1">{formatearMonto(m.data.monto)}</p>
                                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                                <div
                                                    className={`h-full bg-${m.color}-500 transition-all duration-1000`}
                                                    style={{ width: `${m.data.porcentaje}%` }}
                                                />
                                            </div>
                                            <span className="caption font-bold text-gray-400 mt-2">{m.data.porcentaje}% del total</span>
                                        </Card>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* SERVICIOS TOP */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                            <BarChart3 size={20} />
                        </div>
                        <h3 className="heading-3 text-gray-900">Servicios Estrella</h3>
                    </div>

                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white h-full">
                        <div className="space-y-10">
                            {loading ? [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="space-y-3">
                                    <div className="h-4 bg-gray-50 rounded w-1/2 animate-pulse" />
                                    <div className="h-8 bg-gray-50 rounded animate-pulse" />
                                </div>
                            )) : servicios && servicios.servicios.map((s) => (
                                <div key={s.nombre} className="group">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="body-small font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{s.nombre}</span>
                                        <span className="caption font-black text-gray-400">{s.cantidad} unidades</span>
                                    </div>
                                    <div className="relative h-10 bg-gray-50 rounded-2xl overflow-hidden ring-1 ring-gray-100 flex items-center px-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.porcentaje}%` }}
                                            className="absolute left-0 top-0 bottom-0 bg-blue-600/10 border-r-2 border-blue-600"
                                        />
                                        <div className="relative z-10 flex justify-between w-full">
                                            <span className="caption font-black text-blue-700">{s.porcentaje}%</span>
                                            <span className="caption font-black text-gray-600">{formatearMonto(s.ingresos)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!loading && servicios && (
                            <div className="mt-12 pt-8 border-t border-gray-50">
                                <div className="p-6 bg-blue-50 rounded-[24px] flex items-center gap-5">
                                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <p className="caption font-black text-blue-600/60 uppercase tracking-widest">Share de Mercado</p>
                                        <p className="body-large font-black text-blue-900">Análisis Competitivo</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* ─── PDF Viewer (inline, menu stays visible) ─── */}
            <AnimatePresence>
                {pdfUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-xl"
                    >
                        {/* Top bar */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 text-white">
                            <span className="text-xs font-bold flex items-center gap-2">
                                <FileText size={14} />
                                Reporte {fechaInicio} — {fechaFin}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={generarPDF}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                    <Download size={13} /> Descargar
                                </button>
                                <button
                                    onClick={cerrarPreview}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        {/* PDF iframe */}
                        <iframe
                            src={pdfUrl}
                            className="w-full bg-white"
                            title="Reporte PDF"
                            style={{ border: 'none', height: '70vh' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}