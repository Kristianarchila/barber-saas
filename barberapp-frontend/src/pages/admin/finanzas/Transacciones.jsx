import { useState, useEffect } from "react";
import { getTransactions, ajustarTransaccion, marcarComoPagado } from "../../../services/transactionService";
import { getBarberos } from "../../../services/barberosService";
import { Card, Button, Badge, Skeleton, Avatar } from "../../../components/ui";
import {
    Receipt,
    Search,
    Filter,
    Calendar as CalendarIcon,
    User,
    ChevronDown,
    ExternalLink,
    Edit3,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    Download,
    X
} from "lucide-react";
import dayjs from "dayjs";

export default function Transacciones() {
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchData();
        fetchBarberos();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getTransactions(filters);
            setTransactions(data.transactions);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBarberos = async () => {
        try {
            const data = await getBarberos();
            setBarberos(data);
        } catch (error) {
            console.error("Error fetching barbers:", error);
        }
    };

    const handleAdjust = (tx) => {
        setSelectedTx(tx);
        setAdjustForm({
            montoBarbero: tx.montosFinales.montoBarbero,
            montoBarberia: tx.montosFinales.montoBarberia,
            razon: ""
        });
        setShowAdjustModal(true);
    };

    const onAdjustSubmit = async (e) => {
        e.preventDefault();
        if (!adjustForm.razon) return alert("Debes indicar una razón para el ajuste");

        try {
            await ajustarTransaccion(selectedTx._id, adjustForm);
            setShowAdjustModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Error al ajustar");
        }
    };

    const handlePagar = async (id) => {
        if (!confirm("¿Marcar este monto como pagado al barbero?")) return;
        try {
            await marcarComoPagado(id, { metodoPago: 'efectivo' });
            fetchData();
        } catch (error) {
            alert("Error al procesar pago");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-8 animate-slide-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gradient-primary flex items-center gap-3">
                        <Receipt size={40} className="text-primary-500" />
                        Registro de Transacciones
                    </h1>
                    <p className="text-neutral-400 text-lg mt-2">
                        Ledger detallado de ingresos y repartición de fondos
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="bg-neutral-900 border-neutral-800">
                        <Download size={18} />
                        Exportar CSV
                    </Button>
                </div>
            </header>

            {/* FILTROS */}
            <Card className="bg-neutral-900 p-6 border-neutral-800 rounded-[32px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase px-2">Barbero</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <select
                                className="w-full bg-neutral-950 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 outline-none focus:border-primary-500 transition-all appearance-none"
                                value={filters.barberoId}
                                onChange={(e) => setFilters({ ...filters, barberoId: e.target.value, page: 1 })}
                            >
                                <option value="">Todos los barberos</option>
                                {barberos.map(b => (
                                    <option key={b._id} value={b._id}>{b.nombre}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase px-2">Estado</label>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <select
                                className="w-full bg-neutral-950 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 outline-none focus:border-primary-500 transition-all appearance-none"
                                value={filters.estado}
                                onChange={(e) => setFilters({ ...filters, estado: e.target.value, page: 1 })}
                            >
                                <option value="">Cualquier estado</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="aprobado">Aprobado</option>
                                <option value="pagado">Pagado</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase px-2">Desde</label>
                        <input
                            type="date"
                            className="w-full bg-neutral-950 text-white px-4 py-3 rounded-2xl border border-neutral-800 outline-none focus:border-primary-500 transition-all [color-scheme:dark]"
                            value={filters.desde}
                            onChange={(e) => setFilters({ ...filters, desde: e.target.value, page: 1 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase px-2">Hasta</label>
                        <input
                            type="date"
                            className="w-full bg-neutral-950 text-white px-4 py-3 rounded-2xl border border-neutral-800 outline-none focus:border-primary-500 transition-all [color-scheme:dark]"
                            value={filters.hasta}
                            onChange={(e) => setFilters({ ...filters, hasta: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </Card>

            {/* TABLA DE TRANSACCIONES */}
            <Card className="overflow-hidden border-neutral-800 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-900 border-b border-neutral-800 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                <th className="px-8 py-6">Fecha & Reserva</th>
                                <th className="px-8 py-6 text-center">Profesional</th>
                                <th className="px-8 py-6 text-right">Repartición (Barbero / Casa)</th>
                                <th className="px-8 py-6 text-center">Estado</th>
                                <th className="px-8 py-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900 bg-neutral-950">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan="5" className="p-8">
                                            <Skeleton variant="rectangular" height="h-12" />
                                        </td>
                                    </tr>
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <tr key={tx._id} className="hover:bg-neutral-900 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-neutral-900 rounded-2xl text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white uppercase text-xs tracking-wider">
                                                        {dayjs(tx.fecha).format('DD MMM, YYYY')} – {tx.reservaId?.hora}
                                                    </p>
                                                    <p className="text-neutral-500 text-xs mt-0.5">{tx.servicioId?.nombre} para {tx.reservaId?.nombreCliente}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <Avatar src={tx.barberoId?.foto} name={tx.barberoId?.nombre} size="sm" className="border border-neutral-800" />
                                                <span className="text-xs font-bold text-neutral-300">{tx.barberoId?.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 items-center">
                                                <div className="text-right">
                                                    <p className="text-base font-black text-white">{formatCurrency(tx.montosFinales.montoBarbero)}</p>
                                                    <p className="text-[10px] font-black text-success-500 uppercase tracking-tighter">Barbero</p>
                                                </div>
                                                <div className="h-8 w-px bg-neutral-800" />
                                                <div className="text-right">
                                                    <p className="text-base font-black text-primary-500">{formatCurrency(tx.montosFinales.montoBarberia)}</p>
                                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter">Casa</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Badge
                                                variant={
                                                    tx.estado === 'pagado' ? 'success' :
                                                        tx.estado === 'aprobado' ? 'primary' :
                                                            'warning'
                                                }
                                                className="font-black uppercase text-[10px] px-3 py-1"
                                            >
                                                {tx.estado}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {tx.estado !== 'pagado' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAdjust(tx)}
                                                            className="p-2.5 bg-neutral-900 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                                                            title="Ajustar Montos"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePagar(tx._id)}
                                                            className="p-2.5 bg-success-500 bg-opacity-10 rounded-xl text-success-500 hover:text-white hover:bg-success-500 transition-all border border-success-500 border-opacity-20"
                                                            title="Marcar como Pagado"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="p-2.5 bg-neutral-900 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                                                    title="Ver Detalle"
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
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto">
                                                <AlertCircle className="text-neutral-700" size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">Sin transacciones</h4>
                                                <p className="text-neutral-500 text-sm">Prueba ajustando los filtros o espera a que se completen nuevas reservas.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN */}
                {pagination.pages > 1 && (
                    <div className="px-8 py-6 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider">
                            Página {pagination.page} de {pagination.pages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={filters.page === pagination.pages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ADJUST MODAL */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-neutral-950 bg-opacity-80 backdrop-blur-md" onClick={() => setShowAdjustModal(false)} />
                    <Card className="relative w-full max-w-xl bg-neutral-900 border-neutral-800 overflow-hidden animate-slide-up shadow-[0_0_100px_rgba(139,92,246,0.15)] rounded-[40px]">
                        <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-neutral-800 bg-opacity-30">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary-500 bg-opacity-20 rounded-2xl">
                                    <Edit3 className="text-primary-500" size={20} />
                                </div>
                                <h3 className="text-2xl font-black text-white">Ajuste Manual</h3>
                            </div>
                            <button
                                onClick={() => setShowAdjustModal(false)}
                                className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={onAdjustSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase px-4 tracking-widest">Monto Barbero</label>
                                    <div className="p-1 bg-neutral-800 rounded-3xl border border-neutral-700 flex focus-within:border-primary-500 transition-all">
                                        <span className="self-center pl-5 font-black text-primary-500">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent text-white p-4 font-black text-xl outline-none"
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

                                <div className="space-y-4 text-right">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase px-4 tracking-widest text-right block">Monto Barbería</label>
                                    <div className="p-1 bg-neutral-800 rounded-3xl border border-neutral-700 flex focus-within:border-primary-500 transition-all">
                                        <span className="self-center pl-5 font-black text-neutral-500">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-transparent text-white p-4 font-black text-xl outline-none text-right"
                                            value={adjustForm.montoBarberia}
                                            readOnly
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-600 font-bold uppercase pr-4">Se deduce automáticamente del total</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-neutral-500 uppercase px-4 tracking-widest">Razón del Ajuste</label>
                                <textarea
                                    className="w-full bg-neutral-800 text-white p-5 rounded-[32px] border border-neutral-700 outline-none focus:border-primary-500 transition-all h-32 resize-none"
                                    placeholder="Ej: Descuento manual aplicado, propina extra manejada en sitio, corrección de convenio..."
                                    value={adjustForm.razon}
                                    onChange={(e) => setAdjustForm({ ...adjustForm, razon: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1 py-4 font-black text-neutral-400"
                                    onClick={() => setShowAdjustModal(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-[2] py-4 font-black"
                                >
                                    <Check size={20} />
                                    Confirmar Ajuste
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
