/**
 * PremiumTemplate — Liquid Glass + Dark Coal + Gold
 * Design System: UI UX Pro Max
 * Style: Liquid Glass | Fonts: Bodoni Moda + Jost | Colors: #1C1917 + #CA8A04
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
    Scissors, MapPin, Phone, Clock, Star, ChevronDown,
    Calendar, Menu, X, Instagram, Facebook, ArrowRight,
    Award, Shield, Sparkles, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBarberia } from '../../../context/BarberiaContext';
import WhatsAppButton from '../../../components/public/WhatsAppButton';
import MobileBottomNav from '../../../components/public/MobileBottomNav';
import BrandedFooter from '../../../components/public/BrandedFooter';
import ServicesCatalog from '../../../components/public/ServicesCatalog';
import MarketplaceSection from '../../../components/public/MarketplaceSection';

/* ─────────────── GOOGLE FONTS ─────────────── */
const Fonts = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
        .pt-font-heading { font-family: 'Bodoni Moda', Georgia, serif; }
        .pt-font-body    { font-family: 'Jost', system-ui, sans-serif; }
    `}</style>
);

/* ─────────────── NAVBAR ─────────────── */
function PremiumNav({ barberia, slug, scrolled, onBook }) {
    const [open, setOpen] = useState(false);
    const navItems = ['servicios', 'equipo', 'resenas', 'ubicacion'];
    const labels = { servicios: 'Servicios', equipo: 'Equipo', resenas: 'Reseñas', ubicacion: 'Ubicación' };

    const scroll = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 pt-font-body ${scrolled
                    ? 'bg-[#1C1917]/90 backdrop-blur-xl border-b border-[#CA8A04]/20 py-3'
                    : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex flex-col">
                        {barberia?.configuracion?.logoUrl ? (
                            <img src={barberia.configuracion.logoUrl} alt={barberia.nombre} className="h-8 w-auto object-contain" />
                        ) : (
                            <>
                                <span className="pt-font-heading text-lg font-bold text-white tracking-wide leading-none">
                                    {barberia?.nombre}
                                </span>
                                <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-[#CA8A04]">
                                    Premium Studio
                                </span>
                            </>
                        )}
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map(id => (
                            <button
                                key={id}
                                onClick={() => scroll(id)}
                                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 hover:text-[#CA8A04] transition-colors duration-200 cursor-pointer"
                            >
                                {labels[id]}
                            </button>
                        ))}
                    </div>

                    {/* CTA + Mobile menu */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBook}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#CA8A04] text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-[#b87c03] transition-all duration-200 cursor-pointer"
                        >
                            <Calendar size={14} /> Reservar
                        </button>
                        <button
                            onClick={() => setOpen(true)}
                            className="md:hidden text-white cursor-pointer"
                            aria-label="Menú"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed inset-0 z-[100] bg-[#0C0A09] flex flex-col px-8 py-10"
                    >
                        <button onClick={() => setOpen(false)} className="self-end text-white cursor-pointer mb-10">
                            <X size={28} />
                        </button>
                        <nav className="flex flex-col gap-6">
                            {navItems.map(id => (
                                <button
                                    key={id}
                                    onClick={() => scroll(id)}
                                    className="pt-font-heading text-4xl font-bold italic text-white text-left hover:text-[#CA8A04] transition-colors duration-200 cursor-pointer"
                                >
                                    {labels[id]}
                                </button>
                            ))}
                        </nav>
                        <button
                            onClick={() => { onBook(); setOpen(false); }}
                            className="mt-auto w-full py-4 bg-[#CA8A04] text-white text-sm font-bold uppercase tracking-widest rounded-sm cursor-pointer"
                        >
                            Reservar Cita
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ─────────────── HERO ─────────────── */
function Hero({ barberia, onBook, onExplore }) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
    const yBg = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '25%']), { stiffness: 80, damping: 20 });
    const opText = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
    const scText = useTransform(scrollYProgress, [0, 0.45], [1, 0.92]);

    const images = barberia?.configuracion?.galeriaHero || barberia?.configuracion?.galeria || [];
    const bgImage = images[0] || null;

    const heroTitle = barberia?.configuracion?.heroTitle || barberia?.nombre || 'Premium Studio';
    const slogan = barberia?.configuracion?.slogan || 'Donde cada corte es una obra de arte';
    const badge = barberia?.configuracion?.badge || 'EST. 2020';

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0C0A09]">
            {/* Background parallax */}
            <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
                {bgImage ? (
                    <img src={bgImage} alt="" className="w-full h-full object-cover opacity-30" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1C1917] via-[#0C0A09] to-[#292524]" />
                )}
                {/* Liquid glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0C0A09]/80 via-transparent to-[#0C0A09]/40" />
            </motion.div>

            {/* Gold accent line */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-10">
                <div className="w-px h-24 bg-gradient-to-b from-transparent to-[#CA8A04]" />
                <Instagram size={16} className="text-[#CA8A04] cursor-pointer hover:text-white transition-colors" />
                <Facebook size={16} className="text-[#CA8A04] cursor-pointer hover:text-white transition-colors" />
                <div className="w-px h-24 bg-gradient-to-t from-transparent to-[#CA8A04]" />
            </div>

            {/* Content */}
            <motion.div
                style={{ opacity: opText, scale: scText }}
                className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <span className="inline-block text-[10px] font-semibold tracking-[0.6em] uppercase text-[#CA8A04] mb-6 pt-font-body">
                        {badge}
                    </span>

                    <h1 className="pt-font-heading text-6xl md:text-[7rem] lg:text-[9rem] font-bold italic text-white leading-[0.85] tracking-tight mb-8">
                        {heroTitle.split(' ').map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                                className={`block ${i % 2 !== 0 ? 'text-transparent' : ''}`}
                                style={i % 2 !== 0 ? { WebkitTextStroke: '1px #CA8A04' } : {}}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="pt-font-body text-stone-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-12"
                    >
                        {slogan}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button
                            onClick={onBook}
                            className="pt-font-body flex items-center justify-center gap-2 px-10 py-4 bg-[#CA8A04] text-white text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-[#b87c03] transition-all duration-300 rounded-sm shadow-xl shadow-[#CA8A04]/20 cursor-pointer"
                        >
                            <Calendar size={16} /> Reservar Cita
                        </button>
                        <button
                            onClick={onExplore}
                            className="pt-font-body flex items-center justify-center gap-2 px-10 py-4 bg-white/5 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-white/10 transition-all duration-300 rounded-sm cursor-pointer"
                        >
                            Ver Servicios <ArrowRight size={16} />
                        </button>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:block"
            >
                <ChevronDown size={24} className="text-[#CA8A04]/60" />
            </motion.div>

            {/* Liquid glass bottom fade */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0C0A09] to-transparent z-10" />
        </section>
    );
}

/* ─────────────── SERVICES ─────────────── */
function ServicesSection({ servicios, onBook, categorias }) {
    return (
        <section id="servicios" className="py-20 px-6 bg-[#0C0A09]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="pt-font-body text-[10px] font-semibold tracking-[0.5em] uppercase text-[#CA8A04] block mb-4">Nuestros Servicios</span>
                    <h2 className="pt-font-heading text-5xl md:text-6xl font-bold italic text-white">El Arte del Corte</h2>
                </motion.div>
                <ServicesCatalog
                    servicios={servicios}
                    onBook={onBook}
                    categorias={categorias}
                    title=""
                    theme={{
                        accent: '#CA8A04',
                        bg: '#0C0A09',
                        card: 'rgba(255,255,255,0.04)',
                        text: '#F5F5F0',
                        muted: '#78716C',
                        border: 'rgba(255,255,255,0.08)',
                        inputBg: 'rgba(255,255,255,0.05)',
                        pillActive: '#CA8A04',
                        pillActiveTxt: '#0C0A09',
                    }}
                />
            </div>
        </section>
    );
}

/* ─────────────── TEAM ─────────────── */
function TeamSection({ barberos }) {
    if (!barberos?.length) return null;
    return (
        <section id="equipo" className="py-28 px-6 bg-gradient-to-b from-[#0C0A09] to-[#1C1917]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="pt-font-body text-[10px] font-semibold tracking-[0.5em] uppercase text-[#CA8A04] block mb-4">Nuestro Equipo</span>
                    <h2 className="pt-font-heading text-5xl md:text-6xl font-bold italic text-white">Los Maestros</h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {barberos.map((b, i) => (
                        <motion.div
                            key={b._id || i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            className="group relative overflow-hidden rounded-sm bg-[#1C1917]"
                        >
                            {/* Photo */}
                            <div className="relative h-72 overflow-hidden">
                                {b.foto ? (
                                    <img
                                        src={b.foto}
                                        alt={b.nombre}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#292524] to-[#1C1917] flex items-center justify-center">
                                        <Users size={40} className="text-[#CA8A04]/40" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-transparent to-transparent" />
                            </div>

                            {/* Info */}
                            <div className="p-5 relative">
                                <div className="w-8 h-px bg-[#CA8A04] mb-3" />
                                <h3 className="pt-font-heading text-lg font-bold italic text-white">{b.nombre}</h3>
                                {b.especialidad && (
                                    <p className="pt-font-body text-xs text-[#CA8A04] font-semibold tracking-widest uppercase mt-1">{b.especialidad}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────── REVIEWS ─────────────── */
function ReviewsSection({ resenas }) {
    if (!resenas?.length) return null;
    const approved = resenas.filter(r => r.aprobada !== false);
    if (!approved.length) return null;

    return (
        <section id="resenas" className="py-28 px-6 bg-[#1C1917]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="pt-font-body text-[10px] font-semibold tracking-[0.5em] uppercase text-[#CA8A04] block mb-4">Testimonios</span>
                    <h2 className="pt-font-heading text-5xl md:text-6xl font-bold italic text-white">Lo que dicen</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approved.slice(0, 6).map((r, i) => (
                        <motion.div
                            key={r._id || i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="bg-white/4 backdrop-blur-sm border border-white/8 rounded-sm p-7"
                        >
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: r.calificacion || 5 }).map((_, j) => (
                                    <Star key={j} size={14} className="text-[#CA8A04] fill-[#CA8A04]" />
                                ))}
                            </div>
                            <p className="pt-font-body text-stone-300 text-sm leading-relaxed mb-5 italic">"{r.comentario}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#CA8A04]/20 flex items-center justify-center">
                                    <span className="pt-font-heading text-xs font-bold text-[#CA8A04]">
                                        {r.nombre?.charAt(0)?.toUpperCase() || 'C'}
                                    </span>
                                </div>
                                <span className="pt-font-body text-xs font-semibold text-stone-400">{r.nombre || 'Cliente'}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────── LOCATION ─────────────── */
function LocationSection({ barberia }) {
    return (
        <section id="ubicacion" className="py-28 px-6 bg-gradient-to-b from-[#1C1917] to-[#0C0A09]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                >
                    <div>
                        <span className="pt-font-body text-[10px] font-semibold tracking-[0.5em] uppercase text-[#CA8A04] block mb-4">Encuéntranos</span>
                        <h2 className="pt-font-heading text-5xl font-bold italic text-white mb-10">Visítanos</h2>

                        <div className="space-y-6">
                            {barberia?.direccion && (
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-sm bg-[#CA8A04]/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin size={18} className="text-[#CA8A04]" />
                                    </div>
                                    <div>
                                        <p className="pt-font-body text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Dirección</p>
                                        <p className="pt-font-body text-white text-sm leading-relaxed">{barberia.direccion}</p>
                                    </div>
                                </div>
                            )}
                            {barberia?.telefono && (
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-sm bg-[#CA8A04]/10 flex items-center justify-center flex-shrink-0">
                                        <Phone size={18} className="text-[#CA8A04]" />
                                    </div>
                                    <div>
                                        <p className="pt-font-body text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Teléfono</p>
                                        <p className="pt-font-body text-white text-sm">{barberia.telefono}</p>
                                    </div>
                                </div>
                            )}
                            {barberia?.configuracion?.horario && (
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-sm bg-[#CA8A04]/10 flex items-center justify-center flex-shrink-0">
                                        <Clock size={18} className="text-[#CA8A04]" />
                                    </div>
                                    <div>
                                        <p className="pt-font-body text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Horario</p>
                                        <p className="pt-font-body text-white text-sm">{barberia.configuracion.horario}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Award, label: 'Calidad Premium', sub: 'Productos de primera' },
                            { icon: Shield, label: '100% Garantizado', sub: 'Tu satisfacción primero' },
                            { icon: Sparkles, label: 'Arte & Precisión', sub: 'Cada corte, perfecto' },
                            { icon: Users, label: 'Equipo Experto', sub: 'Barberos certificados' },
                        ].map(({ icon: Icon, label, sub }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/4 border border-white/8 rounded-sm p-6 flex flex-col items-center text-center"
                            >
                                <div className="w-12 h-12 rounded-sm bg-[#CA8A04]/10 flex items-center justify-center mb-3">
                                    <Icon size={22} className="text-[#CA8A04]" />
                                </div>
                                <p className="pt-font-heading text-sm font-bold italic text-white mb-1">{label}</p>
                                <p className="pt-font-body text-xs text-stone-500">{sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ─────────────── STICKY CTA BAND ─────────────── */
function StickyBookingBand({ onBook, scrolled }) {
    return (
        <AnimatePresence>
            {scrolled && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#1C1917]/95 backdrop-blur-xl border-t border-[#CA8A04]/20 px-6 py-4"
                >
                    <button
                        onClick={onBook}
                        className="w-full py-3.5 bg-[#CA8A04] text-white pt-font-body text-[11px] font-bold uppercase tracking-[0.25em] rounded-sm cursor-pointer"
                    >
                        Reservar Ahora
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ─────────────── ROOT ─────────────── */
export default function PremiumTemplate({ barberia, servicios, barberos, resenas, categorias }) {
    const { slug } = useBarberia();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleBook = () => navigate(`/${slug}/book`);
    const handleExplore = () => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className="bg-[#0C0A09] text-white min-h-screen pt-font-body selection:bg-[#CA8A04] selection:text-white">
            <Fonts />
            <PremiumNav barberia={barberia} slug={slug} scrolled={scrolled} onBook={handleBook} />
            <Hero barberia={barberia} onBook={handleBook} onExplore={handleExplore} />
            <ServicesSection servicios={servicios} onBook={handleBook} categorias={categorias} />
            <TeamSection barberos={barberos} />
            {/* MARKETPLACE: productos destacados, solo si tienda activa */}
            <MarketplaceSection colorPrimary="#CA8A04" />
            <ReviewsSection resenas={resenas} />
            <LocationSection barberia={barberia} />
            <BrandedFooter barberia={barberia} />
            <StickyBookingBand onBook={handleBook} scrolled={scrolled} />
            <WhatsAppButton phoneNumber={barberia?.telefono} />
        </div>
    );
}
