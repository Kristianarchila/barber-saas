import React from 'react';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import { Instagram, Facebook, MapPin, Phone, Mail, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandedFooter({ barberia }) {
    const theme = useBarberiaTheme();
    const currentYear = new Date().getFullYear();

    // Helper function to safely extract string values from potential value objects
    const extractValue = (val) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && val._value !== undefined) return val._value;
        return val;
    };

    // Colores de la identidad visual que venimos trabajando
    const BARBER_RED = "#cc2b2b";
    const BARBER_BLUE = "#1e3a8a";

    return (
        <footer className="relative bg-[#0a0a0b] border-t border-white/5 pt-20 pb-10 overflow-hidden">
            {/* 💈 Barber Pole dinámico como borde superior del footer */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-barber-pole opacity-60" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                    {/* COL 1: BRANDING (4 cols) */}
                    <div className="md:col-span-5">
                        {theme.logo ? (
                            <img
                                src={theme.logo}
                                alt={theme.nombre}
                                className="h-16 mb-8 object-contain brightness-125"
                            />
                        ) : (
                            <div className="mb-8">
                                <h3 className="text-3xl font-[900] text-white uppercase tracking-tighter leading-none">
                                    {theme.nombre}
                                </h3>
                                <div className="h-1 w-12 bg-[#cc2b2b] mt-2" />
                            </div>
                        )}
                        <p className="text-neutral-500 text-sm leading-relaxed max-w-sm italic">
                            {extractValue(barberia?.configuracion?.mensajeBienvenida) ||
                                "Elevando el estándar del cuidado masculino con técnicas tradicionales y estilo moderno."}
                        </p>

                        {/* Redes Sociales con estilo de botones de lujo */}
                        <div className="flex gap-4 mt-8">
                            {[
                                { icon: Instagram, link: extractValue(barberia?.configuracion?.instagram), color: BARBER_RED },
                                { icon: Facebook, link: extractValue(barberia?.configuracion?.facebook), color: BARBER_BLUE }
                            ].map((social, idx) => social.link && (
                                <a
                                    key={idx}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white/40 transition-all group"
                                    aria-label={`Visitar nuestro ${social.icon === Instagram ? 'Instagram' : 'Facebook'}`}
                                >
                                    <social.icon size={18} className="text-white group-hover:scale-110 transition-transform" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* COL 2: LINKS RÁPIDOS (3 cols) */}
                    <div className="md:col-span-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#cc2b2b] mb-8">Navegación</h4>
                        <ul className="space-y-4">
                            {['Servicios', 'Equipo', 'Contacto'].map((item) => (
                                <li key={item}>
                                    <button
                                        onClick={() => document.getElementById(item.toLowerCase()).scrollIntoView({ behavior: 'smooth' })}
                                        className="text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group"
                                        aria-label={`Ir a la sección de ${item}`}
                                    >
                                        <span className="w-0 h-px bg-white transition-all group-hover:w-4" aria-hidden="true" />
                                        {item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COL 3: INFO DIRECTA (4 cols) */}
                    <div className="md:col-span-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1e3a8a] mb-8">Información</h4>
                        <div className="space-y-6">
                            {barberia?.direccion && (
                                <div className="flex items-start gap-4 group">
                                    <MapPin size={18} className="text-[#1e3a8a] shrink-0" />
                                    <span className="text-neutral-400 text-xs leading-relaxed group-hover:text-neutral-200 transition-colors">
                                        {extractValue(barberia.direccion)}
                                    </span>
                                </div>
                            )}
                            {barberia?.telefono && (
                                <div className="flex items-center gap-4 group">
                                    <Phone size={18} className="text-[#1e3a8a] shrink-0" />
                                    <span className="text-neutral-400 text-xs font-bold group-hover:text-neutral-200 transition-colors">
                                        {extractValue(barberia.telefono)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-4 group">
                                <Mail size={18} className="text-[#1e3a8a] shrink-0" />
                                <span className="text-neutral-400 text-xs group-hover:text-neutral-200 transition-colors">
                                    {extractValue(barberia?.email) || 'contacto@' + (extractValue(theme.nombre)?.toLowerCase().replace(/\s/g, '') || 'barberia') + '.com'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COPYRIGHT & LEGAL */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.5em]">
                        © {currentYear} {theme.nombre} • Crafted for Gentlemen
                    </p>

                    <div className="flex items-center gap-8">
                        <span className="text-[9px] text-neutral-700 uppercase tracking-widest hover:text-neutral-400 cursor-pointer transition-colors">Privacidad</span>
                        <span className="text-[9px] text-neutral-700 uppercase tracking-widest hover:text-neutral-400 cursor-pointer transition-colors">Términos</span>
                        <div className="flex items-center opacity-20">
                            <Scissors size={12} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Elemento decorativo final: Sombra de fondo azul/roja */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#cc2b2b]/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#1e3a8a]/10 blur-[100px] pointer-events-none" />
        </footer>
    );
}