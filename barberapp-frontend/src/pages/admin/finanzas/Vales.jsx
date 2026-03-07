import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Receipt, Plus, Trash2, CheckCircle2, Clock, Loader2,
    CircleDollarSign, User, X, ChevronDown
} from "lucide-react";
import { Card, Button, Badge } from "../../../components/ui";
import DateRangePicker from "../../../components/ui/DateRangePicker";
import {
    obtenerVales, registrarVale, actualizarVale, eliminarVale
} from "../../../services/valesService";
import { getBarberos as obtenerBarberos } from "../../../services/barberosService";
import dayjs from "dayjs";

const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n || 0);

const ESTADO_COLORS = {
    PENDIENTE: "bg-amber-50 text-amber-700",
    DESCONTADO: "bg-green-50 text-green-700"
};

export default function Vales() {
    const [vales, setVales] = useState([]);
    const [barberos, setBarberos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filtro, setFiltro] = useState({ fechaInicio: dayjs().startOf("month").format("YYYY-MM-DD"), fechaFin: dayjs().format("YYYY-MM-DD") });
    const [form, setForm] = useState({ barberoId: "", monto: "", descripcion: "Adelanto de comisión", fecha: dayjs().format("YYYY-MM-DD"), metodoPago: "EFECTIVO" });

    useEffect(() => { cargar(); }, [filtro]);
    useEffect(() => { cargarBarberos(); }, []);

    const cargar = async () => {
        try {
            setLoading(true);
            const data = await obtenerVales(filtro);
            setVales(data.vales || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const cargarBarberos = async () => {
        try {
            const data = await obtenerBarberos();
            setBarberos(Array.isArray(data) ? data : (data.barberos || []));
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await registrarVale({ ...form, monto: Number(form.monto) });
            setShowModal(false);
            setForm({ barberoId: "", monto: "", descripcion: "Adelanto de comisión", fecha: dayjs().format("YYYY-MM-DD"), metodoPago: "EFECTIVO" });
            await cargar();
        } catch (err) { alert(err.response?.data?.message || "Error al registrar vale"); }
        finally { setSaving(false); }
    };

    const marcarDescontado = async (id) => {
        try {
            await actualizarVale(id, { estado: "DESCONTADO" });
            await cargar();
        } catch (e) { console.error(e); }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Eliminar este vale?")) return;
        try { await eliminarVale(id); await cargar(); }
        catch (e) { console.error(e); }
    };

    const totalPendiente = vales.filter(v => v.estado === "PENDIENTE").reduce((s, v) => s + v.monto, 0);
    const totalDescontado = vales.filter(v => v.estado === "DESCONTADO").reduce((s, v) => s + v.monto, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <Receipt className="text-amber-500" size={32} />
                        Vales
                    </h1>
                    <p className="body-large text-gray-600 mt-1">Adelantos y anticipos entregados al equipo</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black">
                    <Plus size={18} /> Nuevo Vale
                </Button>
            </header>

            {/* Filtros */}
            <Card className="p-5 border-none ring-1 ring-gray-100 bg-white">
                <div className="flex flex-wrap items-center gap-4">
                    <DateRangePicker
                        fechaInicio={filtro.fechaInicio}
                        fechaFin={filtro.fechaFin}
                        onChange={({ fechaInicio: i, fechaFin: f }) =>
                            setFiltro({ fechaInicio: i, fechaFin: f })}
                        label="Período"
                    />
                </div>
            </Card>


            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "Total Vales", val: vales.length, sub: "en el período", color: "bg-gray-50 text-gray-900" },
                    { label: "Pendiente", val: fmt(totalPendiente), sub: "por descontar", color: "bg-amber-50 text-amber-700" },
                    { label: "Descontado", val: fmt(totalDescontado), sub: "ya aplicado", color: "bg-green-50 text-green-700" },
                ].map(k => (
                    <Card key={k.label} className={`p-6 border-none ring-1 ring-gray-100 ${k.color}`}>
                        <p className="text-xs font-black uppercase tracking-widest opacity-60">{k.label}</p>
                        <p className="text-3xl font-black mt-1">{k.val}</p>
                        <p className="text-xs font-bold opacity-50 mt-1">{k.sub}</p>
                    </Card>
                ))}
            </div>

            {/* Lista */}
            <Card className="p-0 border-none ring-1 ring-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100">
                                {["Fecha", "Barbero", "Descripción", "Monto", "Método", "Estado", ""].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i}><td colSpan="7" className="px-6 py-5 h-14 animate-pulse bg-gray-50/30" /></tr>
                                ))
                            ) : vales.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">Sin vales en el período</td></tr>
                            ) : vales.map(v => (
                                <motion.tr key={v._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50/40 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{v.fecha}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                                <User size={14} className="text-amber-700" />
                                            </div>
                                            <span className="text-sm font-black text-gray-900">
                                                {v.barberoId?.nombre || "—"} {v.barberoId?.apellido || ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{v.descripcion}</td>
                                    <td className="px-6 py-4 text-sm font-black text-gray-900">{fmt(v.monto)}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{v.metodoPago}</td>
                                    <td className="px-6 py-4">
                                        <Badge className={`${ESTADO_COLORS[v.estado]} border-none text-xs font-black px-3`}>
                                            {v.estado === "PENDIENTE" ? <Clock size={10} className="inline mr-1" /> : <CheckCircle2 size={10} className="inline mr-1" />}
                                            {v.estado}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            {v.estado === "PENDIENTE" && (
                                                <button onClick={() => marcarDescontado(v._id)}
                                                    className="p-2 hover:bg-green-50 rounded-xl text-green-600 transition-colors" title="Marcar descontado">
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => handleEliminar(v._id)}
                                                className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors" title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal nuevo vale */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
                        onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-900">Nuevo Vale</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Barbero *</label>
                                    <div className="relative">
                                        <select value={form.barberoId} onChange={e => setForm(f => ({ ...f, barberoId: e.target.value }))}
                                            required className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold appearance-none focus:ring-2 focus:ring-amber-100">
                                            <option value="">Seleccionar barbero</option>
                                            {barberos.map(b => (
                                                <option key={b._id} value={b._id}>{b.nombre} {b.apellido}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Monto *</label>
                                        <div className="relative">
                                            <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input type="number" min="1" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                                                required placeholder="10000"
                                                className="w-full bg-gray-50 border-none rounded-2xl pl-9 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-100" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Fecha *</label>
                                        <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                                            required className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-100" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Descripción</label>
                                    <input type="text" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                        placeholder="ej: Horquilla, adelanto semanal..."
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-100" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Método</label>
                                    <div className="relative">
                                        <select value={form.metodoPago} onChange={e => setForm(f => ({ ...f, metodoPago: e.target.value }))}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold appearance-none focus:ring-2 focus:ring-amber-100">
                                            <option value="EFECTIVO">Efectivo</option>
                                            <option value="TRANSFERENCIA">Transferencia</option>
                                            <option value="OTRO">Otro</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>
                                <Button type="submit" disabled={saving}
                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black mt-2">
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Registrar Vale
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
