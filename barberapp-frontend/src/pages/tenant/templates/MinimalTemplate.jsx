/**
 * MinimalTemplate — Swiss Modernism 2.0
 * UI UX Pro Max Style: Strict 12-column grid, Inter/Helvetica, mathematical spacing, single accent color
 * Fonts: Inter (body) + DM Serif Display (headings accent)
 * Colors: White #FFFFFF, Near-Black #0F0F0F, Accent #1A1A1A (with red accent #CC2B2B or brand primary)
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, MapPin, Phone, Clock, Calendar, Menu, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBarberia } from '../../../context/BarberiaContext';
import WhatsAppButton from '../../../components/public/WhatsAppButton';
import ServicesCatalog from '../../../components/public/ServicesCatalog';
import MarketplaceSection from '../../../components/public/MarketplaceSection';

/* ─── TOKENS — Swiss Modernism 2.0 from UI UX Pro Max ─────────── */
// "display: grid, grid-template-columns: repeat(12, 1fr), gap: 1rem (8px base unit)"
// "font-family: Inter/Helvetica, font-weight: 400-700, color: #000/#FFF, single accent"
const T = {
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    gray50: '#F5F5F5',
    gray200: '#E5E5E5',
    gray400: '#A0A0A0',
    gray600: '#525252',
    black: '#0F0F0F',
};

/* Gets the accent color (barbería's primary color or default black) */
const getAccent = (barberia) => barberia?.configuracion?.colorPrincipal || '#0F0F0F';

/* ─── FONTS ─────────────────────────────────────────────────────── */
const Fonts = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        .mn-body    { font-family: 'Inter', 'Helvetica Neue', Helvetica, sans-serif; }
        .mn-heading { font-family: 'DM Serif Display', Georgia, serif; }
        /* Swiss Modernism: strict 8px base unit spacing */
        :root {
            --mn-unit: 8px;
            --mn-xs:   8px;
            --mn-sm:   16px;
            --mn-md:   24px;
            --mn-lg:   40px;
            --mn-xl:   64px;
            --mn-2xl:  96px;
            --mn-col:  calc(100% / 12);
        }
        /* Swiss border utility */
        .mn-rule { border-top: 1px solid #E5E5E5; }
        /* Typography scale: clamp(min, vw, max) — Swiss principle */
        .mn-display { font-size: clamp(3rem, 8vw, 8rem); line-height: 0.95; font-weight: 700; letter-spacing: -0.04em; }
        .mn-title   { font-size: clamp(1.5rem, 3vw, 3rem); line-height: 1.1; font-weight: 600; letter-spacing: -0.02em; }
        /* Hover underline animation */
        .mn-link { position: relative; }
        .mn-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:currentColor; transition: width 0.25s ease; }
        .mn-link:hover::after { width: 100%; }
    `}</style>
);

/* ─── NAV ─────────────────────────────────────────────────────── */
function MinNav({ barberia, accent, onBook }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); };

    return (
        <>
            <nav className={`fixed top-0 inset-x-0 z-50 mn-body transition-all duration-200 ${scrolled ? 'bg-white border-b border-[#E5E5E5] shadow-[0_1px_0_#E5E5E5]' : 'bg-white border-b border-[#E5E5E5]'}`}
                style={{ paddingTop: 'var(--mn-sm)', paddingBottom: 'var(--mn-sm)' }}>
                <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
                    {/* Logo — Swiss: black, no decoration */}
                    <div>
                        {barberia?.configuracion?.logoUrl
                            ? <img src={barberia.configuracion.logoUrl} alt={barberia?.nombre} className="h-8 object-contain" />
                            : <span className="mn-body text-sm font-700 tracking-[-0.02em] text-[#0F0F0F] font-semibold uppercase">{barberia?.nombre}</span>
                        }
                    </div>

                    {/* Desktop nav — Swiss: small, systematic */}
                    <div className="hidden md:flex items-center gap-8">
                        {['servicios', 'equipo', 'ubicacion'].map(id => (
                            <button key={id} onClick={() => go(id)}
                                className="mn-link text-[11px] font-medium uppercase tracking-[0.15em] text-[#525252] hover:text-[#0F0F0F] transition-colors duration-150 cursor-pointer">
                                {id[0].toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={onBook}
                            className="hidden md:flex items-center gap-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] cursor-pointer transition-all duration-200"
                            style={{ background: accent, color: '#fff' }}>
                            <Calendar size={13} /> Reservar
                        </button>
                        <button onClick={() => setOpen(true)} className="md:hidden text-[#0F0F0F] cursor-pointer">
                            <Menu size={22} />
                        </button>
                    </div>
                </div>
            </nav>

            {open && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-white flex flex-col px-8 py-8"
                    style={{ paddingTop: '80px' }}>
                    <button onClick={() => setOpen(false)} className="absolute top-6 right-6 text-[#0F0F0F] cursor-pointer"><X size={24} /></button>
                    <div className="mn-rule mt-4 mb-8" />
                    {['servicios', 'equipo', 'ubicacion'].map(id => (
                        <div key={id} className="mn-rule">
                            <button onClick={() => go(id)}
                                className="mn-heading text-4xl italic text-[#0F0F0F] py-5 w-full text-left flex items-center justify-between cursor-pointer">
                                {id[0].toUpperCase() + id.slice(1)}
                                <ArrowRight size={20} style={{ color: accent }} />
                            </button>
                        </div>
                    ))}
                    <button onClick={() => { onBook(); setOpen(false); }}
                        className="mt-8 py-4 text-[11px] font-bold uppercase tracking-widest cursor-pointer text-white"
                        style={{ background: accent }}>
                        Reservar Cita
                    </button>
                </motion.div>
            )}
        </>
    );
}

/* ─── HERO — Swiss: asymmetric, mathematical ─────────────────────── */
function MinHero({ barberia, accent, onBook }) {
    const title = barberia?.configuracion?.heroTitle || barberia?.nombre || 'Studio';
    const slogan = barberia?.configuracion?.slogan || 'Precisión. Desde el primer corte.';
    const year = barberia?.configuracion?.estYear || '2020';
    const images = barberia?.configuracion?.galeriaHero || barberia?.configuracion?.galeria || [];
    const img = images[0];

    return (
        <section className="bg-white" style={{ paddingTop: '80px' }}>
            {/* Swiss top rule */}
            <div style={{ height: '3px', background: T.black }} />

            <div className="max-w-[1200px] mx-auto px-6">
                {/* Swiss 12-col asymmetric layout */}
                <div className="grid grid-cols-12 gap-4 items-start" style={{ paddingTop: 'var(--mn-xl)', paddingBottom: 'var(--mn-xl)' }}>
                    {/* 8 cols — main heading */}
                    <div className="col-span-12 md:col-span-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <h1 className="mn-body mn-display text-[#0F0F0F]">{title}</h1>
                        </motion.div>
                    </div>

                    {/* 4 cols — side info */}
                    <div className="col-span-12 md:col-span-4 md:pt-12">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                            <div className="mn-rule pb-4 mb-4">
                                <span className="mn-body text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.gray400 }}>Est. {year}</span>
                            </div>
                            <p className="mn-body text-sm leading-relaxed mb-8" style={{ color: T.gray600 }}>{slogan}</p>
                            <button onClick={onBook}
                                className="mn-body flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] cursor-pointer group"
                                style={{ color: accent }}>
                                <span className="inline-block w-8 h-px transition-all group-hover:w-14" style={{ background: accent }} />
                                Reservar Cita
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Full-width image strip */}
            {img && (
                <motion.div initial={{ opacity: 0, scaleX: 0.98 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full overflow-hidden" style={{ height: 'clamp(200px, 40vw, 520px)', originX: 0 }}>
                    <img src={img} alt={title} className="w-full h-full object-cover" style={{ filter: 'grayscale(0.2) contrast(1.05)' }} />
                </motion.div>
            )}

            {/* Services CTA row */}
            <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between mn-rule">
                <span className="mn-body text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: T.gray400 }}>Barbershop · {barberia?.direccion || ''}</span>
                <button onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mn-body flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] cursor-pointer"
                    style={{ color: T.black }}>
                    Ver Servicios <ArrowRight size={14} />
                </button>
            </div>
        </section>
    );
}

/* ─── SERVICES — Swiss catalog ─────────────────────────────────── */
function MinServices({ servicios, accent, onBook, categorias }) {
    return (
        <section id="servicios" className="bg-white" style={{ paddingTop: 'var(--mn-2xl)', paddingBottom: 'var(--mn-2xl)' }}>
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-12 gap-4 mb-12">
                    <div className="col-span-12 md:col-span-3">
                        <span className="mn-body text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: T.gray400 }}>01 — Servicios</span>
                    </div>
                </div>
                <ServicesCatalog
                    servicios={servicios}
                    onBook={onBook}
                    categorias={categorias}
                    title="Servicios del Estudio"
                    theme={{
                        accent,
                        bg: '#fff',
                        card: '#fff',
                        text: '#0F0F0F',
                        muted: '#A0A0A0',
                        border: '#E5E5E5',
                        inputBg: '#F5F5F5',
                        pillActive: accent,
                        pillActiveTxt: '#fff',
                    }}
                />
            </div>
        </section>
    );
}

/* ─── TEAM ─────────────────────────────────────────────────────── */
function MinTeam({ barberos, accent }) {
    if (!barberos?.length) return null;
    return (
        <section id="equipo" style={{ background: T.gray50, paddingTop: 'var(--mn-2xl)', paddingBottom: 'var(--mn-2xl)' }}>
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-12 gap-4 mb-16">
                    <div className="col-span-12 md:col-span-3">
                        <span className="mn-body text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: T.gray400 }}>02 — Equipo</span>
                    </div>
                    <div className="col-span-12 md:col-span-9">
                        <h2 className="mn-body font-bold text-[#0F0F0F] mn-title">Nuestro Equipo</h2>
                    </div>
                </div>

                {/* Swiss grid: 12 col, mathematical */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {barberos.map((b, i) => (
                        <motion.div key={b._id || i}
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                            {/* Portrait — square crop */}
                            <div className="aspect-square overflow-hidden bg-[#E5E5E5] mb-4">
                                {b.foto
                                    ? <img src={b.foto} alt={b.nombre} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    : <div className="w-full h-full flex items-center justify-center"><Scissors size={28} style={{ color: T.gray400 }} /></div>
                                }
                            </div>
                            {/* Text — Swiss: no decoration */}
                            <div className="mn-rule pt-3">
                                <p className="mn-body text-sm font-semibold text-[#0F0F0F]">{b.nombre}</p>
                                {b.especialidad && <p className="mn-body text-[10px] font-medium uppercase tracking-[0.15em] mt-1" style={{ color: accent }}>{b.especialidad}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── REVIEWS ─────────────────────────────────────────────────── */
function MinReviews({ resenas, accent }) {
    const list = (resenas || []).filter(r => r.aprobada !== false);
    if (!list.length) return null;
    return (
        <section style={{ background: T.white, paddingTop: 'var(--mn-2xl)', paddingBottom: 'var(--mn-2xl)' }}>
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-12 gap-4 mb-16">
                    <div className="col-span-12 md:col-span-3">
                        <span className="mn-body text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: T.gray400 }}>03 — Reseñas</span>
                    </div>
                    <div className="col-span-12 md:col-span-9">
                        <h2 className="mn-body font-bold text-[#0F0F0F] mn-title">Opiniones</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {list.slice(0, 6).map((r, i) => (
                        <motion.div key={r._id || i}
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                            className="mn-rule p-8 pr-12" style={{ borderRight: i % 2 === 0 && i < list.length - 1 ? `1px solid ${T.gray200}` : 'none' }}>
                            {/* Stars as dashes — Swiss approach */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: r.calificacion || 5 }).map((_, j) => (
                                    <div key={j} style={{ width: '16px', height: '2px', background: accent }} />
                                ))}
                            </div>
                            <p className="mn-heading italic text-xl text-[#0F0F0F] leading-relaxed mb-5">"{r.comentario}"</p>
                            <p className="mn-body text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.gray400 }}>{r.nombre || 'Cliente'}</p>
                        </motion.div>
                    ))}
                </div>
                <div className="mn-rule" />
            </div>
        </section>
    );
}

/* ─── LOCATION + CTA ─────────────────────────────────────────────── */
function MinLocation({ barberia, accent, onBook }) {
    return (
        <section id="ubicacion" style={{ background: T.black, paddingTop: 'var(--mn-2xl)', paddingBottom: 'var(--mn-2xl)' }}>
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Big CTA copy */}
                    <div className="col-span-12 md:col-span-7">
                        <span className="mn-body text-[10px] font-semibold uppercase tracking-[0.3em] mb-6 block" style={{ color: T.gray400 }}>Reserva</span>
                        <h2 className="mn-body font-bold text-white mb-10" style={{ fontSize: 'clamp(2rem,5vw,4rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                            ¿Listo para tu<br />
                            <span className="mn-heading italic" style={{ color: accent }}>próxima cita?</span>
                        </h2>
                        <button onClick={onBook}
                            className="mn-body inline-flex items-center gap-4 px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] cursor-pointer text-[#0F0F0F] transition-all hover:opacity-90"
                            style={{ background: '#fff' }}>
                            <Calendar size={14} /> Reservar Ahora
                        </button>
                    </div>

                    {/* Right: Info */}
                    <div className="col-span-12 md:col-span-5 flex flex-col gap-8 justify-center">
                        {[
                            { icon: MapPin, val: barberia?.direccion },
                            { icon: Phone, val: barberia?.telefono },
                            { icon: Clock, val: barberia?.configuracion?.horario },
                        ].filter(i => i.val).map(({ icon: Icon, val }) => (
                            <div key={val} className="flex items-start gap-4">
                                <Icon size={16} style={{ color: accent, marginTop: '3px', flexShrink: 0 }} />
                                <p className="mn-body text-sm font-medium" style={{ color: '#A0A0A0' }}>{val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── FOOTER ─────────────────────────────────────────────────────── */
function MinFooter({ barberia, accent }) {
    return (
        <footer className="bg-[#0A0A0A] mn-rule" style={{ borderColor: '#222' }}>
            <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="mn-body text-[11px] font-semibold uppercase tracking-[0.2em] text-white">{barberia?.nombre}</span>
                <span className="mn-body text-[10px]" style={{ color: '#525252' }}>
                    © {new Date().getFullYear()} · Todos los derechos reservados
                </span>
                <span className="mn-body text-[10px] uppercase tracking-[0.15em]" style={{ color: accent }}>
                    Barbering Studio
                </span>
            </div>
        </footer>
    );
}

/* ─── ROOT ─────────────────────────────────────────────────────── */
export default function MinimalTemplate({ barberia, servicios, barberos, resenas, categorias }) {
    const { slug } = useBarberia();
    const navigate = useNavigate();
    const accent = getAccent(barberia);
    const onBook = () => navigate(`/${slug}/book`);

    return (
        <div className="min-h-screen bg-white mn-body">
            <Fonts />
            <MinNav barberia={barberia} accent={accent} onBook={onBook} />
            <MinHero barberia={barberia} accent={accent} onBook={onBook} />
            <MinServices servicios={servicios} accent={accent} onBook={onBook} categorias={categorias} />
            <MinTeam barberos={barberos} accent={accent} />
            {/* MARKETPLACE: productos destacados, solo si tienda activa */}
            <MarketplaceSection colorPrimary={accent} />
            <MinReviews resenas={resenas} accent={accent} />
            <MinLocation barberia={barberia} accent={accent} onBook={onBook} />
            <MinFooter barberia={barberia} accent={accent} />
            <WhatsAppButton phoneNumber={barberia?.telefono} />
        </div>
    );
}
