import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Trash2,
    CreditCard,
    Banknote,
    Smartphone,
    ShoppingCart,
    User,
    Percent,
    PlusCircle,
    Scissors,
    Package,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { Card, Button, Input, Badge } from "../../components/ui";
import { ErrorAlert } from "../../components/ErrorComponents";
import { getServicios } from "../../services/serviciosService";
import { obtenerProductos } from "../../services/productosService";
import { getBarberos } from "../../services/barberosService";
import { useParams } from "react-router-dom";
import { registrarVenta } from "../../services/ventaService";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ensureArray } from "../../utils/validateData";

export default function VentaRapida() {
    const { slug } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [servicios, setServicios] = useState([]);
    const [productos, setProductos] = useState([]);
    const [barberos, setBarberos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [selectedBarbero, setSelectedBarbero] = useState("");
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [showConfirm, setShowConfirm] = useState(false);
    const [descuentoTipo, setDescuentoTipo] = useState("monto"); // 'monto' | 'porcentaje'
    const [descuentoValor, setDescuentoValor] = useState("");
    const [showMobileCart, setShowMobileCart] = useState(false);


    // Hook para cargar datos iniciales
    const { execute: fetchData, loading, error } = useApiCall(
        async () => {
            const [servs, dataProds, barbs] = await Promise.all([
                getServicios(slug),
                obtenerProductos(slug),
                getBarberos(slug)
            ]);
            return { servs, dataProds, barbs };
        },
        {
            errorMessage: 'Error al cargar los datos. Por favor, recarga la página.',
            onSuccess: ({ servs, dataProds, barbs }) => {
                setServicios(ensureArray(servs));
                setProductos(ensureArray(dataProds.productos || dataProds));
                setBarberos(ensureArray(barbs));
            }
        }
    );

    useEffect(() => {
        fetchData();
    }, []);

    const addToCart = (item, type) => {
        setCarrito([...carrito, { ...item, type, id_carrito: Date.now() }]);
    };

    const removeFromCart = (id) => {
        setCarrito(carrito.filter(item => item.id_carrito !== id));
    };

    const subtotal = carrito.reduce((acc, item) => acc + (item.precio || item.precioVenta || 0), 0);
    const descuento = (() => {
        const v = parseFloat(descuentoValor) || 0;
        if (descuentoTipo === "porcentaje") return Math.round(subtotal * (Math.min(v, 100) / 100));
        return Math.min(v, subtotal);
    })();
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal - descuento;
    const neto = total - iva;

    const filteredItems = [
        ...ensureArray(servicios).map(s => ({ ...s, type: 'servicio' })),
        ...ensureArray(productos).map(p => ({ ...p, type: 'producto', nombre: p.nombreProducto || p.nombre }))
    ].filter(item => (item.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()));

    // Hook para finalizar venta con protección contra doble click
    const { execute: handleFinish, loading: procesando } = useAsyncAction(
        async () => {
            if (carrito.length === 0) {
                throw new Error('El carrito está vacío');
            }

            const ventaData = {
                barberoId: selectedBarbero || null,
                items: carrito.map(item => ({
                    type: item.type,
                    itemId: item.id || item._id,
                    nombre: item.nombre || item.nombreProducto,
                    precio: item.precio || item.precioVenta || 0,
                    cantidad: 1,
                    subtotal: item.precio || item.precioVenta || 0
                })),
                subtotal,
                descuento,
                iva,
                total,
                metodoPago
            };

            return await registrarVenta(ventaData);
        },
        {
            successMessage: '✅ Venta registrada exitosamente',
            errorMessage: 'Error al registrar la venta',
            onSuccess: () => {
                setCarrito([]);
                setShowConfirm(false);
                setDescuentoValor("");
                setDescuentoTipo("monto");
                setSelectedBarbero("");
            }
        }
    );

    if (loading) return <div className="p-12 text-center body-large text-gray-600">Cargando módulos de venta profesional...</div>;

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <ErrorAlert
                    title="Error al cargar datos"
                    message={error}
                    onRetry={fetchData}
                    variant="error"
                />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24 lg:pb-8">
            {/* HEADER BUSQUEDA */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Busca servicios o productos..."
                    className="w-full bg-white border border-gray-200 rounded-xl md:rounded-2xl py-3.5 md:py-6 pl-10 md:pl-14 pr-4 text-gray-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-sm md:text-xl shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* COLUMNA IZQUIERDA: SELECTOR */}
                <div className="lg:col-span-12">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <span className="badge badge-primary px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-sm cursor-pointer whitespace-nowrap">Todos</span>
                        <span className="badge px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-sm cursor-pointer bg-white border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">Servicios</span>
                        <span className="badge px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-sm cursor-pointer bg-white border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">Productos</span>
                        <span className="badge px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-sm cursor-pointer bg-white border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">Tratamientos</span>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {filteredItems.slice(0, 10).map((item) => (
                            <div
                                key={`${item.type}-${item.id || item._id}`}
                                className="card p-5 hover:shadow-xl cursor-pointer transition-all group border border-gray-100 hover:border-blue-200 relative overflow-hidden"
                                onClick={() => addToCart(item, item.type)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all text-gray-400">
                                        {item.type === 'servicio' ? <Scissors size={24} /> : <Package size={24} />}
                                    </div>
                                    <div className="text-right">
                                        <span className="heading-4 text-gray-900 block">${(item.precio || item.precioVenta || 0).toLocaleString()}</span>
                                        <span className="caption text-gray-400 font-bold uppercase tracking-widest">{item.type}</span>
                                    </div>
                                </div>
                                <h3 className="heading-4 text-gray-800 line-clamp-1 group-hover:text-blue-700 transition-colors">{item.nombre}</h3>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMNA DERECHA: CARRITO Y RESUMEN — hidden on mobile, shown in bottom sheet */}
                <div className="hidden lg:block lg:col-span-5 space-y-6">
                    <div className="card shadow-2xl border-none overflow-hidden flex flex-col sticky top-8">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100/50 rounded-lg">
                                    <ShoppingCart size={20} className="text-blue-600" />
                                </div>
                                <h2 className="heading-4 text-gray-900">Detalle de Venta</h2>
                            </div>
                            <span className="badge badge-primary">{carrito.length} items</span>
                        </div>

                        <div className="max-h-[350px] overflow-y-auto p-4 space-y-3 bg-white">
                            {carrito.length === 0 ? (
                                <div className="py-20 text-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart size={32} className="opacity-20" />
                                    </div>
                                    <p className="body font-bold">Resumen Vacío</p>
                                    <p className="caption">Selecciona servicios o productos</p>
                                </div>
                            ) : (
                                carrito.map((item) => (
                                    <div key={item.id_carrito} className="flex items-center justify-between bg-gray-50/30 p-4 rounded-2xl border border-gray-50 group hover:border-blue-100 transition-all">
                                        <div>
                                            <p className="body font-bold text-gray-900">{item.nombre}</p>
                                            <p className="caption text-blue-600 font-bold uppercase tracking-wider">{item.type}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="heading-4 text-gray-900 font-mono">${(item.precio || item.precioVenta || 0).toLocaleString()}</span>
                                            <button
                                                onClick={() => removeFromCart(item.id_carrito)}
                                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* DESCUENTO */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-white">
                            <h4 className="caption text-gray-400 font-bold uppercase tracking-widest mb-3">Descuento</h4>
                            <div className="flex gap-2">
                                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setDescuentoTipo("monto")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${descuentoTipo === "monto" ? 'bg-white text-blue-700 shadow' : 'text-gray-500'}`}
                                    >$</button>
                                    <button
                                        type="button"
                                        onClick={() => setDescuentoTipo("porcentaje")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${descuentoTipo === "porcentaje" ? 'bg-white text-blue-700 shadow' : 'text-gray-500'}`}
                                    >%</button>
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    max={descuentoTipo === "porcentaje" ? 100 : subtotal}
                                    value={descuentoValor}
                                    onChange={e => setDescuentoValor(e.target.value)}
                                    placeholder={descuentoTipo === "porcentaje" ? "Ej: 10" : "Ej: 2000"}
                                    className="input flex-1 text-sm"
                                />
                            </div>
                            {descuento > 0 && (
                                <p className="caption text-green-600 font-bold mt-1.5">
                                    Descuento aplicado: -${descuento.toLocaleString()}
                                </p>
                            )}
                        </div>

                        {/* RESUMEN PRECIOS (ESTILO RECIBO) */}
                        <div className="p-6 bg-gray-900 space-y-4 rounded-t-3xl shadow-2xl relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full"></div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal Acumulado</span>
                                <span className="text-gray-200 font-bold font-mono text-lg">${subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Ajustes / Descuentos</span>
                                    <Percent size={12} className="text-blue-500" />
                                </div>
                                <span className="text-red-400 font-bold font-mono">-${descuento.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm py-4 border-y border-gray-800 border-dashed">
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">IVA Aplicado (19%)</span>
                                <span className="text-gray-400 font-bold font-mono">${iva.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <div>
                                    <p className="text-white font-black text-2xl tracking-tighter uppercase">Total</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Neto: ${neto.toLocaleString()}</p>
                                </div>
                                <p className="text-5xl font-black text-blue-500 font-mono tracking-tighter">${total.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* SELECCION BARBERO */}
                        <div className="p-6 bg-white space-y-4">
                            <h4 className="caption text-gray-400 font-bold uppercase tracking-widest pl-1">Asignar Barbero</h4>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {barberos.map(b => (
                                    <button
                                        key={b._id}
                                        onClick={() => setSelectedBarbero(b._id)}
                                        className={`flex flex-col items-center gap-2 p-3 min-w-[90px] rounded-2xl border-2 transition-all ${selectedBarbero === b._id ? 'bg-blue-50 border-blue-600 shadow-sm' : 'bg-white border-gray-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                            {b.foto ? <img src={b.foto} alt={b.nombre} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                                        </div>
                                        <span className={`text-[10px] font-bold truncate w-full text-center ${selectedBarbero === b._id ? 'text-blue-700' : 'text-gray-500'}`}>{b.nombre.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* METODO DE PAGO */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-5">
                            <h4 className="caption text-gray-400 font-bold uppercase tracking-widest pl-1">Método de Pago</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'EFECTIVO', icon: <Banknote size={22} />, label: 'Efectivo' },
                                    { id: 'TARJETA', icon: <CreditCard size={22} />, label: 'Tarjeta' },
                                    { id: 'TRANSFERENCIA', icon: <Smartphone size={22} />, label: 'Transf.' }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMetodoPago(m.id)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${metodoPago === m.id ? 'bg-white border-blue-600 text-blue-600 shadow-lg -translate-y-1' : 'bg-white border-transparent text-gray-400 hover:bg-white hover:border-gray-200'}`}
                                    >
                                        {m.icon}
                                        <span className="text-[10px] font-black tracking-wider uppercase">{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={carrito.length === 0}
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full btn btn-primary py-7 rounded-3xl font-black text-xl shadow-xl disabled:opacity-50 flex items-center justify-center gap-4 transition-all active:scale-95 group"
                                >
                                    PROCEDER AL PAGO
                                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE ONLY: Fixed bottom cart bar ────────────────── */}
            <div className="lg:hidden fixed bottom-[84px] left-0 right-0 z-40 px-4 pb-1">
                <button
                    onClick={() => setShowMobileCart(true)}
                    className="w-full flex items-center justify-between bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ShoppingCart size={20} />
                            {carrito.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-black flex items-center justify-center">
                                    {carrito.length}
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-bold">
                            {carrito.length === 0 ? 'Carrito vacío' : `${carrito.length} item${carrito.length > 1 ? 's' : ''}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-black font-mono">${total.toLocaleString()}</span>
                        <span className={`text-xs font-black px-4 py-1.5 rounded-xl ${carrito.length > 0 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                            {carrito.length > 0 ? 'PAGAR' : 'VER'}
                        </span>
                    </div>
                </button>
            </div>

            {/* ── MOBILE CART BOTTOM SHEET ─────────────────────────────── */}
            {showMobileCart && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileCart(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[90vh] pb-8">
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        </div>
                        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={18} className="text-blue-600" />
                                <h2 className="font-bold text-gray-900">Detalle de Venta</h2>
                                <span className="badge badge-primary text-xs">{carrito.length} items</span>
                            </div>
                            <button onClick={() => setShowMobileCart(false)} className="text-gray-400 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 space-y-3 min-h-[80px]">
                            {carrito.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">
                                    <ShoppingCart size={28} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm font-semibold">Carrito vacío</p>
                                    <p className="text-xs">Agrega servicios o productos</p>
                                </div>
                            ) : carrito.map((item) => (
                                <div key={item.id_carrito} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{item.nombre}</p>
                                        <p className="text-[10px] text-blue-600 font-bold uppercase">{item.type}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="font-bold font-mono text-sm">${(item.precio || item.precioVenta || 0).toLocaleString()}</span>
                                        <button onClick={() => removeFromCart(item.id_carrito)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 pb-3 border-t border-gray-100 pt-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descuento</p>
                            <div className="flex gap-2">
                                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                                    <button type="button" onClick={() => setDescuentoTipo("monto")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${descuentoTipo === "monto" ? 'bg-white text-blue-700 shadow' : 'text-gray-500'}`}>$</button>
                                    <button type="button" onClick={() => setDescuentoTipo("porcentaje")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${descuentoTipo === "porcentaje" ? 'bg-white text-blue-700 shadow' : 'text-gray-500'}`}>%</button>
                                </div>
                                <input type="number" min={0} value={descuentoValor} onChange={e => setDescuentoValor(e.target.value)} placeholder={descuentoTipo === "porcentaje" ? "Ej: 10" : "Ej: 2000"} className="input flex-1 text-sm" />
                            </div>
                        </div>
                        {barberos.length > 0 && (
                            <div className="px-4 pb-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Barbero</p>
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                    {barberos.map(b => (
                                        <button key={b._id} onClick={() => setSelectedBarbero(b._id)}
                                            className={`flex flex-col items-center gap-1.5 p-2 min-w-[64px] rounded-xl border-2 transition-all flex-shrink-0 ${selectedBarbero === b._id ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-100 opacity-60'}`}>
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {b.foto ? <img src={b.foto} alt={b.nombre} className="w-full h-full object-cover" /> : <User size={16} className="text-gray-400" />}
                                            </div>
                                            <span className="text-[9px] font-bold truncate w-full text-center">{b.nombre.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mx-4 bg-gray-900 rounded-2xl p-4 space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-gray-200 font-mono font-bold">${subtotal.toLocaleString()}</span>
                            </div>
                            {descuento > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Descuento</span>
                                    <span className="text-red-400 font-mono font-bold">-${descuento.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-gray-800">
                                <span className="text-white font-black text-lg">Total</span>
                                <span className="text-blue-400 font-black text-2xl font-mono">${total.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="px-4 mb-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Método de Pago</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'EFECTIVO', icon: <Banknote size={18} />, label: 'Efectivo' },
                                    { id: 'TARJETA', icon: <CreditCard size={18} />, label: 'Tarjeta' },
                                    { id: 'TRANSFERENCIA', icon: <Smartphone size={18} />, label: 'Transf.' }
                                ].map(m => (
                                    <button key={m.id} onClick={() => setMetodoPago(m.id)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${metodoPago === m.id ? 'bg-white border-blue-600 text-blue-600 shadow-md' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                        {m.icon}
                                        <span className="text-[10px] font-black uppercase">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="px-4">
                            <button
                                disabled={carrito.length === 0}
                                onClick={() => { setShowMobileCart(false); setShowConfirm(true); }}
                                className="w-full bg-blue-600 text-white font-black text-base py-4 rounded-2xl shadow-lg disabled:opacity-40 active:scale-95 transition-all"
                            >
                                PROCEDER AL PAGO →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMACION */}
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="card card-padding w-full max-w-sm text-center space-y-8 animate-zoom-in relative">
                        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle size={48} className="text-amber-500" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="heading-2">¿Confirmar Venta?</h2>
                            <p className="body text-gray-500">Verifica los items y el total antes de procesar el pago final.</p>
                        </div>

                        <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 shadow-inner">
                            <p className="caption text-gray-500 font-bold uppercase tracking-widest mb-1">Total a Recibir</p>
                            <p className="text-4xl font-black text-white font-mono tracking-tighter">${total.toLocaleString()}</p>
                            <div className="mt-4 flex justify-center">
                                <span className="badge badge-primary px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]">{metodoPago}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleFinish}
                                disabled={procesando}
                                className="btn btn-primary py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {procesando ? 'Procesando...' : 'Confirmar y Finalizar'}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={procesando}
                                className="btn btn-ghost py-4 font-bold text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Revisar Carrito
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
