import { useState, useEffect } from "react";
import { DollarSign, Lock, Unlock, TrendingUp, TrendingDown, AlertTriangle, Clock, User, ChevronRight, Calculator, Plus, X } from "lucide-react";
import {
    obtenerCajaActual,
    abrirCaja,
    cerrarCaja,
    DENOMINACIONES
} from "../../../services/cajaService";
import { Card, Button, Badge } from "../../../components/ui";
import { ErrorAlert } from "../../../components/ErrorComponents";
import { useApiCall } from "../../../hooks/useApiCall";
import { useAsyncAction } from "../../../hooks/useAsyncAction";
import { motion } from "framer-motion";

export default function Caja() {
    const [caja, setCaja] = useState(null);
    const [modalAbrir, setModalAbrir] = useState(false);
    const [modalCerrar, setModalCerrar] = useState(false);

    // Hook para cargar caja actual
    const { execute: cargarCaja, loading, error } = useApiCall(
        obtenerCajaActual,
        {
            errorMessage: 'Error al cargar la caja. Por favor, intenta de nuevo.',
            onSuccess: (data) => {
                setCaja(data.cajaAbierta ? data.caja : null);
            }
        }
    );

    useEffect(() => {
        cargarCaja();
    }, []);

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP"
        }).format(monto);
    };

    const calcularMontoEsperado = () => {
        if (!caja) return 0;
        const totalIngresos = caja.ingresos.reduce((sum, i) => sum + i.monto, 0);
        const totalEgresos = caja.egresos.reduce((sum, e) => sum + e.monto, 0);
        return caja.montoInicial + totalIngresos - totalEgresos;
    };

    if (loading && !caja) {
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
                    title="Error al conectar con la base de datos de caja"
                    message={error}
                    onRetry={cargarCaja}
                    variant="error"
                />
            </div>
        );
    }

    // Si no hay caja abierta
    if (!caja) {
        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
                <header className="mb-8">
                    <h1 className="heading-1 flex items-center gap-3">
                        <Lock className="text-red-500" size={32} />
                        Control de Caja
                    </h1>
                    <p className="body-large text-gray-600 mt-2">Gestión de efectivo y arqueo diario</p>
                </header>

                <div className="max-w-2xl mx-auto">
                    <Card className="p-12 text-center shadow-sm border-none ring-1 ring-gray-100 bg-white">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-8">
                            <Lock className="text-red-500" size={48} />
                        </div>
                        <h2 className="heading-2 text-gray-900 mb-4">Caja Cerrada</h2>
                        <p className="body-large text-gray-500 mb-10 max-w-sm mx-auto">
                            Para comenzar a registrar movimientos de efectivo y ventas del día, es necesario realizar la apertura de caja.
                        </p>
                        <Button
                            onClick={() => setModalAbrir(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black shadow-xl transition-all transform hover:scale-[1.02] inline-flex items-center gap-2"
                        >
                            <Unlock size={24} />
                            Realizar Apertura de Caja
                        </Button>
                    </Card>
                </div>

                {modalAbrir && (
                    <ModalAbrirCaja
                        onClose={() => setModalAbrir(false)}
                        onSuccess={() => {
                            setModalAbrir(false);
                            cargarCaja();
                        }}
                    />
                )}
            </div>
        );
    }

    // Caja abierta
    const montoEsperado = calcularMontoEsperado();
    const totalIngresos = caja.ingresos.reduce((sum, i) => sum + i.monto, 0);
    const totalEgresos = caja.egresos.reduce((sum, e) => sum + e.monto, 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-green-50 text-green-600 border-green-200 px-4 py-1 animate-pulse">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            OPERATIVA
                        </Badge>
                        <h1 className="heading-1 translate-y-[-2px]">Control de Caja</h1>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 body-small text-gray-500 font-bold">
                            <Clock size={16} />
                            Apertura: {caja.horaApertura}
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="flex items-center gap-2 body-small text-gray-500 font-bold">
                            <User size={16} />
                            {caja.responsable}
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => setModalCerrar(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg transition-all transform hover:scale-[1.02]"
                >
                    <Lock size={20} />
                    Cerrar Caja & Arqueo
                </Button>
            </header>

            {/* Resumen Principal */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                    <p className="caption text-gray-500 font-bold uppercase tracking-widest mb-1">Monto Inicial</p>
                    <h3 className="text-3xl font-black text-gray-900">{formatearMonto(caja.montoInicial)}</h3>
                    <div className="flex items-center gap-2 mt-3 text-blue-600 font-black text-xs uppercase tracking-tighter">
                        <Unlock size={12} /> Fondo de apertura
                    </div>
                </Card>

                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                    <p className="caption text-gray-500 font-bold uppercase tracking-widest mb-1">Ingresos Efectivo</p>
                    <h3 className="text-3xl font-black text-green-600">+{formatearMonto(totalIngresos)}</h3>
                    <div className="flex items-center gap-2 mt-3 text-gray-400 font-black text-xs uppercase tracking-tighter">
                        {caja.ingresos.length} Movimientos registrados
                    </div>
                </Card>

                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                    <p className="caption text-gray-500 font-bold uppercase tracking-widest mb-1">Egresos Efectivo</p>
                    <h3 className="text-3xl font-black text-red-600">-{formatearMonto(totalEgresos)}</h3>
                    <div className="flex items-center gap-2 mt-3 text-gray-400 font-black text-xs uppercase tracking-tighter">
                        {caja.egresos.length} Salidas registradas
                    </div>
                </Card>

                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-gray-50 group hover:ring-blue-100 transition-all">
                    <p className="caption text-gray-500 font-bold uppercase tracking-widest mb-1">Saldo Estimado</p>
                    <h3 className="text-3xl font-black text-gray-900">{formatearMonto(montoEsperado)}</h3>
                    <div className="flex items-center gap-2 mt-3 text-blue-600 font-black text-xs uppercase tracking-tighter">
                        <TrendingUp size={12} /> Saldo en billete/moneda
                    </div>
                </Card>
            </div>

            {/* Movimientos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingresos */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="heading-4 flex items-center gap-2">
                            <TrendingUp className="text-green-500" size={20} />
                            Ingresos del Día
                        </h2>
                    </div>
                    <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                            {caja.ingresos.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="body-large text-gray-400 font-bold italic">Sin ingresos operativos aún</p>
                                </div>
                            ) : (
                                caja.ingresos.map((ingreso, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="caption font-black text-gray-400">{ingreso.hora}</span>
                                                    <Badge className="bg-green-50 text-green-700 text-[9px] px-2 py-0 border-none font-black">
                                                        {ingreso.tipo}
                                                    </Badge>
                                                </div>
                                                <p className="body-small font-black text-gray-900">{ingreso.concepto}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="body-small font-black text-green-600">+{formatearMonto(ingreso.monto)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Egresos */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="heading-4 flex items-center gap-2">
                            <TrendingDown className="text-red-500" size={20} />
                            Egresos del Día
                        </h2>
                    </div>
                    <Card className="shadow-sm border-none ring-1 ring-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                            {caja.egresos.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="body-large text-gray-400 font-bold italic">Sin fugas de capital reportadas</p>
                                </div>
                            ) : (
                                caja.egresos.map((egreso, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="caption font-black text-gray-400">{egreso.hora}</span>
                                                    <Badge className="bg-red-50 text-red-700 text-[9px] px-2 py-0 border-none font-black">
                                                        {egreso.tipo}
                                                    </Badge>
                                                </div>
                                                <p className="body-small font-black text-gray-900">{egreso.concepto}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="body-small font-black text-red-600">-{formatearMonto(egreso.monto)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal Cerrar Caja */}
            {modalCerrar && (
                <ModalCerrarCaja
                    caja={caja}
                    montoEsperado={montoEsperado}
                    onClose={() => setModalCerrar(false)}
                    onSuccess={() => {
                        setModalCerrar(false);
                        cargarCaja();
                    }}
                />
            )}
        </div>
    );
}

// Modal Abrir Caja
function ModalAbrirCaja({ onClose, onSuccess }) {
    const [montoInicial, setMontoInicial] = useState(50000);

    const { execute: handleSubmit, loading: loadingSubmit } = useAsyncAction(
        async (e) => {
            e.preventDefault();
            return await abrirCaja({
                montoInicial,
                turno: "COMPLETO"
            });
        },
        {
            successMessage: '✅ Caja abierta exitosamente',
            errorMessage: 'Error al abrir caja',
            onSuccess
        }
    );

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[40px] p-12 max-w-md w-full shadow-2xl relative border-none animate-in zoom-in-95">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-3xl mb-6">
                        <Unlock className="text-blue-600" size={32} />
                    </div>
                    <h2 className="heading-2 text-gray-900">Apertura de Jornada</h2>
                    <p className="body-large text-gray-500 mt-2">Ingresa el fondo fijo inicial para hoy</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <div className="relative">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
                            <input
                                type="number"
                                value={montoInicial}
                                onChange={(e) => setMontoInicial(parseFloat(e.target.value))}
                                className="w-full bg-gray-50 border-none rounded-3xl pl-16 pr-8 py-6 text-3xl font-black text-center text-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                                step="1000"
                                min="0"
                                required
                                autoFocus
                            />
                        </div>
                        <p className="caption text-gray-400 mt-4 text-center font-bold">
                            Fondo inicial sugerido: $50,000
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-8 py-5 rounded-3xl font-black transition-all"
                        >
                            Volver
                        </button>
                        <Button
                            type="submit"
                            disabled={loadingSubmit}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-3xl font-black shadow-lg transition-all"
                        >
                            {loadingSubmit ? "Procesando..." : "Abrir Caja"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Modal Cerrar Caja
function ModalCerrarCaja({ caja, montoEsperado, onClose, onSuccess }) {
    const [arqueo, setArqueo] = useState({
        billetes: { "20000": 0, "10000": 0, "5000": 0, "2000": 0, "1000": 0 },
        monedas: { "500": 0, "100": 0, "50": 0, "10": 0 }
    });
    const [observaciones, setObservaciones] = useState("");

    const calcularTotal = () => {
        let total = 0;
        Object.entries(arqueo.billetes).forEach(([denom, cant]) => total += parseInt(denom) * cant);
        Object.entries(arqueo.monedas).forEach(([denom, cant]) => total += parseInt(denom) * cant);
        return total;
    };

    const montoReal = calcularTotal();
    const diferencia = montoReal - montoEsperado;

    const { execute: handleSubmit, loading: loadingSubmit } = useAsyncAction(
        async (e) => {
            e.preventDefault();
            return await cerrarCaja({
                montoReal,
                arqueo: { ...arqueo, totalContado: montoReal },
                observaciones
            });
        },
        {
            successMessage: '✅ Caja cerrada y arqueo finalizado',
            errorMessage: 'Error al cerrar caja',
            onSuccess
        }
    );

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(monto);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto py-12">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white rounded-[40px] p-10 max-w-4xl w-full shadow-2xl relative border-none animate-in slide-in-from-bottom-5"
            >
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                    <div>
                        <h2 className="heading-2 text-gray-900">Cierre de Caja & Arqueo</h2>
                        <p className="body-large text-gray-500 mt-1">Realiza el conteo físico de billetes y monedas</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Panel de Control de Diferencias */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gray-50 rounded-3xl text-center">
                            <p className="caption font-black text-gray-400 uppercase tracking-widest mb-1">Esperado</p>
                            <p className="text-2xl font-black text-gray-900">{formatearMonto(montoEsperado)}</p>
                        </div>
                        <div className="p-6 bg-blue-600 rounded-3xl text-center shadow-lg">
                            <p className="caption font-black text-blue-100 uppercase tracking-widest mb-1">Contado Actual</p>
                            <p className="text-2xl font-black text-white">{formatearMonto(montoReal)}</p>
                        </div>
                        <div className={`p-6 rounded-3xl text-center ${diferencia === 0 ? 'bg-green-50' : diferencia > 0 ? 'bg-amber-50' : 'bg-red-50'}`}>
                            <p className="caption font-black text-gray-400 uppercase tracking-widest mb-1">Diferencia</p>
                            <p className={`text-2xl font-black ${diferencia === 0 ? 'text-green-600' : diferencia > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                {diferencia > 0 ? '+' : ''}{formatearMonto(diferencia)}
                            </p>
                        </div>
                    </div>

                    {Math.abs(diferencia) > 1000 && (
                        <div className="flex items-center gap-4 bg-red-50 p-6 rounded-2xl border border-red-100">
                            <AlertTriangle className="text-red-600 flex-shrink-0" size={28} />
                            <div>
                                <p className="body-small font-black text-red-600 uppercase tracking-widest">Alerta de Descuadre</p>
                                <p className="body-small text-red-800">Existe una diferencia de {formatearMonto(Math.abs(diferencia))} respecto al saldo teórico esperado.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Billetes */}
                        <div className="space-y-6">
                            <h3 className="heading-4 flex items-center gap-2">
                                <DollarSign size={20} className="text-green-600" /> Billetes CLP
                            </h3>
                            <div className="space-y-3">
                                {DENOMINACIONES.billetes.map((denom) => (
                                    <div key={denom.valor} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl group hover:bg-gray-50 transition-all">
                                        <div className="min-w-[100px]">
                                            <span className="body-small font-black text-gray-400">{denom.label}</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={arqueo.billetes[denom.valor]}
                                            onChange={(e) => setArqueo({
                                                ...arqueo,
                                                billetes: { ...arqueo.billetes, [denom.valor]: parseInt(e.target.value) || 0 }
                                            })}
                                            className="input w-24 text-center font-black !rounded-xl"
                                            min="0"
                                        />
                                        <div className="flex-1 text-right">
                                            <span className="body-small font-black text-gray-900">
                                                {formatearMonto(denom.valor * (arqueo.billetes[denom.valor] || 0))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monedas */}
                        <div className="space-y-6">
                            <h3 className="heading-4 flex items-center gap-2">
                                <Calculator size={20} className="text-amber-600" /> Monedas CLP
                            </h3>
                            <div className="space-y-3">
                                {DENOMINACIONES.monedas.map((denom) => (
                                    <div key={denom.valor} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl group hover:bg-gray-50 transition-all">
                                        <div className="min-w-[100px]">
                                            <span className="body-small font-black text-gray-400">{denom.label}</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={arqueo.monedas[denom.valor]}
                                            onChange={(e) => setArqueo({
                                                ...arqueo,
                                                monedas: { ...arqueo.monedas, [denom.valor]: parseInt(e.target.value) || 0 }
                                            })}
                                            className="input w-24 text-center font-black !rounded-xl"
                                            min="0"
                                        />
                                        <div className="flex-1 text-right">
                                            <span className="body-small font-black text-gray-900">
                                                {formatearMonto(denom.valor * (arqueo.monedas[denom.valor] || 0))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="caption font-black text-gray-500 uppercase tracking-widest">Observaciones de Cierre</label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="input w-full min-h-[100px] font-bold py-4"
                            placeholder="Menciona cualquier eventualidad, descuadre o nota importante sobre la operación de hoy..."
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-8 py-5 rounded-3xl font-black transition-all"
                        >
                            Cancelar
                        </button>
                        <Button
                            type="submit"
                            disabled={loadingSubmit}
                            className={`flex-1 ${loadingSubmit ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} text-white px-8 py-5 rounded-3xl font-black shadow-lg transition-all`}
                        >
                            {loadingSubmit ? "Procesando..." : "Confirmar Cierre de Caja"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
