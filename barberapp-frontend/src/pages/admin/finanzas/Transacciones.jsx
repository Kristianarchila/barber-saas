import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
    ArrowRightLeft,
    Download,
    User,
    ChevronDown,
    Filter,
    Calendar as CalendarIcon,
    Clock,
    Receipt,
    Edit3,
    CheckCircle2,
    ExternalLink,
    Loader2,
    Check,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Badge, Avatar } from "../../../components/ui";
import { ErrorAlert } from "../../../components/ErrorComponents";
import { useApiCall } from "../../../hooks/useApiCall";
import { useAsyncAction } from "../../../hooks/useAsyncAction";
import { getTransactions, ajustarTransaccion, marcarComoPagado } from "../../../services/transactionService";
import { getBarberos } from "../../../services/barberosService";

export default function Transacciones() {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({});
    const [barberos, setBarberos] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        barberoId: "",
        estado: "",
        desde: "",
        hasta: "",
        page: 1
    });

    // Modal states
    const [selectedTx, setSelectedTx] = useState(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustForm, setAdjustForm] = useState({
        montoBarbero: 0,
        montoBarberia: 0,
        razon: ""
    });

    // Hook para cargar transacciones
    const { execute: fetchData, loading, error } = useApiCall(
        () => getTransactions(filters),
        {
            errorMessage: 'Error al cargar el historial de transacciones.',
            onSuccess: (data) => {
                setTransactions(data.transactions);
                setPagination(data.pagination);
            }
        }
    );

    // Hook para cargar barberos (solo una vez)
    const { execute: fetchBarberos } = useApiCall(
        getBarberos,
        {
            onSuccess: (data) => setBarberos(data)
        }
    );

    useEffect(() => {
        fetchData();
    }, [filters]);

    useEffect(() => {
        fetchBarberos();
    }, []);

    // Hook para ajustar transacción
    const { execute: onAdjustSubmit, loading: ajustando } = useAsyncAction(
        async (e) => {
            e.preventDefault();
            if (!adjustForm.razon) throw new Error("Debes indicar una razón para el ajuste");
            return await ajustarTransaccion(selectedTx._id, adjustForm);
        },
        {
            successMessage: '✅ Transacción ajustada correctamente',
            errorMessage: 'Error al realizar el ajuste',
            onSuccess: () => {
                setShowAdjustModal(false);
                fetchData();
            }
        }
    );

    // Hook para marcar como pagado
    const { execute: handlePagar, loading: pagando } = useAsyncAction(
        marcarComoPagado,
        {
            successMessage: '✅ Pago registrado exitosamente',
            errorMessage: 'Error al procesar el pago',
            confirmMessage: '¿Marcar este monto como pagado al barbero?',
            onSuccess: fetchData
        }
    );

    const handleAdjust = (tx) => {
        setSelectedTx(tx);
        setAdjustForm({
            montoBarbero: tx.montosFinales.montoBarbero,
            montoBarberia: tx.montosFinales.montoBarberia,
            razon: ""
        });
        setShowAdjustModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <ArrowRightLeft className="text-blue-600" size={32} />
                        Historial Ledger
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Registro detallado de repartición de fondos y conciliaciones
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black transition-all hover:bg-gray-50 border-gray-200">
                        <Download size={20} />
                        Exportar Ledger
                    </Button>
                </div>
            </header>

            {error && (
                <div className="max-w-4xl mx-auto mb-8">
                    <ErrorAlert
                        title="Error en el Ledger"
                        message={error}
                        onRetry={fetchData}
                        variant="error"
                    />
                </div>
            )}

            {/* FILTROS AVANZADOS */}
            <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Profesional</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
                            <select
                                className="w-full bg-gray-50 border-none rounded-2xl pr-10 py-4 body-small font-black !appearance-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                style={{ paddingLeft: '3rem' }}
                                value={filters.barberoId}
                                onChange={(e) => setFilters({ ...filters, barberoId: e.target.value, page: 1 })}
                            >
                                <option value="">Todos los Profesionales</option>
                                {barberos.map(b => (
                                    <option key={b._id} value={b._id}>{b.nombre}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Estado Contable</label>
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
                            <select
                                className="w-full bg-gray-50 border-none rounded-2xl pr-10 py-4 body-small font-black !appearance-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                style={{ paddingLeft: '3rem' }}
                                value={filters.estado}
                                onChange={(e) => setFilters({ ...filters, estado: e.target.value, page: 1 })}
                            >
                                <option value="">Cualquier Estado</option>
                                <option value="pendiente">Pendiente de Revisión</option>
                                <option value="aprobado">Aprobado / Liquidable</option>
                                <option value="pagado">Pagado / Archivado</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Desde</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                            <input
                                type="date"
                                className="w-full bg-gray-50 border-none rounded-2xl pr-4 py-4 body-small font-black focus:ring-2 focus:ring-blue-100 transition-all"
                                style={{ paddingLeft: '3rem' }}
                                value={filters.desde}
                                onChange={(e) => setFilters({ ...filters, desde: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Hasta</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                            <input
                                type="date"
                                className="w-full bg-gray-50 border-none rounded-2xl pr-4 py-4 body-small font-black focus:ring-2 focus:ring-blue-100 transition-all"
                                style={{ paddingLeft: '3rem' }}
                                value={filters.hasta}
                                onChange={(e) => setFilters({ ...filters, hasta: e.target.value, page: 1 })}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* TABLA CORPORATIVA */}
            <Card className="shadow-sm border-none ring-1 ring-gray-100 bg-white overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest">Detalle & Tiempo</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-center">Profesional</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-right">Repartición</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                                    <div className="h-3 bg-gray-50 rounded w-1/2 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <tr key={tx._id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="body-small font-black text-gray-900 mb-1">
                                                        {dayjs(tx.fecha).format('DD [de] MMMM, YYYY')}
                                                    </p>
                                                    <p className="caption font-bold text-gray-500">
                                                        {tx.reservaId?.hora} • {tx.servicioId?.nombre} – <span className="text-blue-500 uppercase tracking-tighter">{tx.reservaId?.nombreCliente}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative">
                                                    <Avatar src={tx.barberoId?.foto} name={tx.barberoId?.nombre} className="w-10 h-10 ring-2 ring-white shadow-sm" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                </div>
                                                <span className="caption font-black text-gray-600">{tx.barberoId?.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-6 items-center">
                                                <div className="text-right">
                                                    <p className="body-small font-black text-gray-900 leading-none">{formatCurrency(tx.montosFinales.montoBarbero)}</p>
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Profesional</span>
                                                </div>
                                                <div className="h-8 w-px bg-gray-100" />
                                                <div className="text-right">
                                                    <p className="body-small font-black text-gray-900 leading-none">{formatCurrency(tx.montosFinales.montoBarberia)}</p>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Barbería</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Badge className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-none ${tx.estado === 'pagado' ? 'bg-green-50 text-green-700' :
                                                tx.estado === 'aprobado' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                {tx.estado}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {tx.estado !== 'pagado' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAdjust(tx)}
                                                            className="p-3 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                                                            title="Conciliar / Ajustar"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePagar(tx._id, { metodoPago: 'efectivo' })}
                                                            className="p-3 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-xl transition-all"
                                                            title="Emitir Pago"
                                                            disabled={pagando}
                                                        >
                                                            {pagando ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="p-3 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
                                                    title="Expediente Completo"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto space-y-6">
                                            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto ring-1 ring-gray-100">
                                                <Receipt className="text-gray-300" size={40} />
                                            </div>
                                            <div>
                                                <h4 className="heading-4 text-gray-900">Historial Vacío</h4>
                                                <p className="body-small text-gray-500 mt-2">No se encontraron transacciones con los criterios seleccionados.</p>
                                            </div>
                                            <Button variant="outline" onClick={() => setFilters({ barberoId: "", estado: "", desde: "", hasta: "", page: 1 })} className="font-black rounded-2xl">
                                                Limpiar Filtros
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN ELEGANTE */}
                {pagination.pages > 1 && (
                    <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="caption font-black text-gray-400 uppercase tracking-widest">
                            Mostrando página {pagination.page} de {pagination.pages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="p-3 hover:bg-white rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm ring-1 ring-gray-100 flex items-center justify-center font-black text-gray-600"
                            >
                                <ChevronDown className="rotate-90" size={18} />
                            </button>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 flex items-center justify-center font-black text-blue-600">
                                {pagination.page}
                            </div>
                            <button
                                disabled={filters.page === pagination.pages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="p-3 hover:bg-white rounded-xl disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm ring-1 ring-gray-100 flex items-center justify-center font-black text-gray-600"
                            >
                                <ChevronDown className="-rotate-90" size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ADJUST MODAL - CARÁCTER CORPORATIVO */}
            <AnimatePresence>
                {showAdjustModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[40px] p-12 w-full max-w-2xl shadow-2xl relative border-none"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-50 rounded-[20px] text-blue-600">
                                        <Edit3 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="heading-3 text-gray-900 leading-none">Conciliación Manual</h3>
                                        <p className="body-large text-gray-500 mt-1 uppercase tracking-widest text-[10px] font-black">Ref: {selectedTx?._id.slice(-8)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAdjustModal(false)}
                                    className="p-4 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={onAdjustSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="caption font-black text-gray-400 uppercase tracking-widest">Compensación Profesional</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 font-black text-xl">$</span>
                                            <input
                                                type="number"
                                                className="w-full bg-gray-50 border-none rounded-[20px] pl-12 pr-6 py-6 text-2xl font-black text-gray-900 focus:ring-4 focus:ring-blue-100 transition-all"
                                                value={adjustForm.montoBarbero}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    const diff = val - adjustForm.montoBarbero;
                                                    setAdjustForm({
                                                        ...adjustForm,
                                                        montoBarbero: val,
                                                        montoBarberia: Math.max(0, adjustForm.montoBarberia - diff)
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 opacity-60">
                                        <label className="caption font-black text-gray-400 uppercase tracking-widest">Remanente Barbería</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">$</span>
                                            <input
                                                type="number"
                                                className="w-full bg-gray-100 border-none rounded-[20px] pl-12 pr-6 py-6 text-2xl font-black text-gray-900 cursor-not-allowed"
                                                value={adjustForm.montoBarberia}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="caption font-black text-gray-400 uppercase tracking-widest">Justificación Auditoría</label>
                                    <textarea
                                        className="w-full bg-gray-50 border-none rounded-[20px] p-6 body-small font-black min-h-[120px] focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                                        placeholder="Ej: Descuento comercial aplicado post-servicio, ajuste por insumos especiales, etc..."
                                        value={adjustForm.razon}
                                        onChange={(e) => setAdjustForm({ ...adjustForm, razon: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-8 py-5 rounded-[24px] font-black transition-all"
                                        onClick={() => setShowAdjustModal(false)}
                                    >
                                        Abortar
                                    </button>
                                    <Button
                                        type="submit"
                                        disabled={ajustando}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-[24px] font-black shadow-xl transition-all flex items-center justify-center gap-3"
                                    >
                                        {ajustando ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                                        {ajustando ? "Procesando..." : "Autorizar Conciliación"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
