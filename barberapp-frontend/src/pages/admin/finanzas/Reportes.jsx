import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Download,
    Calendar,
    Award,
    PieChart as PieChartIcon,
    BarChart3,
    CalendarDays,
    ChevronRight,
    ArrowUpRight,
    Target,
    Briefcase,
    Crown,
    CheckCircle2,
    Loader2,
    FileText,
    Percent
} from "lucide-react";
import {
    obtenerResumenGeneral,
    obtenerRendimientoBarberos,
    obtenerServiciosVendidos,
    obtenerAnalisisPagos,
    obtenerTendenciasIngresos
} from "../../../services/reportesService";
import { Card, Button, Badge, Skeleton, Avatar } from "../../../components/ui";
import jsPDF from "jspdf";
import dayjs from "dayjs";

export default function ReportesCompleto() {
    const [resumen, setResumen] = useState(null);
    const [barberos, setBarberos] = useState([]);
    const [servicios, setServicios] = useState(null);
    const [analisisPagos, setAnalisisPagos] = useState(null);
    const [tendencias, setTendencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // Estados para filtros
    const [tipoFiltro, setTipoFiltro] = useState('mes'); // 'mes', 'rango'
    const [mes, setMes] = useState(dayjs().format('YYYY-MM'));
    const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));

    useEffect(() => {
        cargarDatos();
    }, [mes, fechaInicio, fechaFin, tipoFiltro]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const params = tipoFiltro === 'mes'
                ? [mes, null, null]
                : [null, fechaInicio, fechaFin];

            const [
                resumenData,
                barberosData,
                serviciosData,
                pagosData,
                tendenciasData
            ] = await Promise.all([
                obtenerResumenGeneral(...params),
                obtenerRendimientoBarberos(...params),
                obtenerServiciosVendidos(...params),
                obtenerAnalisisPagos(...params),
                obtenerTendenciasIngresos(...params)
            ]);

            setResumen(resumenData);
            setBarberos(barberosData);
            setServicios(serviciosData);
            setAnalisisPagos(pagosData);
            setTendencias(tendenciasData);
        } catch (error) {
            console.error("Error al cargar reportes:", error);
        } finally {
            setLoading(false);
        }
    };

    const generarPDF = async () => {
        try {
            setGeneratingPDF(true);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPos = 20;

            // Header corporativo en el PDF
            pdf.setFillColor(243, 244, 246);
            pdf.rect(0, 0, pageWidth, 40, 'F');

            pdf.setFontSize(22);
            pdf.setTextColor(17, 24, 39);
            pdf.setFont('helvetica', 'bold');
            pdf.text('REPORTE FINANCIERO', 20, 25);

            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            pdf.setFont('helvetica', 'normal');
            const periodo = tipoFiltro === 'mes' ? dayjs(mes).format('MMMM YYYY') : `${fechaInicio} al ${fechaFin}`;
            pdf.text(`PERIODO: ${periodo.toUpperCase()}`, 20, 32);

            yPos = 55;

            // Resumen Ejecutivo
            if (resumen) {
                pdf.setFontSize(14);
                pdf.setTextColor(31, 41, 55);
                pdf.text('RESUMEN DE INDICADORES', 20, yPos);
                yPos += 12;

                const cardWidth = (pageWidth - 50) / 2;
                const cardHeight = 35;

                // Card 1: Ingresos
                pdf.setDrawColor(229, 231, 235);
                pdf.setFillColor(255, 255, 255);
                pdf.roundedRect(20, yPos, cardWidth, cardHeight, 3, 3, 'FD');
                pdf.setFontSize(9);
                pdf.setTextColor(107, 114, 128);
                pdf.text('INGRESOS TOTALES', 25, yPos + 10);
                pdf.setFontSize(14);
                pdf.setTextColor(22, 163, 74);
                pdf.text(formatearMonto(resumen.ingresosTotales), 25, yPos + 22);

                // Card 2: Egresos
                pdf.roundedRect(pageWidth - 20 - cardWidth, yPos, cardWidth, cardHeight, 3, 3, 'FD');
                pdf.setFontSize(9);
                pdf.setTextColor(107, 114, 128);
                pdf.text('EGRESOS TOTALES', pageWidth - 15 - cardWidth, yPos + 10);
                pdf.setFontSize(14);
                pdf.setTextColor(220, 38, 38);
                pdf.text(formatearMonto(resumen.egresosTotales), pageWidth - 15 - cardWidth, yPos + 22);

                yPos += cardHeight + 15;
            }

            // Rendimiento Staff
            if (barberos.length > 0) {
                pdf.setFontSize(14);
                pdf.setTextColor(31, 41, 55);
                pdf.text('RENDIMIENTO DEL EQUIPO', 20, yPos);
                yPos += 10;

                // Cabecera Tabla
                pdf.setFillColor(249, 250, 251);
                pdf.rect(20, yPos, pageWidth - 40, 10, 'F');
                pdf.setFontSize(9);
                pdf.setTextColor(107, 114, 128);
                pdf.text('BARBERO', 25, yPos + 6);
                pdf.text('CORTES', 100, yPos + 6);
                pdf.text('PRODUCCIÓN', 140, yPos + 6);
                yPos += 10;

                barberos.forEach((b) => {
                    if (yPos > pageHeight - 20) {
                        pdf.addPage();
                        yPos = 20;
                    }
                    pdf.setFontSize(10);
                    pdf.setTextColor(31, 41, 55);
                    pdf.text(b.nombre, 25, yPos + 8);
                    pdf.text(String(b.cortesRealizados), 100, yPos + 8);
                    pdf.text(formatearMonto(b.ingresosTotales), 140, yPos + 8);
                    yPos += 12;
                    pdf.setDrawColor(243, 244, 246);
                    pdf.line(20, yPos, pageWidth - 20, yPos);
                });
            }

            pdf.save(`Reporte_Financiero_${dayjs().format('YYYY-MM-DD')}.pdf`);
        } catch (error) {
            console.error('Error PDF:', error);
            alert("Error al generar el documento");
        } finally {
            setGeneratingPDF(false);
        }
    };

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }).format(monto || 0);
    };

    const setRangoHoy = () => {
        const hoy = dayjs().format('YYYY-MM-DD');
        setFechaInicio(hoy);
        setFechaFin(hoy);
        setTipoFiltro('rango');
    };

    const setRangoSemana = () => {
        setFechaInicio(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
        setFechaFin(dayjs().format('YYYY-MM-DD'));
        setTipoFiltro('rango');
    };

    const setRangoMes = () => {
        setFechaInicio(dayjs().startOf('month').format('YYYY-MM-DD'));
        setFechaFin(dayjs().format('YYYY-MM-DD'));
        setTipoFiltro('rango');
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
                <div className="flex gap-3">
                    <Button
                        onClick={generarPDF}
                        disabled={generatingPDF}
                        className="bg-gray-900 border-none hover:bg-black text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-3 active:scale-95"
                    >
                        {generatingPDF ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                        Exportar Auditoría PDF
                    </Button>
                </div>
            </header>

            {/* FILTROS ESTRATÉGICOS */}
            <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex bg-gray-50 p-1.5 rounded-[20px] ring-1 ring-gray-100 flex-wrap sm:flex-nowrap">
                        {[
                            { id: 'hoy', label: 'Hoy', action: setRangoHoy },
                            { id: 'semana', label: '7 Días', action: setRangoSemana },
                            { id: 'mes_rango', label: 'Este Mes', action: setRangoMes },
                            { id: 'mes_select', label: 'Histórico', action: () => setTipoFiltro('mes') }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={btn.action}
                                className={`px-6 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all ${(btn.id === 'mes_select' && tipoFiltro === 'mes') || (btn.id !== 'mes_select' && tipoFiltro === 'rango')
                                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100"
                                        : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        {tipoFiltro === 'mes' ? (
                            <div className="relative w-full sm:w-auto">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type="month"
                                    value={mes}
                                    onChange={(e) => setMes(e.target.value)}
                                    className="w-full sm:w-56 bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 body-small font-black focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-44">
                                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-4 body-small font-black focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div className="w-4 h-px bg-gray-200"></div>
                                <div className="relative flex-1 sm:w-44">
                                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-4 body-small font-black focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        )}
                        <Button variant="outline" className="px-6 py-4 rounded-2xl font-black gap-2 border-gray-200 hover:bg-gray-50">
                            <Target size={18} />
                            Definir Objetivos
                        </Button>
                    </div>
                </div>
            </Card>

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
        </div>
    );
}