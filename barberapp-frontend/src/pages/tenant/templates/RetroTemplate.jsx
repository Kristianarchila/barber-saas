/**
 * RetroTemplate — Vintage Analog / Retro Film
 * UI UX Pro Max Style: Film grain, polaroid, VHS tracking, faded colors, light leaks
 * Fonts: Playfair Display (heading) + Special Elite (stamp) + Montserrat (body)
 * Colors: Cream #F5EDD8, Maroon #8B1A1A, Navy #1B3A6B, Sepia #2A1400
 */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, MapPin, Phone, Clock, Star, Calendar, Menu, X, Award, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBarberia } from '../../../context/BarberiaContext';
import WhatsAppButton from '../../../components/public/WhatsAppButton';
import BrandedFooter from '../../../components/public/BrandedFooter';
import ServicesCatalog from '../../../components/public/ServicesCatalog';

/* ─── TOKENS from UI UX Pro Max skill ─────────────────────────── */
const T = {
    cream: '#F5EDD8',
    maroon: '#8B1A1A',
    navy: '#1B3A6B',
    sepia: '#2A1400',
    dark: '#1C0E00',
    faded: '#C4A882',
};

/* ─── FONTS + FILM GRAIN CSS ─────────────────────────────────────── */
const Fonts = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Special+Elite&family=Montserrat:wght@400;500;600;700&display=swap');
        .rt-h   { font-family: 'Playfair Display', Georgia, serif; }
        .rt-s   { font-family: 'Special Elite', Courier, monospace; }
        .rt-b   { font-family: 'Montserrat', system-ui, sans-serif; }

        /* Film grain overlay — key Vintage Analog effect */
        .rt-grain::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
            background-size: 250px;
            mix-blend-mode: multiply;
            z-index: 2;
        }

        /* Barber pole stripe */
        .rt-pole {
            height: 18px;
            background: repeating-linear-gradient(
                90deg,
                #8B1A1A 0px, #8B1A1A 20px,
                #F5EDD8 20px, #F5EDD8 28px,
                #1B3A6B 28px, #1B3A6B 48px,
                #F5EDD8 48px, #F5EDD8 56px
            );
        }

        /* Aged paper background */
        .rt-paper {
            background-color: #F5EDD8;
            background-image:
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23F5EDD8'/%3E%3Ccircle cx='2' cy='2' r='0.8' fill='%23c4a88220'/%3E%3C/svg%3E"),
                linear-gradient(135deg, #F2E8D0 0%, #F5EDD8 50%, #EDE3CB 100%);
        }

        /* Vintage vignette */
        .rt-vignette::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(28,14,0,0.7) 100%);
            pointer-events: none;
            z-index: 2;
        }

        /* Polaroid card */
        .rt-polaroid {
            background: #FAFAF5;
            box-shadow: 2px 4px 20px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1) inset;
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* Light leak animation */
        @keyframes lightLeak {
            0%, 100% { opacity: 0; transform: translateX(-100%) rotate(-30deg); }
            50% { opacity: 0.07; transform: translateX(300%) rotate(-30deg); }
        }
        .rt-light-leak {
            position: absolute;
            inset: 0;
            background: linear-gradient(120deg, transparent 30%, rgba(255,200,100,0.3) 50%, transparent 70%);
            animation: lightLeak 8s ease-in-out infinite;
            pointer-events: none;
            z-index: 3;
        }
    `}</style>
);

/* ─── NAV ─────────────────────────────────────────────────────── */
function RetroNav({ barberia, onBook }) {
    const [open, setOpen] = useState(false);
    const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); };

    return (
        <>
            <nav className="sticky top-0 z-50" style={{ background: T.dark }}>
                <div className="rt-pole" />
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        {barberia?.configuracion?.logoUrl
                            ? <img src={barberia.configuracion.logoUrl} alt={barberia?.nombre} className="h-10 object-contain" />
                            : <div>
                                <div className="rt-h text-2xl font-black italic" style={{ color: T.cream }}>{barberia?.nombre}</div>
                                <div className="rt-s text-[9px] tracking-[0.25em]" style={{ color: T.maroon }}>Barber Shop · Est.</div>
                            </div>
                        }
                    </div>
                    <div className="hidden md:flex gap-8">
                        {['servicios', 'equipo', 'ubicacion'].map(id => (
                            <button key={id} onClick={() => go(id)}
                                className="rt-s text-[11px] uppercase tracking-widest cursor-pointer transition-colors"
                                style={{ color: `${T.cream}80` }}
                                onMouseEnter={e => e.target.style.color = T.cream}
                                onMouseLeave={e => e.target.style.color = `${T.cream}80`}>
                                {id[0].toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onBook}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 rt-b text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors border-2"
                            style={{ background: T.maroon, color: T.cream, borderColor: `${T.cream}20` }}>
                            <Scissors size={13} /> Reservar
                        </button>
                        <button onClick={() => setOpen(true)} className="md:hidden cursor-pointer" style={{ color: T.cream }}><Menu size={22} /></button>
                    </div>
                </div>
                <div className="rt-pole" />
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex flex-col px-8 py-10" style={{ background: T.dark }}>
                        <button onClick={() => setOpen(false)} className="self-end mb-8 cursor-pointer" style={{ color: T.cream }}><X size={26} /></button>
                        {['servicios', 'equipo', 'ubicacion'].map(id => (
                            <button key={id} onClick={() => go(id)}
                                className="rt-h text-4xl font-black italic text-left mb-6 cursor-pointer" style={{ color: T.cream }}>
                                {id[0].toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                        <button onClick={() => { onBook(); setOpen(false); }}
                            className="mt-auto w-full py-4 rt-b font-bold text-sm uppercase tracking-widest cursor-pointer"
                            style={{ background: T.maroon, color: T.cream }}>
                            Reservar Cita
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ─── HERO ─────────────────────────────────────────────────────── */
function RetroHero({ barberia, onBook }) {
    const images = barberia?.configuracion?.galeriaHero || barberia?.configuracion?.galeria || [];
    const bg = images[0];
    const title = barberia?.configuracion?.heroTitle || barberia?.nombre || 'Classic Cuts';
    const slogan = barberia?.configuracion?.slogan || 'Cortes desde 1965';

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden rt-grain rt-vignette" style={{ background: T.dark }}>
            {/* Background image with faded overlay — Vintage Analog technique */}
            {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.2, filter: 'sepia(0.6) contrast(0.8)' }} />}

            {/* Light leak animation */}
            <div className="rt-light-leak" />

            {/* Vignette dark border */}
            <div className="absolute inset-0 z-4" style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 40%, ${T.dark}AA 100%)` }} />

            <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                    {/* Vintage badge */}
                    <div className="inline-block border-4 p-10 md:p-16 relative" style={{ borderColor: `${T.faded}30` }}>
                        <div className="absolute inset-2 border pointer-events-none" style={{ borderColor: `${T.maroon}40` }} />

                        <div className="flex items-center gap-3 justify-center mb-4">
                            <div className="h-px w-10" style={{ background: T.maroon }} />
                            <Award size={16} style={{ color: T.maroon }} />
                            <div className="h-px w-10" style={{ background: T.maroon }} />
                        </div>

                        <div className="rt-s text-xs tracking-[0.5em] uppercase mb-4" style={{ color: T.faded }}>
                            {barberia?.configuracion?.badge || '★ ESTABLISHED · EST. ★'}
                        </div>

                        <h1 className="rt-h font-black italic leading-none mb-5" style={{ fontSize: 'clamp(3rem,10vw,8rem)', color: T.cream }}>
                            {title}
                        </h1>

                        <div className="flex items-center justify-center gap-3 mb-5">
                            <div className="h-px flex-1 max-w-12" style={{ background: T.maroon }} />
                            <Scissors size={14} style={{ color: T.maroon }} />
                            <div className="h-px flex-1 max-w-12" style={{ background: T.maroon }} />
                        </div>

                        <p className="rt-s text-sm leading-relaxed max-w-sm mx-auto mb-10" style={{ color: `${T.cream}80` }}>{slogan}</p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={onBook}
                                className="rt-b px-10 py-3.5 font-bold text-[11px] uppercase tracking-widest cursor-pointer transition-all"
                                style={{ background: T.maroon, color: T.cream }}>
                                <Calendar size={14} className="inline mr-2" /> Reservar Cita
                            </button>
                            <button onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                                className="rt-b px-10 py-3.5 font-bold text-[11px] uppercase tracking-widest cursor-pointer border-2 transition-all hover:bg-white/5"
                                style={{ borderColor: `${T.cream}40`, color: T.cream }}>
                                Ver Servicios
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-8">
                    <ChevronDown size={20} style={{ color: `${T.maroon}70`, margin: '0 auto' }} />
                </motion.div>
            </div>
        </section>
    );
}

/* ─── SERVICES ─────────────────────────────────────────────────── */
function RetroServices({ servicios, onBook, categorias }) {
    return (
        <section id="servicios" className="rt-paper rt-grain relative" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
            <div className="max-w-6xl mx-auto px-8 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                    <div className="rt-s text-xs tracking-[0.5em] uppercase mb-3" style={{ color: T.maroon }}>— Menu —</div>
                    <h2 className="rt-h text-5xl md:text-6xl font-black italic" style={{ color: T.dark }}>Servicios</h2>
                    <div className="h-1 w-20 mx-auto mt-4" style={{ background: T.maroon }} />
                </motion.div>
                <ServicesCatalog
                    servicios={servicios}
                    onBook={onBook}
                    categorias={categorias}
                    title=""
                    theme={{
                        accent: T.maroon,
                        bg: 'transparent',
                        card: 'rgba(245,237,216,0.9)',
                        text: T.dark,
                        muted: `${T.dark}80`,
                        border: `${T.sepia}30`,
                        inputBg: 'rgba(245,237,216,0.6)',
                        pillActive: T.maroon,
                        pillActiveTxt: T.cream,
                    }}
                />
            </div>
        </section>
    );
}

/* ─── TEAM — Polaroid style ─────────────────────────────────────── */
function RetroTeam({ barberos }) {
    if (!barberos?.length) return null;
    const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-1'];
    return (
        <section id="equipo" className="py-24 px-8 rt-grain relative overflow-hidden" style={{ background: T.dark }}>
            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <div className="rt-s text-xs tracking-[0.5em] uppercase mb-3" style={{ color: `${T.faded}80` }}>— Nuestro Equipo —</div>
                    <h2 className="rt-h text-5xl font-black italic" style={{ color: T.cream }}>Los Maestros</h2>
                    <div className="h-1 w-20 mx-auto mt-4" style={{ background: T.maroon }} />
                </motion.div>

                <div className="flex flex-wrap justify-center gap-8">
                    {barberos.map((b, i) => (
                        <motion.div key={b._id || i}
                            initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -3 : 3 }}
                            whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }}
                            whileHover={{ rotate: 0, scale: 1.03 }}
                            className="rt-polaroid cursor-pointer transition-all duration-300"
                            style={{ width: '180px', padding: '10px 10px 50px' }}>
                            <div className="w-full overflow-hidden" style={{ height: '200px' }}>
                                {b.foto
                                    ? <img src={b.foto} alt={b.nombre} className="w-full h-full object-cover" style={{ filter: 'sepia(0.25) contrast(0.95)' }} />
                                    : <div className="w-full h-full flex items-center justify-center" style={{ background: '#ddd' }}>
                                        <Scissors size={32} style={{ color: `${T.dark}40` }} />
                                    </div>
                                }
                            </div>
                            <div className="mt-3 text-center px-1">
                                <p className="rt-s text-sm" style={{ color: T.dark }}>{b.nombre}</p>
                                {b.especialidad && <p className="rt-b text-[9px] font-bold uppercase mt-1" style={{ color: T.maroon }}>{b.especialidad}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── REVIEWS ─────────────────────────────────────────────────── */
function RetroReviews({ resenas }) {
    const list = (resenas || []).filter(r => r.aprobada !== false);
    if (!list.length) return null;
    return (
        <section className="rt-paper rt-grain relative py-24 px-8">
            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                    <div className="rt-s text-xs tracking-[0.5em] uppercase mb-3" style={{ color: T.maroon }}>— Testimonios —</div>
                    <h2 className="rt-h text-5xl font-black italic" style={{ color: T.dark }}>Lo que dicen</h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {list.slice(0, 4).map((r, i) => (
                        <motion.div key={r._id || i}
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="border-l-4 pl-6 py-2" style={{ borderColor: T.maroon }}>
                            <div className="flex gap-1 mb-3">
                                {Array.from({ length: r.calificacion || 5 }).map((_, j) => <Star key={j} size={12} className="fill-current" style={{ color: T.maroon }} />)}
                            </div>
                            <p className="rt-s text-sm leading-relaxed mb-4" style={{ color: `${T.dark}AA` }}>"{r.comentario}"</p>
                            <p className="rt-b text-[10px] font-bold uppercase tracking-widest" style={{ color: T.maroon }}>— {r.nombre || 'Cliente'}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── CTA ─────────────────────────────────────────────────────── */
function RetroCTA({ onBook, barberia }) {
    return (
        <section className="py-24 px-8 text-center rt-grain relative overflow-hidden" style={{ background: T.maroon }}>
            <div className="rt-light-leak" />
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
                <div className="rt-s text-xs tracking-[0.5em] uppercase mb-5" style={{ color: `${T.cream}80` }}>✦ Agenda tu cita hoy ✦</div>
                <h2 className="rt-h text-5xl md:text-6xl font-black italic mb-6" style={{ color: T.cream }}>¿Listo para el corte perfecto?</h2>
                <button onClick={onBook}
                    className="rt-b px-12 py-4 font-bold text-sm uppercase tracking-widest cursor-pointer border-2 transition-all hover:bg-white/10"
                    style={{ borderColor: `${T.cream}80`, color: T.cream }}>
                    <Calendar size={16} className="inline mr-2" /> Reservar mi Cita
                </button>
                {barberia?.direccion && (
                    <div className="mt-10 flex flex-wrap justify-center gap-8">
                        <span className="rt-s text-xs flex items-center gap-2" style={{ color: `${T.cream}70` }}>
                            <MapPin size={12} /> {barberia.direccion}
                        </span>
                        {barberia?.telefono && (
                            <span className="rt-s text-xs flex items-center gap-2" style={{ color: `${T.cream}70` }}>
                                <Phone size={12} /> {barberia.telefono}
                            </span>
                        )}
                    </div>
                )}
            </motion.div>
        </section>
    );
}

/* ─── ROOT ─────────────────────────────────────────────────────── */
export default function RetroTemplate({ barberia, servicios, barberos, resenas, categorias }) {
    const { slug } = useBarberia();
    const navigate = useNavigate();
    const onBook = () => navigate(`/${slug}/book`);

    return (
        <div className="min-h-screen" style={{ background: T.dark }}>
            <Fonts />
            <RetroNav barberia={barberia} onBook={onBook} />
            <RetroHero barberia={barberia} onBook={onBook} />
            <RetroServices servicios={servicios} onBook={onBook} categorias={categorias} />
            <RetroTeam barberos={barberos} />
            <RetroReviews resenas={resenas} />
            <RetroCTA onBook={onBook} barberia={barberia} />
            <BrandedFooter barberia={barberia} />
            <WhatsAppButton phoneNumber={barberia?.telefono} />
        </div>
    );
}
