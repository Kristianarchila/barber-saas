/**
 * LuxuryTemplate — Skeuomorphism + Liquid Glass
 * UI UX Pro Max Style: Leather/Metal textures + iridescent blur overlays
 * Fonts: Cormorant Garamond (heading) + Montserrat (body)
 * Colors: Deep black #0A0A0A, Gold #C9A96E, Leather #3D1C02
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Scissors, MapPin, Phone, Clock, Star, Calendar, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBarberia } from '../../../context/BarberiaContext';
import WhatsAppButton from '../../../components/public/WhatsAppButton';
import BrandedFooter from '../../../components/public/BrandedFooter';
import ServicesCatalog from '../../../components/public/ServicesCatalog';
import MarketplaceSection from '../../../components/public/MarketplaceSection';

/* ─── TOKENS from UI UX Pro Max skill ─────────────────────────── */
const T = {
    bgDark: '#0A0A0A',
    bgCard: '#111008',
    gold: '#C9A96E',
    goldLight: '#E8C98A',
    leather: '#2A1400',
    text: '#F5EDD8',
    muted: '#8A7A5A',
};

/* ─── FONTS ─────────────────────────────────────────────────────── */
const Fonts = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,500;1,700&family=Montserrat:wght@300;400;500;600&display=swap');
        .lx-h  { font-family: 'Cormorant Garamond', Georgia, serif; letter-spacing: -0.01em; }
        .lx-b  { font-family: 'Montserrat', system-ui, sans-serif; }
        /* Skeuomorphism: leather texture */
        .lx-leather {
            background-image:
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23000'/%3E%3Ccircle cx='1' cy='1' r='0.8' fill='%23ffffff08'/%3E%3Ccircle cx='3' cy='3' r='0.8' fill='%23ffffff05'/%3E%3C/svg%3E"),
                linear-gradient(135deg, #1a0d00 0%, #0a0800 50%, #140900 100%);
            box-shadow: inset 0 1px 0 rgba(201,169,110,0.15), inset 0 -1px 0 rgba(0,0,0,0.5);
        }
        /* Liquid Glass card */
        .lx-glass {
            background: linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(201,169,110,0.05) 100%);
            backdrop-filter: blur(12px) saturate(1.5);
            -webkit-backdrop-filter: blur(12px) saturate(1.5);
            border: 1px solid rgba(201,169,110,0.15);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,169,110,0.1);
        }
        /* Gold metallic text */
        .lx-gold-text {
            background: linear-gradient(135deg, #c9a96e 0%, #f0d080 40%, #b8892e 70%, #e8c070 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        /* Gold divider */
        .lx-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #c9a96e, rgba(201,169,110,0.3), transparent);
        }
    `}</style>
);

/* ─── NAV ─────────────────────────────────────────────────────── */
function LuxNav({ barberia, onBook }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const go = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); };

    return (
        <>
            <motion.nav
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${scrolled ? 'lx-leather border-b border-[#C9A96E]/20 py-3' : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                    <div>
                        {barberia?.configuracion?.logoUrl
                            ? <img src={barberia.configuracion.logoUrl} alt={barberia?.nombre} className="h-9 object-contain" />
                            : <>
                                <div className="lx-h text-xl font-light tracking-[0.2em] uppercase text-[#F5EDD8]">{barberia?.nombre}</div>
                                <div className="lx-b text-[8px] tracking-[0.5em] uppercase lx-gold-text font-medium">LUXURY BARBERSHOP</div>
                            </>
                        }
                    </div>
                    <div className="hidden md:flex gap-10 items-center">
                        {['servicios', 'equipo', 'resenas', 'ubicacion'].map(id => (
                            <button key={id} onClick={() => go(id)}
                                className="lx-b text-[10px] font-medium uppercase tracking-[0.25em] text-[#8A7A5A] hover:text-[#C9A96E] transition-colors duration-300 cursor-pointer">
                                {id === 'resenas' ? 'Reseñas' : id[0].toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onBook}
                            className="hidden md:flex items-center gap-2 px-6 py-2.5 lx-b text-[10px] font-semibold uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 border border-[#C9A96E]/50 text-[#C9A96E] hover:bg-[#C9A96E]/10"
                            style={{ boxShadow: '0 0 20px rgba(201,169,110,0.1)' }}>
                            <Calendar size={13} /> Reservar
                        </button>
                        <button onClick={() => setOpen(true)} className="md:hidden text-[#F5EDD8] cursor-pointer"><Menu size={22} /></button>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A]">
                        <button onClick={() => setOpen(false)} className="absolute top-8 right-8 text-[#F5EDD8] cursor-pointer"><X size={26} /></button>
                        {['servicios', 'equipo', 'resenas', 'ubicacion'].map(id => (
                            <button key={id} onClick={() => go(id)}
                                className="lx-h text-5xl font-light italic text-[#F5EDD8] hover:lx-gold-text mb-8 cursor-pointer transition-all duration-300">
                                {id === 'resenas' ? 'Reseñas' : id[0].toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                        <button onClick={() => { onBook(); setOpen(false); }}
                            className="mt-6 px-12 py-3.5 border border-[#C9A96E] text-[#C9A96E] lx-b text-xs font-semibold uppercase tracking-widest cursor-pointer hover:bg-[#C9A96E]/10">
                            Reservar Cita
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/* ─── HERO ─────────────────────────────────────────────────────── */
function LuxHero({ barberia, onBook }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const op = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const images = barberia?.configuracion?.galeriaHero || barberia?.configuracion?.galeria || [];
    const bg = images[0];
    const title = barberia?.configuracion?.heroTitle || barberia?.nombre || 'LUXURY';
    const slogan = barberia?.configuracion?.slogan || 'La excelencia en cada detalle';

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: T.bgDark }}>
            {/* Skeuomorphic leather base */}
            <div className="absolute inset-0 lx-leather z-0" />

            {/* Image parallax */}
            {bg && (
                <motion.div style={{ y: yBg }} className="absolute inset-0 z-1">
                    <img src={bg} alt="" className="w-full h-full object-cover opacity-15" />
                </motion.div>
            )}

            {/* Iridescent gradient overlay — Liquid Glass effect */}
            <div className="absolute inset-0 z-2" style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,110,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(201,169,110,0.04) 0%, transparent 50%)',
            }} />

            {/* Gold horizontal lines — metallic feel */}
            {[25, 75].map(p => (
                <div key={p} className="absolute inset-x-16 z-3 lx-divider" style={{ top: `${p}%` }} />
            ))}

            <motion.div style={{ opacity: op }} className="relative z-10 text-center px-8 max-w-5xl mx-auto">
                {/* Ornament */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
                    <div className="flex items-center justify-center gap-5 mb-8">
                        <div className="lx-divider flex-1 max-w-20" />
                        <Scissors size={16} style={{ color: T.gold }} />
                        <div className="lx-b text-[9px] font-medium tracking-[0.7em] uppercase" style={{ color: T.gold }}>
                            {barberia?.configuracion?.badge || 'EST. BARBERSHOP'}
                        </div>
                        <Scissors size={16} style={{ color: T.gold, transform: 'scaleX(-1)' }} />
                        <div className="lx-divider flex-1 max-w-20" />
                    </div>

                    {/* Metallic title */}
                    <h1 className="lx-h font-light italic leading-[0.85] mb-8" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}>
                        <span className="lx-gold-text">{title}</span>
                    </h1>

                    <div className="lx-divider max-w-xs mx-auto mb-8" />

                    <p className="lx-b text-sm leading-relaxed max-w-md mx-auto mb-12 font-light" style={{ color: T.muted }}>
                        {slogan}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button onClick={onBook}
                            className="lx-b px-12 py-4 text-[10px] font-semibold uppercase tracking-[0.35em] cursor-pointer transition-all duration-300"
                            style={{
                                background: `linear-gradient(135deg, #c9a96e, #e8c070, #b8892e)`,
                                color: '#0A0A0A',
                                boxShadow: '0 4px 24px rgba(201,169,110,0.25)',
                            }}>
                            Agendar Cita
                        </button>
                        <button onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                            className="lx-b flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] cursor-pointer transition-colors duration-300 hover:text-[#F5EDD8]"
                            style={{ color: T.gold }}>
                            Ver Servicios <ArrowRight size={14} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
                <ChevronDown size={20} style={{ color: `${T.gold}50` }} />
            </motion.div>
        </section>
    );
}

/* ─── SERVICES ─────────────────────────────────────────────────── */
function LuxServices({ servicios, onBook, categorias }) {
    return (
        <section id="servicios" className="py-24 px-8" style={{ background: T.leather }}>
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
                    <div className="lx-b text-[9px] font-medium tracking-[0.6em] uppercase mb-4" style={{ color: T.gold }}>Servicios</div>
                    <h2 className="lx-h text-6xl md:text-7xl font-light italic" style={{ color: T.text }}>Nuestros<br />Servicios</h2>
                    <div className="lx-divider max-w-[200px] mt-6" />
                </motion.div>
                <ServicesCatalog
                    servicios={servicios}
                    onBook={onBook}
                    categorias={categorias}
                    title=""
                    theme={{
                        accent: T.gold,
                        bg: T.leather,
                        card: 'rgba(201,169,110,0.06)',
                        text: T.text,
                        muted: T.muted,
                        border: 'rgba(201,169,110,0.15)',
                        inputBg: 'rgba(255,255,255,0.04)',
                        pillActive: T.gold,
                        pillActiveTxt: '#0A0A0A',
                    }}
                />
            </div>
        </section>
    );
}

/* ─── TEAM ─────────────────────────────────────────────────────── */
function LuxTeam({ barberos }) {
    if (!barberos?.length) return null;
    return (
        <section id="equipo" className="py-32 px-8" style={{ background: T.bgDark }}>
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
                    <div className="lx-b text-[9px] font-medium tracking-[0.6em] uppercase mb-4" style={{ color: T.gold }}>Equipo</div>
                    <h2 className="lx-h text-6xl font-light italic" style={{ color: T.text }}>Los Artesanos</h2>
                    <div className="lx-divider max-w-32 mx-auto mt-6" />
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {barberos.map((b, i) => (
                        <motion.div key={b._id || i}
                            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="group relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                            {b.foto
                                ? <img src={b.foto} alt={b.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                : <div className="w-full h-full lx-leather flex items-center justify-center"><Scissors size={40} style={{ color: `${T.gold}30` }} /></div>
                            }
                            {/* Metallic overlay bottom */}
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A0A 0%, rgba(0,0,0,0.3) 40%, transparent 70%)' }} />
                            <div className="absolute bottom-0 left-0 right-0 p-7">
                                <div className="lx-divider mb-3" />
                                <h3 className="lx-h text-xl font-light italic" style={{ color: T.text }}>{b.nombre}</h3>
                                {b.especialidad && <p className="lx-b text-[9px] font-medium tracking-[0.3em] uppercase mt-1" style={{ color: T.gold }}>{b.especialidad}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── REVIEWS ─────────────────────────────────────────────────── */
function LuxReviews({ resenas }) {
    const list = (resenas || []).filter(r => r.aprobada !== false);
    if (!list.length) return null;
    return (
        <section id="resenas" className="py-32 px-8" style={{ background: T.leather }}>
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-20">
                    <div className="lx-b text-[9px] font-medium tracking-[0.6em] uppercase mb-4" style={{ color: T.gold }}>Testimonios</div>
                    <h2 className="lx-h text-6xl font-light italic" style={{ color: T.text }}>Lo que dicen</h2>
                    <div className="lx-divider max-w-24 mx-auto mt-6" />
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {list.slice(0, 4).map((r, i) => (
                        <motion.div key={r._id || i}
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="lx-glass p-8" style={{ borderRadius: '2px' }}>
                            <div className="flex gap-0.5 mb-5">
                                {Array.from({ length: r.calificacion || 5 }).map((_, j) => <Star key={j} size={12} className="fill-current" style={{ color: T.gold }} />)}
                            </div>
                            <p className="lx-h text-xl font-light italic leading-relaxed mb-5" style={{ color: T.text }}>"{r.comentario}"</p>
                            <div className="lx-divider mb-4" />
                            <p className="lx-b text-[10px] font-medium uppercase tracking-widest" style={{ color: T.gold }}>— {r.nombre || 'Cliente'}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── CTA ─────────────────────────────────────────────────────── */
function LuxCTA({ onBook, barberia }) {
    return (
        <section className="py-32 px-8 relative overflow-hidden" style={{ background: T.bgDark }}>
            <div className="absolute inset-0 lx-leather" />
            {/* Liquid glass iridescent overlay */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.08) 0%, transparent 70%)'
            }} />
            <div className="lx-divider absolute top-0 inset-x-0" />
            <div className="lx-divider absolute bottom-0 inset-x-0" />

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="lx-divider flex-1 max-w-16" /><Scissors size={18} style={{ color: T.gold }} /><div className="lx-divider flex-1 max-w-16" />
                </div>
                <h2 className="lx-h font-light italic mb-6" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', color: T.text }}>Reserve su Cita</h2>
                <p className="lx-b text-sm font-light mb-12" style={{ color: T.muted }}>Una experiencia que transforma tu estilo.</p>
                <button onClick={onBook}
                    className="lx-b px-14 py-5 text-[10px] font-semibold uppercase tracking-[0.4em] cursor-pointer transition-all duration-300"
                    style={{ background: `linear-gradient(135deg,#c9a96e,#e8c070,#b8892e)`, color: '#0A0A0A', boxShadow: '0 8px 32px rgba(201,169,110,0.2)' }}>
                    Reservar Ahora
                </button>
                {barberia?.direccion && (
                    <p className="lx-b text-xs mt-10 flex items-center justify-center gap-2 font-light" style={{ color: T.muted }}>
                        <MapPin size={13} style={{ color: T.gold }} /> {barberia.direccion}
                    </p>
                )}
            </motion.div>
        </section>
    );
}

/* ─── LOCATION ─────────────────────────────────────────────────── */
function LuxLocation({ barberia }) {
    return (
        <section id="ubicacion" className="py-20 px-8 border-t border-[#C9A96E]/10" style={{ background: T.leather }}>
            <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-16">
                {[
                    { icon: MapPin, label: 'Ubicación', val: barberia?.direccion },
                    { icon: Phone, label: 'Teléfono', val: barberia?.telefono },
                    { icon: Clock, label: 'Horario', val: barberia?.configuracion?.horario },
                ].filter(i => i.val).map(({ icon: Icon, label, val }) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                        <Icon size={18} style={{ color: T.gold, margin: '0 auto 12px' }} />
                        <p className="lx-b text-[9px] tracking-[0.4em] uppercase mb-2" style={{ color: T.muted }}>{label}</p>
                        <p className="lx-b text-sm font-light" style={{ color: T.text }}>{val}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

/* ─── ROOT ─────────────────────────────────────────────────────── */
export default function LuxuryTemplate({ barberia, servicios, barberos, resenas, categorias }) {
    const { slug } = useBarberia();
    const navigate = useNavigate();
    const onBook = () => navigate(`/${slug}/book`);

    return (
        <div className="min-h-screen" style={{ background: T.bgDark, color: T.text }}>
            <Fonts />
            <LuxNav barberia={barberia} onBook={onBook} />
            <LuxHero barberia={barberia} onBook={onBook} />
            <LuxServices servicios={servicios} onBook={onBook} categorias={categorias} />
            <LuxTeam barberos={barberos} />
            {/* MARKETPLACE: productos destacados, solo si tienda activa */}
            <MarketplaceSection colorPrimary={T.gold} />
            <LuxReviews resenas={resenas} />
            <LuxCTA onBook={onBook} barberia={barberia} />
            <LuxLocation barberia={barberia} />
            <BrandedFooter barberia={barberia} />
            <WhatsAppButton phoneNumber={barberia?.telefono} />
        </div>
    );
}
