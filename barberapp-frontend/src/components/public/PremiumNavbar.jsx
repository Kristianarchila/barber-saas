import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import { useBarberia } from '../../context/BarberiaContext';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Scissors } from 'lucide-react';

export default function PremiumNavbar() {
    const theme = useBarberiaTheme();
    const { slug } = useBarberia();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Colores dinámicos del contexto
    const primaryColor = theme.colorPrimary || '#FF3B30';
    const accentColor = theme.colorAccent || '#000000';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { id: 'servicios', label: 'Servicios' },
        { id: 'equipo', label: 'Equipo' },
        { id: 'contacto', label: 'Contacto' }
    ];

    return (
        <>
            {/* ESTILOS GLOBALES PARA TIPOGRAFÍA */}
            <style jsx={"true"} global={"true"}>{`
                /* Importar Google Fonts profesionales - Sohne alternativa */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
                
                /* Variables tipográficas con Sohne-style */
                :root {
                    --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
                }

                /* Anti-aliasing para mejor renderizado */
                .navbar-text {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                    font-feature-settings: 'liga' 1, 'calt' 1;
                }
            `}</style>

            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 navbar-text ${scrolled
                    ? 'bg-white/90 backdrop-blur-2xl py-4 border-b border-black/[0.08] shadow-[0_1px_0_0_rgba(0,0,0,0.03)]'
                    : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between">

                        {/* LOGO - Diseño moderno con mejor tipografía */}
                        <motion.div
                            className="cursor-pointer group"
                            onClick={() => navigate(`/${slug}`)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Icono decorativo */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${scrolled ? 'bg-black' : 'bg-white'
                                        }`}
                                >
                                    <Scissors
                                        size={16}
                                        className={scrolled ? 'text-white' : 'text-black'}
                                        strokeWidth={2.5}
                                    />
                                </div>

                                {/* Nombre de la barbería */}
                                <div className="flex flex-col">
                                    <span
                                        className={`text-lg font-bold tracking-tight leading-none transition-colors duration-300 ${scrolled ? 'text-black' : 'text-white'
                                            }`}
                                        style={{
                                            fontFamily: 'var(--font-display)',
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        {theme.nombre || "BARBERÍA"}
                                    </span>
                                    <span
                                        className={`text-[10px] font-medium tracking-wider uppercase transition-colors duration-300 ${scrolled ? 'text-black/40' : 'text-white/60'
                                            }`}
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            letterSpacing: '0.15em'
                                        }}
                                    >
                                        Premium Studio
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* LINKS DESKTOP - Tipografía refinada */}
                        <div className="hidden md:flex items-center gap-8 lg:gap-12">
                            {navLinks.map((link, index) => (
                                <motion.button
                                    key={link.id}
                                    onClick={() => scrollToSection(link.id)}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.1 + index * 0.05,
                                        duration: 0.4
                                    }}
                                    className={`relative text-sm font-medium tracking-wide transition-all duration-300 group ${scrolled
                                        ? 'text-black/70 hover:text-black'
                                        : 'text-white/80 hover:text-white'
                                        }`}
                                    style={{ fontFamily: 'var(--font-body)' }}
                                >
                                    {link.label}

                                    {/* Underline animado */}
                                    <span
                                        className="absolute -bottom-1 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full"
                                        style={{
                                            backgroundColor: primaryColor,
                                            boxShadow: scrolled ? 'none' : `0 0 8px ${primaryColor}40`
                                        }}
                                    />
                                </motion.button>
                            ))}

                            {/* BOTÓN CTA - Diseño premium */}
                            <motion.button
                                onClick={() => navigate(`/${slug}/book`)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={`group relative overflow-hidden px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${scrolled
                                    ? 'bg-black text-white hover:bg-neutral-800 shadow-sm hover:shadow-md'
                                    : 'bg-white text-black hover:bg-white/90 shadow-lg hover:shadow-xl'
                                    }`}
                                style={{ fontFamily: 'var(--font-body)' }}
                            >
                                {/* Efecto de brillo en hover */}
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                <span className="relative flex items-center gap-2">
                                    Reservar
                                    <ArrowUpRight
                                        size={16}
                                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        strokeWidth={2.5}
                                    />
                                </span>
                            </motion.button>
                        </div>

                        {/* MOBILE MENU BUTTON */}
                        <motion.button
                            onClick={() => setMobileMenuOpen(true)}
                            whileTap={{ scale: 0.9 }}
                            className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${scrolled
                                ? 'text-black hover:bg-black/5'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <Menu size={24} strokeWidth={2} />
                        </motion.button>
                    </div>
                </div>

                {/* Indicador de scroll sutil */}
                {scrolled && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-[1px] origin-left"
                        style={{
                            background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}00)`
                        }}
                    />
                )}
            </motion.nav>

            {/* MENÚ MÓVIL FULLSCREEN - Rediseñado */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Overlay con blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110]"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Panel del menú */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300
                            }}
                            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white z-[120] shadow-2xl overflow-y-auto"
                        >
                            {/* Header del menú */}
                            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-black/5 p-6 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                        <Scissors size={16} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <span
                                        className="text-lg font-bold text-black"
                                        style={{
                                            fontFamily: 'var(--font-display)',
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        Menú
                                    </span>
                                </div>
                                <motion.button
                                    onClick={() => setMobileMenuOpen(false)}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg hover:bg-black/5 text-black transition-colors"
                                >
                                    <X size={24} strokeWidth={2} />
                                </motion.button>
                            </div>

                            {/* Links del menú */}
                            <div className="p-6 space-y-2">
                                {navLinks.map((link, index) => (
                                    <motion.button
                                        key={link.id}
                                        onClick={() => scrollToSection(link.id)}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.1 + index * 0.05,
                                            duration: 0.3
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full group flex items-center justify-between p-4 rounded-xl hover:bg-black/5 transition-all duration-300"
                                    >
                                        <span
                                            className="text-2xl font-bold text-black tracking-tight"
                                            style={{
                                                fontFamily: 'var(--font-display)',
                                                letterSpacing: '-0.02em'
                                            }}
                                        >
                                            {link.label}
                                        </span>
                                        <ArrowUpRight
                                            size={20}
                                            className="text-black/40 group-hover:text-black transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                                            strokeWidth={2}
                                        />
                                    </motion.button>
                                ))}

                                {/* Botón de reserva en mobile */}
                                <motion.button
                                    onClick={() => {
                                        navigate(`/${slug}/book`);
                                        setMobileMenuOpen(false);
                                    }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-6 group relative overflow-hidden bg-black text-white p-5 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                                    style={{ fontFamily: 'var(--font-body)' }}
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                    <span className="relative flex items-center justify-between">
                                        <span>Reservar Turno</span>
                                        <ArrowUpRight
                                            size={20}
                                            className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                                            strokeWidth={2.5}
                                        />
                                    </span>
                                </motion.button>

                                {/* Información adicional */}
                                <div className="mt-12 pt-8 border-t border-black/5">
                                    <p
                                        className="text-xs font-medium tracking-wider uppercase text-black/40 mb-4"
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            letterSpacing: '0.15em'
                                        }}
                                    >
                                        Horarios
                                    </p>
                                    <div
                                        className="space-y-2 text-sm text-black/70"
                                        style={{ fontFamily: 'var(--font-body)' }}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium">Lun - Vie</span>
                                            <span>9:00 - 20:00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Sábados</span>
                                            <span>9:00 - 18:00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Domingos</span>
                                            <span className="text-black/40">Cerrado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}