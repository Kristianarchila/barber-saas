import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, ArrowLeft, Plus, Minus, X, Send, ChevronDown } from "lucide-react";
import api from "../../services/api";
import { CartProvider, useCart } from "../../context/CartContext";

const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n || 0);

export default function Tienda() {
    const { slug } = useParams();
    return (
        <CartProvider slug={slug}>
            <TiendaInner slug={slug} />
        </CartProvider>
    );
}

function TiendaInner({ slug }) {
    const [marketplace, setMarketplace] = useState(null);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState("todos");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const { count } = useCart();

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/barberias/${slug}/tienda/productos`);
                setMarketplace(res.data.marketplace);
                setProductos(res.data.productos);
                const cats = [...new Set(res.data.productos.map(p => p.categoria))];
                setCategorias(cats);
            } catch (e) {
                setError(e.response?.data?.message || "Tienda no disponible");
            } finally { setLoading(false); }
        })();
    }, [slug]);

    const filtrados = categoriaActiva === "todos"
        ? productos
        : productos.filter(p => p.categoria === categoriaActiva);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-center px-4">
            <div>
                <Package size={60} className="text-zinc-700 mx-auto mb-4" />
                <h2 className="text-white text-2xl font-black mb-2">Tienda no disponible</h2>
                <p className="text-zinc-500 mb-6">{error}</p>
                <Link to={`/${slug}`} className="text-amber-400 hover:underline flex items-center gap-2 justify-center">
                    <ArrowLeft size={16} /> Volver a la barbería
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-900">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to={`/${slug}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
                        <ArrowLeft size={16} /> Volver
                    </Link>
                    <h1 className="font-black text-white text-lg">🛒 Tienda</h1>
                    <button onClick={() => setShowCart(true)} className="relative p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                        <ShoppingCart size={22} className="text-white" />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-black text-xs font-black rounded-full flex items-center justify-center">{count}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Banner */}
            {marketplace?.bannerUrl && (
                <div className="h-52 relative overflow-hidden">
                    <img src={marketplace.bannerUrl} alt="Tienda" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950" />
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-zinc-300 text-sm">{marketplace.descripcion}</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Category filter */}
                {categorias.length > 0 && (
                    <div className="flex gap-2 mb-8 flex-wrap">
                        {["todos", ...categorias].map(cat => (
                            <button key={cat} onClick={() => setCategoriaActiva(cat)}
                                className={`px-4 py-2 rounded-2xl text-xs font-black capitalize transition-all
                                    ${categoriaActiva === cat
                                        ? "bg-amber-400 text-black"
                                        : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"}`}>
                                {cat === "todos" ? "Todos" : cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Product grid */}
                {filtrados.length === 0 ? (
                    <div className="text-center py-20 text-zinc-600">
                        <Package size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">No hay productos en esta categoría</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtrados.map((p, i) => (
                            <ProductCard key={p._id} producto={p} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* Cart drawer */}
            <AnimatePresence>
                {showCart && <CartDrawer onClose={() => setShowCart(false)} onCheckout={() => { setShowCart(false); setShowCheckout(true); }} slug={slug} />}
                {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} whatsapp={marketplace?.whatsapp} slug={slug} />}
            </AnimatePresence>
        </div>
    );
}

function ProductCard({ producto, index }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);
    const img = producto.imagenes?.[0];
    const price = producto.precioDescuento || producto.precio;

    const handleAdd = (e) => {
        e.preventDefault();
        addItem(producto);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-all">
            <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                {img
                    ? <img src={img} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Package size={40} /></div>
                }
                {producto.destacado && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-black text-[10px] font-black rounded-full">DESTACADO</span>
                )}
                {producto.precioDescuento && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                        -{Math.round((1 - producto.precioDescuento / producto.precio) * 100)}%
                    </span>
                )}
            </div>
            <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-zinc-500 capitalize mb-0.5">{producto.categoria}</p>
                <p className="text-sm font-black text-white leading-tight flex-1 line-clamp-2">{producto.nombre}</p>
                <div className="mt-2 flex items-center justify-between">
                    <div>
                        <p className="text-amber-400 font-black text-base">{fmt(price)}</p>
                        {producto.precioDescuento && <p className="text-zinc-600 text-xs line-through">{fmt(producto.precio)}</p>}
                    </div>
                    <button onClick={handleAdd} disabled={producto.stock === 0}
                        className={`p-2 rounded-xl transition-all text-sm font-black
                            ${producto.stock === 0 ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                : added ? "bg-green-500 text-white"
                                    : "bg-amber-400 text-black hover:bg-amber-300"}`}>
                        {producto.stock === 0 ? "Sin stock" : added ? "✓" : <Plus size={16} />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function CartDrawer({ onClose, onCheckout, slug }) {
    const { items, removeItem, updateQty, total, count } = useCart();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70" onClick={onClose}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }}
                onClick={e => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-zinc-950 border-l border-zinc-800 flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                    <h2 className="font-black text-white">Mi carrito ({count})</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl"><X size={18} /></button>
                </div>
                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
                        <ShoppingCart size={48} className="opacity-30" />
                        <p className="font-bold text-sm">Tu carrito está vacío</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.map(item => (
                                <div key={item._id} className="flex gap-3 bg-zinc-900 rounded-2xl p-3">
                                    <div className="w-16 h-16 bg-zinc-800 rounded-xl flex-shrink-0 overflow-hidden">
                                        {item.imagenes?.[0]
                                            ? <img src={item.imagenes[0]} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-zinc-600"><Package size={20} /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-white truncate">{item.nombre}</p>
                                        <p className="text-amber-400 font-black text-sm">{fmt((item.precioDescuento || item.precio) * item.qty)}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center"><Minus size={12} /></button>
                                            <span className="text-white text-sm font-black w-4 text-center">{item.qty}</span>
                                            <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center"><Plus size={12} /></button>
                                            <button onClick={() => removeItem(item._id)} className="ml-auto text-zinc-600 hover:text-red-400"><X size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-5 border-t border-zinc-800 space-y-3">
                            <div className="flex justify-between text-white font-black text-lg">
                                <span>Total</span>
                                <span className="text-amber-400">{fmt(total)}</span>
                            </div>
                            <button onClick={onCheckout}
                                className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2">
                                <Send size={16} /> Hacer pedido por WhatsApp
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

function CheckoutModal({ onClose, whatsapp, slug }) {
    const { items, total, clearCart } = useCart();
    const [form, setForm] = useState({ nombre: "", telefono: "", direccion: "", notas: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        const lineas = items.map(i => `• ${i.nombre} x${i.qty} = ${fmt((i.precioDescuento || i.precio) * i.qty)}`).join("\n");
        const msg = encodeURIComponent(
            `🛒 *Pedido desde ${window.location.host}/${slug}*\n\n` +
            `*Nombre:* ${form.nombre}\n*Teléfono:* ${form.telefono}\n*Dirección:* ${form.direccion || "Retiro en local"}\n\n` +
            `*Productos:*\n${lineas}\n\n*Total: ${fmt(total)}*\n\n${form.notas ? `Notas: ${form.notas}` : ""}`
        );
        const wa = (whatsapp || "").replace(/\D/g, "");
        window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
        clearCart();
        onClose();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-black text-white text-lg">Datos del pedido</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {[
                        { key: "nombre", label: "Tu nombre *", placeholder: "Juan Pérez", required: true },
                        { key: "telefono", label: "Teléfono *", placeholder: "+56 9 1234 5678", required: true },
                        { key: "direccion", label: "Dirección (o retiro en local)", placeholder: "Av. Ejemplo 123", required: false },
                        { key: "notas", label: "Notas adicionales", placeholder: "Ej: sin picante, por favor", required: false },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">{f.label}</label>
                            <input value={form[f.key]} required={f.required} placeholder={f.placeholder}
                                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-amber-400 transition-colors" />
                        </div>
                    ))}
                    <div className="bg-zinc-800 rounded-2xl p-4 flex justify-between items-center">
                        <span className="text-zinc-400 text-sm font-bold">Total a pagar</span>
                        <span className="text-amber-400 font-black text-xl">{fmt(total)}</span>
                    </div>
                    <button type="submit"
                        className="w-full py-4 bg-green-500 hover:bg-green-400 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all">
                        <Send size={18} /> Enviar por WhatsApp
                    </button>
                    <p className="text-zinc-600 text-xs text-center">Se abrirá WhatsApp con tu pedido listo para enviar</p>
                </form>
            </motion.div>
        </motion.div>
    );
}
