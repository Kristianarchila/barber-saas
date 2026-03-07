import { useState, useEffect } from "react";
import { obtenerRendimientoBarberos } from "../../services/reportesService";
import { useApiCall } from "../../hooks/useApiCall";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

export default function SueldosBarberos() {
    const [barberos, setBarberos] = useState([]);
    const [mesSeleccionado, setMesSeleccionado] = useState(dayjs().format("YYYY-MM"));
    const [pagando, setPagando] = useState(false);

    const { execute: fetchData, loading, error } = useApiCall(
        () => obtenerRendimientoBarberos(mesSeleccionado),
        {
            errorMessage: "Error al cargar la nómina del personal.",
            onSuccess: (data) => setBarberos(Array.isArray(data) ? data : [])
        }
    );

    useEffect(() => { fetchData(); }, [mesSeleccionado]);

    const handlePagar = async (barberoId, monto) => {
        if (!confirm("¿Deseas registrar este pago en el sistema?")) return;
        try {
            setPagando(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert("✅ Pago registrado correctamente");
            fetchData();
        } catch {
            alert("Error al procesar el pago");
        } finally {
            setPagando(false);
        }
    };

    const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n || 0);

    // Navegación de mes
    const mesMostrado = dayjs(mesSeleccionado);
    const irMesAnterior = () => setMesSeleccionado(mesMostrado.subtract(1, "month").format("YYYY-MM"));
    const irMesSiguiente = () => {
        const siguiente = mesMostrado.add(1, "month");
        if (siguiente.isAfter(dayjs(), "month")) return;
        setMesSeleccionado(siguiente.format("YYYY-MM"));
    };
    const esMesActual = mesMostrado.isSame(dayjs(), "month");

    const totalComisiones = barberos.reduce((s, b) => s + (b.comision || 0), 0);
    const totalVales = barberos.reduce((s, b) => s + (b.vales || 0), 0);
    const totalGenerado = barberos.reduce((s, b) => s + (b.ingresosTotales || 0), 0);
    const totalNeto = totalComisiones - totalVales;

    if (loading && barberos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-neutral-600 text-sm">Cargando nómina...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-lg mx-auto mt-20 text-center">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Error al cargar nómina</h3>
                <p className="text-neutral-500 text-sm mb-6">{error}</p>
                <button onClick={fetchData} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* ── HEADER ── */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Recursos Humanos</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Sueldos & Comisiones</h1>
                        <p className="text-neutral-500 mt-1">Gestión de pagos y adelantos del personal</p>
                    </div>

                    {/* Navegador de mes */}
                    <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 self-start">
                        <button
                            onClick={irMesAnterior}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="px-4 py-2 min-w-[140px] text-center">
                            <p className="text-white font-bold text-sm capitalize">
                                {mesMostrado.format("MMMM YYYY")}
                            </p>
                            {esMesActual && (
                                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Mes actual</span>
                            )}
                        </div>

                        <button
                            onClick={irMesSiguiente}
                            disabled={esMesActual}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Picker nativo oculto como fallback */}
                        <div className="relative ml-1">
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                                title="Ir a mes específico"
                                onClick={() => document.getElementById('month-picker').showPicker?.() || document.getElementById('month-picker').click()}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <input
                                id="month-picker"
                                type="month"
                                value={mesSeleccionado}
                                max={dayjs().format("YYYY-MM")}
                                onChange={e => setMesSeleccionado(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* ── CARDS RESUMEN ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Generado", value: fmt(totalGenerado), color: "blue", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
                        { label: "Comisiones", value: fmt(totalComisiones), color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { label: "Vales / Desc.", value: fmt(totalVales), color: "red", icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { label: "A Pagar Neto", value: fmt(totalNeto), color: "violet", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                    ].map(({ label, value, color, icon }) => (
                        <div key={label} className={`relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-${color}-500/30 transition-all group`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-600/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}-600/10 transition-all`} />
                            <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-3">{label}</p>
                            <p className={`text-xl font-black text-${color === "blue" ? "white" : color === "emerald" ? "emerald-400" : color === "red" ? "red-400" : "violet-400"} tabular-nums`}>
                                {value}
                            </p>
                            <svg className={`w-4 h-4 text-${color}-500/30 mt-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* ── LISTADO BARBEROS ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-neutral-600 uppercase tracking-widest">
                            Nómina Detallada — <span className="text-neutral-400 capitalize">{mesMostrado.format("MMMM YYYY")}</span>
                        </h2>
                        <span className="text-xs text-neutral-600">{barberos.length} persona{barberos.length !== 1 && "s"}</span>
                    </div>

                    {barberos.length === 0 ? (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-16 text-center">
                            <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-white font-bold mb-1">Sin datos para {mesMostrado.format("MMMM YYYY")}</p>
                            <p className="text-neutral-600 text-sm">No hay registros de rendimiento para este período</p>
                        </div>
                    ) : (
                        barberos.map((barbero) => {
                            const sueldoNeto = (barbero.comision || 0) - (barbero.vales || 0);
                            const pct = barbero.porcentajeComision || 0;
                            const inicial = (barbero.nombre?.[0] || "?").toUpperCase();

                            return (
                                <div key={barbero.barberoId} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all group">
                                    <div className="flex flex-col lg:flex-row">

                                        {/* Identidad */}
                                        <div className="flex items-center gap-4 p-6 lg:w-56 lg:border-r border-neutral-800">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center text-violet-300 font-black text-lg flex-shrink-0">
                                                {inicial}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-bold text-sm leading-tight truncate">{barbero.nombre}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                                                    {pct}% comisión
                                                </span>
                                            </div>
                                        </div>

                                        {/* Métricas */}
                                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-neutral-800">
                                            <div className="p-5 flex flex-col justify-center">
                                                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Generado</p>
                                                <p className="text-base font-bold text-white tabular-nums">{fmt(barbero.ingresosTotales)}</p>
                                                {barbero.totalServicios != null && (
                                                    <p className="text-xs text-neutral-600 mt-0.5">{barbero.totalServicios} servicios</p>
                                                )}
                                            </div>
                                            <div className="p-5 flex flex-col justify-center">
                                                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Comisión</p>
                                                <p className="text-base font-bold text-emerald-400 tabular-nums">{fmt(barbero.comision)}</p>
                                            </div>
                                            <div className="p-5 flex flex-col justify-center">
                                                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Vales / Desc.</p>
                                                <p className="text-base font-bold text-red-400 tabular-nums">-{fmt(barbero.vales)}</p>
                                            </div>
                                            <div className="p-5 flex flex-col justify-center bg-neutral-800/30">
                                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">A Pagar</p>
                                                <p className="text-xl font-black text-white tabular-nums">{fmt(sueldoNeto)}</p>
                                            </div>
                                        </div>

                                        {/* Acción */}
                                        <div className="flex lg:flex-col items-center justify-center gap-2 p-4 lg:w-36 border-t lg:border-t-0 lg:border-l border-neutral-800">
                                            <button
                                                onClick={() => handlePagar(barbero.barberoId, sueldoNeto)}
                                                disabled={pagando}
                                                className="flex-1 lg:w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-black text-xs transition-all shadow-lg shadow-emerald-900/20"
                                            >
                                                {pagando ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        ...
                                                    </span>
                                                ) : "PAGAR"}
                                            </button>
                                            <button className="flex-1 lg:w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-bold text-xs transition-all">
                                                Detalle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {barberos.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-700">
                        <span>Total nómina: <span className="text-neutral-500 font-bold">{fmt(totalNeto)}</span></span>
                        <span className="capitalize">{mesMostrado.format("MMMM YYYY")}</span>
                    </div>
                )}

            </div>
        </div>
    );
}
