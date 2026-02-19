import { useEffect, useState } from "react";
import { obtenerHistorialVentas } from "../../services/ventaService";
import { getBarberos } from "../../services/barberosService";
import { Card, Button, Badge, Skeleton } from "../../components/ui";
import {
    Receipt,
    Calendar,
    User,
    Filter,
    Search,
    Download,
    X,
    Eye,
    CreditCard,
    Banknote,
    Smartphone,
    ShoppingBag,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import { motion, AnimatePresence } from "framer-motion";

dayjs.locale('es');

export default function HistorialVentas() {
    const [ventas, setVentas] = useState([]);
    const [barberos, setBarberos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [filtros, setFiltros] = useState({
        fechaInicio: "",
        fechaFin: "",
        barberoId: "",
        metodoPago: "",
        limite: 50
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Modal de detalle
    const [selectedVenta, setSelectedVenta] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchVentas();
    }, [filtros]);

    const fetchInitialData = async () => {
        try {
            const barbs = await getBarberos();
            setBarberos(barbs);
        } catch (error) {
            console.error("Error fetching barbiers:", error);
        }
    };

    const fetchVentas = async () => {
        setLoading(true);
        try {
            const data = await obtenerHistorialVentas(filtros);
            setVentas(data.ventas || []);
        } catch (error) {
            console.error("Error cargando historial de ventas:", error);
            setVentas([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const getMetodoPagoIcon = (metodo) => {
        switch (metodo) {
            case 'EFECTIVO': return <Banknote size={16} />;
            case 'TARJETA': return <CreditCard size={16} />;
            case 'TRANSFERENCIA': return <Smartphone size={16} />;
            default: return <Receipt size={16} />;
        }
    };

    const handleOpenDetail = (venta) => {
        setSelectedVenta(venta);
        setShowDetailModal(true);
    };

    // Estadísticas rápidas
    const stats = {
        totalVentas: ventas.length,
        recaudacionTotal: ventas.reduce((acc, v) => acc + (v.total || 0), 0),
        ticketPromedio: ventas.length > 0
            ? Math.round(ventas.reduce((acc, v) => acc + (v.total || 0), 0) / ventas.length)
            : 0,
        ventaMasAlta: ventas.length > 0 ? Math.max(...ventas.map(v => v.total)) : 0
    };

    const ventasFiltradas = ventas.filter(v => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            v.items.some(item => item.nombre.toLowerCase().includes(term)) ||
            (v.barberoId?.nombre || "").toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <ShoppingBag className="text-blue-600" size={32} />
                        Historial de Ventas POS
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Registro itemizado de todas las ventas rápidas y transacciones de mostrador
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white shadow-sm ring-1 ring-gray-100 border-none px-6 py-4 rounded-2xl font-black transition-all hover:bg-gray-50">
                        <Download size={20} className="mr-2" />
                        Exportar Reporte
                    </Button>
                </div>
            </header>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white group hover:ring-blue-200 transition-all">
                    <p className="caption font-black text-gray-400 uppercase tracking-widest mb-2">Ventas Realizadas</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-gray-900 leading-none">{stats.totalVentas}</h3>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Receipt size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white group hover:ring-green-200 transition-all">
                    <p className="caption font-black text-gray-400 uppercase tracking-widest mb-2">Recaudación Periodo</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 leading-none">{formatCurrency(stats.recaudacionTotal)}</h3>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white group hover:ring-amber-200 transition-all">
                    <p className="caption font-black text-gray-400 uppercase tracking-widest mb-2">Ticket Promedio</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 leading-none">{formatCurrency(stats.ticketPromedio)}</h3>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white group hover:ring-indigo-200 transition-all">
                    <p className="caption font-black text-gray-400 uppercase tracking-widest mb-2">Venta más Alta</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 leading-none">{formatCurrency(stats.ventaMasAlta)}</h3>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* FILTROS */}
            <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl text-blue-600">
                            <Filter size={20} />
                        </div>
                        <h3 className="heading-4">Panel de Filtros</h3>
                    </div>
                    <button
                        className="text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        onClick={() => setFiltros({ fechaInicio: "", fechaFin: "", barberoId: "", metodoPago: "", limite: 50 })}
                    >
                        Resetear
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Desde</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all"
                            value={filtros.fechaInicio}
                            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Hasta</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all"
                            value={filtros.fechaFin}
                            onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Atendido por</label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all appearance-none"
                            value={filtros.barberoId}
                            onChange={(e) => setFiltros({ ...filtros, barberoId: e.target.value })}
                        >
                            <option value="">Todos los Barberos</option>
                            {barberos.map(b => <option key={b._id} value={b._id}>{b.nombre}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="caption font-black text-gray-400 uppercase tracking-widest block">Medio de Pago</label>
                        <select
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all appearance-none"
                            value={filtros.metodoPago}
                            onChange={(e) => setFiltros({ ...filtros, metodoPago: e.target.value })}
                        >
                            <option value="">Cualquier Medio</option>
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TARJETA">Tarjeta</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* TABLA DE RESULTADOS */}
            <Card className="shadow-sm border-none ring-1 ring-gray-100 bg-white overflow-hidden p-0">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por producto vendio o barbero..."
                            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none body-small font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="caption font-black text-gray-400 uppercase tracking-widest">
                        {ventasFiltradas.length} resultados encontrados
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest">Fecha & Hora</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest">Profesional</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest">Contenido</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest">Pago</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                                <th className="px-8 py-5 caption font-black text-gray-400 uppercase tracking-widest text-right">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan="6" className="px-8 py-6">
                                            <Skeleton variant="text" height="h-6" className="w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : ventasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="max-w-xs mx-auto space-y-6">
                                            <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto ring-1 ring-gray-100">
                                                <ShoppingBag className="text-gray-200" size={40} />
                                            </div>
                                            <div>
                                                <h4 className="heading-4 text-gray-900">Sin Registros</h4>
                                                <p className="body-small text-gray-500 mt-2">No se han encontrado ventas POS con el filtro actual.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                ventasFiltradas.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="body-small font-black text-gray-900 mb-1">
                                                {dayjs(v.fecha).format('DD [de] MMMM')}
                                            </p>
                                            <p className="caption font-bold text-gray-400">
                                                {dayjs(v.fecha).format('HH:mm [hrs]')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">
                                                    {v.barberoId?.nombre.charAt(0) || "B"}
                                                </div>
                                                <span className="body-small font-black text-gray-900">{v.barberoId?.nombre || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant="neutral" className="bg-gray-100 text-gray-600 font-black">
                                                {v.items.length} {v.items.length === 1 ? 'Item' : 'Items'}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-600 font-bold body-small">
                                                {getMetodoPagoIcon(v.metodoPago)}
                                                <span className="tracking-tighter">{v.metodoPago}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-gray-900 body-small">
                                            {formatCurrency(v.total)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleOpenDetail(v)}
                                                className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all group-hover:shadow-lg"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* MODAL DETALLE */}
            <AnimatePresence>
                {showDetailModal && selectedVenta && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                                        <Receipt size={28} />
                                    </div>
                                    <div>
                                        <h3 className="heading-3 leading-none">Detalle de Transacción</h3>
                                        <p className="caption font-black text-gray-400 uppercase tracking-widest mt-2 px-0.5">
                                            ID: {selectedVenta.id.slice(-8)} • {dayjs(selectedVenta.fecha).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-4 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-400 hover:text-gray-900 ring-1 ring-transparent hover:ring-gray-100"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 space-y-10">
                                {/* ITEM LIST */}
                                <div className="space-y-4">
                                    <h4 className="caption font-black text-gray-400 uppercase tracking-widest pl-1">Resumen de Cargo</h4>
                                    <div className="space-y-3">
                                        {selectedVenta.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-3xl border border-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                        {item.type === 'servicio' ? <ShoppingBag size={20} /> : <ShoppingBag size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="body-small font-black text-gray-900">{item.nombre}</p>
                                                        <p className="caption font-bold text-gray-400 capitalize">{item.type} • Cant. {item.cantidad}</p>
                                                    </div>
                                                </div>
                                                <p className="body-small font-black text-gray-900">{formatCurrency(item.subtotal)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* TOTALES TICKET STYLE */}
                                <div className="bg-gray-900 rounded-[32px] p-8 space-y-5 shadow-xl relative overflow-hidden">
                                    {/* Decorative dots */}
                                    <div className="absolute top-0 left-0 w-full h-1 flex justify-between px-10 gap-2 overflow-hidden">
                                        {[...Array(20)].map((_, i) => <div key={i} className="w-2 h-2 bg-white/10 rounded-full shrink-0"></div>)}
                                    </div>

                                    <div className="flex justify-between items-center text-gray-400 body-small font-bold">
                                        <span>Subtotal Neto</span>
                                        <span className="font-black text-white">{formatCurrency(selectedVenta.subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-gray-400 body-small font-bold">
                                        <span>Descuentos Aplicados</span>
                                        <span className="font-black text-red-400">-{formatCurrency(selectedVenta.descuento)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-gray-400 body-small font-bold border-t border-gray-800 pt-5">
                                        <span>Impuestos Estimados (19%)</span>
                                        <span className="font-bold text-gray-500">{formatCurrency(selectedVenta.iva)}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Total Pagado</h3>
                                        <h3 className="text-4xl font-black text-blue-500 font-mono tracking-tighter">{formatCurrency(selectedVenta.total)}</h3>
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <Badge className="bg-blue-600/20 text-blue-400 border-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                                            Pagado vía {selectedVenta.metodoPago}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-900 py-5 rounded-3xl font-black border border-gray-200 transition-all shadow-sm">
                                    Imprimir Duplicado
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black shadow-lg shadow-blue-100 transition-all"
                                >
                                    Cerrar Vista
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
