import { Star, Quote } from 'lucide-react';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import { motion } from 'framer-motion';

export default function ReviewsSection({ resenas = [] }) {
    const theme = useBarberiaTheme();

    if (resenas.length === 0) return null;

    return (
        <section id="resenas" className="py-24 bg-neutral-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: theme.colorPrimary }}>
                            Testimonios
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black mt-2 uppercase tracking-tighter italic">
                            Lo que dicen nuestros <span className="text-neutral-500">Clientes</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-6 py-3 rounded-2xl">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={18} className="fill-current text-amber-500" />
                            ))}
                        </div>
                        <span className="font-bold text-xl">5.0</span>
                        <span className="text-neutral-500 text-sm">/ {resenas.length} reseñas</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resenas.slice(0, 6).map((resena, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={resena._id}
                            className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden group"
                        >
                            <Quote className="absolute top-4 right-4 text-neutral-800 w-12 h-12 -z-0" />

                            <div className="relative z-10">
                                <div className="flex gap-1 mb-4 text-amber-500">
                                    {Array.from({ length: resena.calificacionGeneral }).map((_, i) => (
                                        <Star key={i} size={14} className="fill-current" />
                                    ))}
                                </div>

                                <p className="text-neutral-300 italic mb-6 leading-relaxed">
                                    "{resena.comentario || 'Excelente servicio, muy profesional.'}"
                                </p>

                                <div className="flex items-center gap-4 border-t border-neutral-800 pt-6">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-500 text-sm">
                                        {resena.nombreCliente.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm uppercase">{resena.nombreCliente}</h4>
                                        <p className="text-xs text-neutral-500">
                                            {new Date(resena.createdAt).toLocaleDateString()} • {resena.barberoId?.nombre}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
