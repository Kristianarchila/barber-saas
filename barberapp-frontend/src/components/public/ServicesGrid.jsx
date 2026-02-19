import React, { useState } from 'react';
import { Scissors, Droplet, Star, Sparkles, Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Estilos globales para tipografía
const GlobalFonts = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        .services-grid {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga' 1, 'calt' 1;
        }
    `}</style>
);

export default function ServicesGrid() {
    const theme = useBarberiaTheme();
    const [verTodos, setVerTodos] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    const servicios = theme?.servicios || [];

    const iconMap = {
        scissors: Scissors,
        droplet: Droplet,
        star: Star,
        sparkles: Sparkles,
    };

    const getIcon = (iconName) => iconMap[iconName?.toLowerCase()] || Scissors;

    if (!servicios || servicios.length === 0) {
        return (
            <section className="py-24 bg-[#0B0B0B]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-40 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 animate-pulse rounded-xl" />
                    ))}
                </div>
            </section>
        );
    }

    // Si hay muchos servicios, limitamos la vista inicial
    const serviciosVisibles = verTodos ? servicios : servicios.slice(0, 8);

    return (
        <>
            <GlobalFonts />
            <section id="servicios" className="relative z-20 py-24 bg-[#080808] services-grid">
                {/* Fondo con textura sutil */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                <div className="max-w-7xl mx-auto px-6 relative z-10">



                    {/* Grid optimizado para muchos servicios (Horizontal Cards) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                        <AnimatePresence mode="popLayout">
                            {serviciosVisibles.map((servicio, idx) => {
                                const Icon = getIcon(servicio.icon);
                                const isHovered = hoveredCard === idx;

                                return (
                                    <motion.div
                                        key={servicio._id || idx}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        onMouseEnter={() => setHoveredCard(idx)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        className="group relative flex flex-col sm:flex-row items-stretch bg-[#111] border border-neutral-800/50 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all duration-300"
                                    >
                                        {/* Imagen o Ícono a la izquierda */}
                                        <div className="relative w-full sm:w-40 lg:w-48 bg-neutral-900 flex-shrink-0 overflow-hidden">
                                            {servicio.imagen ? (
                                                <img
                                                    src={servicio.imagen}
                                                    alt={servicio.nombre}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-neutral-900 to-black">
                                                    <Icon
                                                        size={40}
                                                        strokeWidth={1}
                                                        className="opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-12"
                                                        style={{ color: 'var(--color-primary)' }}
                                                    />
                                                </div>
                                            )}
                                            {/* Overlay de gradiente */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111] opacity-0 sm:opacity-100" />
                                        </div>

                                        {/* Contenido a la derecha */}
                                        <div className="flex-grow p-6 lg:p-8 flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl lg:text-2xl font-bold text-white uppercase tracking-tight group-hover:text-gold transition-colors">
                                                    {servicio.nombre}
                                                </h3>
                                                <div className="text-2xl font-black text-white" style={{ color: isHovered ? 'var(--color-primary)' : 'white' }}>
                                                    ${servicio.precio.toLocaleString()}
                                                </div>
                                            </div>

                                            <p className="text-neutral-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                {servicio.descripcion || "Personaliza tu estilo con nuestros expertos. Incluye lavado y asesoría técnica."}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                                        <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                                                        {servicio.duracion || "45"} MIN
                                                    </div>
                                                    {servicio.categoria && (
                                                        <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-1 rounded-md uppercase tracking-wider">
                                                            {servicio.categoria}
                                                        </span>
                                                    )}
                                                </div>

                                                <motion.div
                                                    animate={{ x: isHovered ? 5 : 0 }}
                                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                                                    style={{ color: 'var(--color-primary)' }}
                                                >
                                                    <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Reservar</span>
                                                    <ArrowRight size={18} />
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Hover Indicator Line */}
                                        <div
                                            className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                                            style={{ backgroundColor: 'var(--color-primary)' }}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Acción para muchos servicios */}
                    {servicios.length > 8 && (
                        <div className="mt-16 flex justify-center">
                            <button
                                onClick={() => setVerTodos(!verTodos)}
                                className="flex items-center gap-3 px-12 py-5 bg-neutral-900 border border-neutral-800 text-white font-black text-xs uppercase tracking-[0.4em] rounded-full hover:bg-neutral-800 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl"
                            >
                                {verTodos ? (
                                    <>Ver Menos <ChevronUp size={20} /></>
                                ) : (
                                    <>Explorar Todo el Menú ({servicios.length}) <ChevronDown size={20} /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}