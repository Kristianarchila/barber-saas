import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, ArrowRight, Globe } from 'lucide-react';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';

export default function SucursalesSection({ sucursales = [] }) {
    const theme = useBarberiaTheme();

    // Colores dinámicos del tema o fallback vibrante
    const primaryColor = theme.colorPrimary || '#000000';
    const accentColor = theme.colorAccent || '#FF3B30';

    // Only show real branches created by the barberia owner
    // No default/example branches should be displayed
    if (!sucursales || sucursales.length === 0) {
        return null; // Don't show the section if there are no branches
    }

    return (
        <section className="py-32 bg-white relative overflow-hidden">
            {/* Decoración de fondo sutil pero colorida */}
            <div
                className="absolute top-0 right-0 w-96 h-96 blur-[120px] opacity-10 rounded-full"
                style={{ backgroundColor: accentColor }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header Editorial con Color */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <span className="w-12 h-[2px]" style={{ backgroundColor: primaryColor }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: primaryColor }}>
                                Locations
                            </span>
                        </motion.div>
                        <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase leading-[0.8]">
                            Nuestras <br />
                            <span className="italic text-transparent" style={{ WebkitTextStroke: `1.5px ${primaryColor}` }}>
                                Sedes
                            </span>
                        </h2>
                    </div>
                    <div className="md:text-right">
                        <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mb-2">Presencia Regional</p>
                        <div className="flex items-center gap-2 justify-end text-2xl font-black italic">
                            <Globe size={20} style={{ color: accentColor }} />
                            <span>CHILE</span>
                        </div>
                    </div>
                </div>

                {/* Grid de Sucursales Estilo Galería */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sucursales.map((sucursal, idx) => (
                        <motion.div
                            key={sucursal.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative flex flex-col"
                        >
                            {/* Imagen con Hover de Color */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-2xl mb-6">
                                <img
                                    src={sucursal.imagen}
                                    alt={sucursal.nombre}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out"
                                />
                                {/* Overlay de color al hover */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                                    style={{ backgroundColor: primaryColor }}
                                />

                                {/* Badge de Ciudad */}
                                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-xl">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-black">
                                        {sucursal.ciudad || 'Sede'}
                                    </span>
                                </div>
                            </div>

                            {/* Info de la sede */}
                            <div className="space-y-3 px-2">
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none group-hover:translate-x-2 transition-transform duration-300">
                                    {sucursal.nombre}
                                </h3>
                                <div className="flex items-start gap-2 text-neutral-400">
                                    <MapPin size={14} style={{ color: accentColor }} className="mt-0.5" />
                                    <p className="text-[11px] font-bold uppercase tracking-wider">{sucursal.direccion}</p>
                                </div>

                                {/* Botón de Acción Minimalista pero con Color */}
                                <button
                                    className="mt-4 w-full py-4 border border-black/5 rounded-xl flex items-center justify-between px-6 group-hover:bg-black transition-all duration-300"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                                        Reservar Aquí
                                    </span>
                                    <ArrowRight
                                        size={16}
                                        className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300"
                                        style={{ color: accentColor }}
                                    />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer de sección: Línea de tiempo o estadística */}
                <div className="mt-24 pt-12 border-t border-black/5 flex flex-wrap gap-12 justify-center">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black" style={{ color: primaryColor }}>04</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Centros de <br /> Excelencia</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black" style={{ color: accentColor }}>15+</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Master <br /> Barbers</span>
                    </div>
                </div>
            </div>
        </section>
    );
}