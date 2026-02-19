import React from 'react';
import { MapPin, Phone, Clock, Scissors, Navigation, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LocationSection({ barberia }) {
    // Helper function to safely extract string values from potential value objects
    const extractValue = (val) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && val._value !== undefined) return val._value;
        return val;
    };

    // Usamos el color del tema si existe, si no, un rojo vibrante de acento
    const BARBER_RED = "#FF3B30";

    const getMapUrl = () => {
        const configuredUrl = extractValue(barberia.configuracion?.googleMapsUrl);
        if (!configuredUrl) return null;
        if (configuredUrl.includes('<iframe')) {
            const match = configuredUrl.match(/src="([^"]+)"/);
            return match ? match[1] : configuredUrl;
        }
        return configuredUrl;
    };

    const mapUrl = getMapUrl();
    const isCustomMap = !!mapUrl;

    return (
        <section id="contacto" className="relative py-40 bg-white overflow-hidden">

            {/* Texto de fondo estilo editorial */}
            <div className="absolute right-0 top-1/4 hidden xl:block pointer-events-none">
                <p className="text-[180px] font-black text-black/[0.02] uppercase tracking-tighter leading-none">
                    Contact
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* INFO COL */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-black/40">
                                Global Headquarters
                            </span>
                        </div>

                        <h2 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.8] mb-16">
                            Visit <br />
                            <span className="italic text-transparent" style={{ WebkitTextStroke: '1.5px black' }}>The Shop</span>
                        </h2>

                        <div className="space-y-0 border-t border-black/5">
                            {/* Dirección */}
                            <div className="group py-10 border-b border-black/5 flex justify-between items-center hover:px-4 transition-all duration-500">
                                <div>
                                    <h4 className="font-black text-black uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BARBER_RED }} />
                                        Ubicación
                                    </h4>
                                    <p className="text-neutral-500 font-bold text-lg uppercase max-w-xs leading-tight">
                                        {extractValue(barberia.direccion) || 'Av. Principal 123, Ciudad'}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-black">
                                    <Navigation size={20} />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="group py-10 border-b border-black/5 flex justify-between items-center hover:px-4 transition-all duration-500">
                                <div>
                                    <h4 className="font-black text-black uppercase text-[10px] tracking-widest mb-3">Contacto Directo</h4>
                                    <p className="text-neutral-500 font-bold text-lg">{extractValue(barberia.telefono) || '+56 9 1234 5678'}</p>
                                </div>
                                <a href={`tel:${extractValue(barberia.telefono)}`} className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                                    <Phone size={18} />
                                </a>
                            </div>

                            {/* Horario */}
                            <div className="group py-10 border-b border-black/5 flex justify-between items-end hover:px-4 transition-all duration-500">
                                <div className="flex-1">
                                    <h4 className="font-black text-black uppercase text-[10px] tracking-widest mb-3">Horario de Corte</h4>
                                    <div className="flex justify-between items-center max-w-xs">
                                        <p className="font-bold text-lg uppercase tracking-tight">Lunes — Sábado</p>
                                        <p className="font-black text-sm" style={{ color: BARBER_RED }}>10:00 — 20:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* MAP COL */}
                    <div className="lg:col-span-7 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-video lg:aspect-square overflow-hidden rounded-3xl bg-neutral-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] group"
                        >
                            {isCustomMap ? (
                                <div className="w-full h-full grayscale-[0.5] contrast-[1.1] group-hover:grayscale-0 transition-all duration-1000">
                                    <iframe
                                        title="Ubicación"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        src={mapUrl}
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50">
                                    <Navigation size={40} className="text-black/10 mb-6" />
                                    <button className="bg-black text-white px-10 py-4 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all">
                                        Abrir Google Maps
                                    </button>
                                </div>
                            )}

                            {/* Badge flotante de estado */}
                            <div className="absolute bottom-8 left-8 bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-black/5">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black">Abierto Ahora</p>
                                    <p className="text-[9px] text-neutral-400 font-bold uppercase">Visítanos sin cita previa</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Detalle decorativo inferior */}
                        <div className="mt-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-[1px] bg-black/10" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20">Precision & Style</span>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group">
                                Ver indicaciones <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" style={{ color: BARBER_RED }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}