import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Scissors, ShoppingBag, MapPin, ChevronDown, Calendar, Menu, X, Instagram, Facebook } from 'lucide-react';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import { useBarberia } from '../../context/BarberiaContext';
import { useNavigate } from 'react-router-dom';

// Estilos globales para tipografía
const GlobalFonts = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        .hero-premium {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga' 1, 'calt' 1;
        }
    `}</style>
);

export default function HeroPremium() {
    const theme = useBarberiaTheme();
    const { barberia, slug } = useBarberia();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const containerRef = useRef(null);

    const [index, setIndex] = useState(0);

    const images = theme.heroImages || [];

    useEffect(() => {
        if (images.length > 1) {
            const interval = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 6000);
            return () => clearInterval(interval);
        }
    }, [images.length]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yImage = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "20%"]), { stiffness: 100, damping: 30 });
    const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const contentScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    return (
        <>
            <GlobalFonts />
            <div ref={containerRef} className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-black hero-premium">
                {/* --- NAVBAR INTEGRADA --- */}
                <motion.nav
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`fixed top-0 left-0 right-0 z-[60] py-6 px-10 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {theme.logo ? (
                            <img src={theme.logo} alt={theme.nombre} className="h-10 w-auto object-contain" />
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white uppercase tracking-tighter leading-none">{theme.nombre}</span>
                                <span className="text-[8px] text-[var(--color-primary)] font-bold tracking-[.3em] uppercase">Premium Collective</span>
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {['Servicios', 'Nuestro Equipo', 'Ubicación', 'Galería'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                                className="text-[10px] font-black uppercase tracking-[.2em] text-neutral-400 hover:text-white transition-colors"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-white lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <button className="hidden lg:block text-white hover:text-[var(--color-primary)] transition-colors">
                            <Instagram size={20} />
                        </button>
                        <button
                            onClick={() => navigate(`/${slug}/book`)}
                            className="hidden md:flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all border border-white/10"
                        >
                            <Calendar size={18} />
                        </button>
                    </div>
                </motion.nav>

                {/* --- FONDO PARALLAX --- */}
                <motion.div style={{ y: yImage }} className="absolute inset-0 z-0">
                    {images.length > 0 ? (
                        images.map((img, i) => (
                            <motion.img
                                key={i}
                                src={img}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: i === index ? 0.4 : 0 }}
                                transition={{ duration: 1.5 }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ))
                    ) : (
                        <div className="w-full h-full bg-neutral-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                </motion.div>

                {/* --- CONTENIDO CENTRAL --- */}
                <motion.div
                    style={{ opacity: contentOpacity, scale: contentScale }}
                    className="relative z-10 text-center px-6 max-w-5xl pt-20"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <span className="text-[var(--color-primary)] font-black tracking-[.8em] uppercase text-[10px] block mb-4">
                            {theme.badge || 'REDEFINIENDO LA EXCELENCIA'}
                        </span>
                        <h1 className="text-6xl md:text-[8rem] font-black text-white uppercase leading-[0.8] tracking-tighter mb-10 italic">
                            {theme.heroTitle?.split(' ')[0]} <br />
                            <span className="text-transparent inline-block" style={{ WebkitTextStroke: '1.5px white' }}>
                                {theme.heroTitle?.split(' ').slice(1).join(' ')}
                            </span>
                        </h1>
                        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-12">
                            {theme.slogan}
                        </p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={() => navigate(`/${slug}/book`)}
                            className="w-full sm:w-auto px-10 py-5 bg-[var(--color-primary)] text-white text-[11px] font-black uppercase tracking-[.3em] hover:bg-white hover:text-black transition-all rounded-sm shadow-2xl shadow-[var(--color-primary)]/20"
                        >
                            {theme.ctaPrimary || 'Reservar Cita'}
                        </button>
                        <button
                            onClick={() => scrollToSection('servicios')}
                            className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 text-[11px] font-black uppercase tracking-[.3em] hover:bg-white hover:text-black transition-all rounded-sm"
                        >
                            {theme.ctaSecondary || 'Ver Servicios'}
                        </button>
                    </div>
                </motion.div>

                {/* --- OVERLAY DE FEATURES INFERIOR --- */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-2xl border-t border-white/5">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 py-8">
                        <div className="flex flex-col items-center justify-center p-4">
                            <Scissors className="text-[var(--color-primary)] mb-3" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Cortes Clásicos & Modernos</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                <img src="/barber-razor-icon.svg" className="w-8 h-8 mb-3 brightness-0 invert opacity-50" alt=""
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                <ShoppingBag className="text-[var(--color-primary)] mb-3 hidden" size={24} />
                            </motion.div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Afeitado Tradicional</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4">
                            <ShoppingBag className="text-[var(--color-primary)] mb-3" size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Productos Premium</span>
                        </div>
                    </div>
                </div>

                {/* --- DECORACIONES --- */}
                <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden xl:flex flex-col gap-8 opacity-20">
                    <Instagram size={18} className="text-white hover:text-[var(--color-primary)] cursor-pointer" />
                    <Facebook size={18} className="text-white hover:text-[var(--color-primary)] cursor-pointer" />
                    <div className="w-[1px] h-20 bg-white mx-auto" />
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-40 left-1/2 -translate-x-1/2 opacity-30 hidden md:block"
                >
                    <ChevronDown size={20} className="text-white" />
                </motion.div>

                {/* --- MOBILE MENU --- */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-0 z-[100] bg-black p-10 flex flex-col justify-center gap-10"
                        >
                            <button className="absolute top-10 right-10 text-white" onClick={() => setMobileMenuOpen(false)}>
                                <X size={32} />
                            </button>
                            {['Servicios', 'Equipo', 'Ubicación', 'Galería'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => scrollToSection(item.toLowerCase())}
                                    className="text-4xl font-black text-white uppercase italic text-left"
                                >
                                    {item}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
