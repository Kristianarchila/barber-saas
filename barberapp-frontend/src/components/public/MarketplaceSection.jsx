import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Package, Star } from "lucide-react";
import api from "../../services/api";

const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n || 0);

/**
 * MarketplaceSection — embeds a preview of featured store products
 * in the barbershop public landing page (ModernTemplate / PremiumTemplate).
 *
 * Props:
 *  - colorPrimary: string (theme accent)
 *  - slug: string (barbershop slug)
 */
export default function MarketplaceSection({ colorPrimary = "#cc2b2b", slug: propSlug }) {
    const { slug: paramSlug } = useParams();
    const slug = propSlug || paramSlug;
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                const res = await api.get(`/barberias/${slug}/tienda/productos?destacado=true`);
                const prods = (res.data.productos || []).slice(0, 8);
                setProductos(prods);
                setAvailable(true);
            } catch {
                setAvailable(false);
            } finally { setLoading(false); }
        })();
    }, [slug]);

    if (loading || !available || productos.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-black">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: colorPrimary }}>
                            Tienda Online
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                            Productos Destacados
                        </h2>
                        <p className="text-zinc-500 text-sm mt-2">
                            Llévate los mejores productos para el cuidado en casa
                        </p>
                    </div>
                    <Link to={`/${slug}/tienda`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-zinc-800 text-white text-sm font-black hover:border-zinc-600 transition-all whitespace-nowrap">
                        Ver toda la tienda <ArrowRight size={16} />
                    </Link>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productos.map((p, i) => {
                        const img = p.imagenes?.[0];
                        const price = p.precioDescuento || p.precio;
                        return (
                            <motion.div key={p._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all">
                                <div className="aspect-square bg-zinc-800 overflow-hidden relative">
                                    {img
                                        ? <img src={img} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Package size={32} /></div>}
                                    {p.destacado && (
                                        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-black rounded-full text-black"
                                            style={{ background: colorPrimary }}>
                                            <Star size={9} fill="currentColor" /> TOP
                                        </span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-[10px] text-zinc-600 capitalize font-bold mb-0.5">{p.categoria}</p>
                                    <p className="text-sm font-black text-white line-clamp-2 leading-tight">{p.nombre}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div>
                                            <p className="font-black" style={{ color: colorPrimary }}>{fmt(price)}</p>
                                            {p.precioDescuento && <p className="text-zinc-700 text-xs line-through">{fmt(p.precio)}</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    className="text-center mt-10">
                    <Link to={`/${slug}/tienda`}
                        className="inline-flex items-center gap-2 px-8 py-4 text-black font-black rounded-2xl transition-all hover:opacity-90"
                        style={{ background: colorPrimary }}>
                        <ShoppingBag size={18} /> Ir a la tienda completa
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
