import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Scissors, Calendar, Users, BarChart3, Smartphone, Shield,
    Star, ArrowRight, Check, Zap, TrendingUp, Crown, ChevronRight
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';

const FEATURES = [
    { icon: Calendar, title: 'Reservas Online 24/7', desc: 'Tus clientes reservan desde cualquier dispositivo, sin llamadas.' },
    { icon: Users, title: 'Gestión de Barberos', desc: 'Administra horarios, turnos y comisiones de todo tu equipo.' },
    { icon: BarChart3, title: 'Reportes y Finanzas', desc: 'Métricas en tiempo real: ingresos, clientes, servicios más pedidos.' },
    { icon: Smartphone, title: 'App móvil PWA', desc: 'Notificaciones push para barberos cuando llega una reserva nueva.' },
    { icon: Shield, title: 'Multi-tenant seguro', desc: 'Cada barbería tiene su entorno aislado. Datos 100% separados.' },
    { icon: Star, title: 'Reseñas y Fidelización', desc: 'Gestiona reseñas, cupones y lista de espera para maximizar ingresos.' },
];

const STEPS = [
    { n: '01', title: 'Crea tu barbería', desc: 'Regístrate, personaliza tu perfil y sube tu logo en minutos.' },
    { n: '02', title: 'Agrega tus barberos', desc: 'Invita a tu equipo, define horarios y servicios de cada uno.' },
    { n: '03', title: 'Comparte tu link', desc: 'Tus clientes reservan desde tu página pública: tubareria.barbersaas.com' },
    { n: '04', title: 'Gestiona desde el panel', desc: 'Controla todo: reservas, pagos, inventario y más desde un solo lugar.' },
];

const PLANS = [
    { name: 'Básico', price: 15, icon: Zap, color: 'from-blue-500 to-blue-600', features: ['3 barberos', '100 reservas/mes', '0% comisión'], highlighted: false },
    { name: 'Pro', price: 29, icon: TrendingUp, color: 'from-purple-500 to-indigo-600', features: ['10 barberos', '500 reservas/mes', '0% comisión'], highlighted: true },
    { name: 'Premium', price: 49, icon: Crown, color: 'from-amber-500 to-orange-600', features: ['Ilimitado', 'Todas las funciones', '0% comisión'] },
];

const TESTIMONIALS = [
    { name: 'Carlos M.', shop: 'Barbería Elite', text: 'Antes perdía reservas por WhatsApp. Ahora todo es automático y mis clientes aman el sistema.', stars: 5 },
    { name: 'José R.', shop: 'The Barber Room', text: 'En 2 días ya tenía todo configurado. La agenda online cambió mi negocio completamente.', stars: 5 },
    { name: 'Miguel A.', shop: 'Studio Kings', text: 'Gestiono 6 barberos desde el celular. Los reportes me ayudan a saber qué servicios venden más.', stars: 5 },
];

const TEMPLATES_SHOWCASE = [
    {
        key: 'modern',
        name: 'Modern Dark',
        emoji: '🖤',
        vibe: 'Oscuro, parallax y urbano',
        plan: null,
        planLabel: 'Incluido en todos los planes',
        gradient: 'from-zinc-800 to-zinc-900',
        accent: '#a855f7',
        tags: ['Oscuro', 'Parallax', 'Urbano'],
    },
    {
        key: 'premium',
        name: 'Premium Impact',
        emoji: '⚡',
        vibe: 'Hero full-screen de alto impacto',
        plan: null,
        planLabel: 'Incluido en todos los planes',
        gradient: 'from-slate-800 to-slate-900',
        accent: '#60a5fa',
        tags: ['Bold', 'Full-screen', 'Dark'],
    },
    {
        key: 'minimal',
        name: 'Minimal Clean',
        emoji: '🤍',
        vibe: 'Blanco puro, tipografía elegante',
        plan: 'Pro',
        planLabel: 'Desde Plan Pro',
        gradient: 'from-white to-gray-100',
        accent: '#111827',
        dark: true,
        tags: ['Blanco', 'Minimalista', 'Elegante'],
    },
    {
        key: 'vintage',
        name: 'Vintage Barbershop',
        emoji: '✂️',
        vibe: 'Estética clásica años ’50, serif y sepia',
        plan: 'Pro',
        planLabel: 'Desde Plan Pro',
        gradient: 'from-amber-900 to-stone-900',
        accent: '#c9a96e',
        tags: ['Clásico', 'Serif', 'Cálido'],
    },
    {
        key: 'bold',
        name: 'Bold & Color',
        emoji: '🎨',
        vibe: 'Tu color como protagonista, geométrico',
        plan: 'Premium',
        planLabel: 'Exclusivo Plan Premium',
        gradient: 'from-violet-600 to-purple-800',
        accent: '#fff',
        tags: ['Color', 'Geométrico', 'Llamativo'],
    },
];

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Landing() {
    return (
        <PublicLayout>
            {/* HERO */}
            <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 py-20">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div {...fade} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm mb-6">
                        <Zap size={14} className="text-yellow-400" /> Prueba gratis por 14 días · Sin tarjeta de crédito
                    </motion.div>

                    <motion.h1 {...fade} transition={{ delay: 0.1 }} className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                        Gestiona tu barbería<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                            como un profesional
                        </span>
                    </motion.h1>

                    <motion.p {...fade} transition={{ delay: 0.2 }} className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Reservas online, gestión de barberos, reportes y más. Todo en una sola plataforma hecha para barberías modernas.
                    </motion.p>

                    <motion.div {...fade} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-lg transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5">
                            Comenzar gratis <ArrowRight size={20} />
                        </Link>
                        <Link to="/precios" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-semibold rounded-2xl text-lg transition-all">
                            Ver precios <ChevronRight size={20} />
                        </Link>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div {...fade} transition={{ delay: 0.4 }} className="mt-12 flex items-center justify-center gap-2 text-zinc-500 text-sm">
                        <div className="flex -space-x-2">
                            {['C', 'J', 'M', 'A', 'R'].map((l, i) => (
                                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-black">{l}</div>
                            ))}
                        </div>
                        <span>+200 barberías confían en nosotros</span>
                    </motion.div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-24 px-4 border-t border-zinc-900">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fade} className="text-center mb-16">
                        <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Todo lo que necesitas</p>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Una plataforma completa</h2>
                        <p className="text-zinc-500 max-w-xl mx-auto">Diseñada específicamente para barberías. Sin funciones innecesarias, con todo lo que importa.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <motion.div key={i} {...fade} transition={{ delay: i * 0.05 }}
                                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-purple-500/30 group-hover:to-indigo-500/30 transition-all">
                                    <f.icon size={22} className="text-purple-400" />
                                </div>
                                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="como-funciona" className="py-24 px-4 bg-zinc-950">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fade} className="text-center mb-16">
                        <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Proceso simple</p>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Listo en minutos</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map((s, i) => (
                            <motion.div key={i} {...fade} transition={{ delay: i * 0.08 }} className="relative">
                                <div className="text-6xl font-black text-zinc-800 mb-3">{s.n}</div>
                                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
                                {i < STEPS.length - 1 && (
                                    <ArrowRight className="hidden lg:block absolute top-8 -right-4 text-zinc-700" size={20} />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING PREVIEW */}
            <section className="py-24 px-4 border-t border-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fade} className="text-center mb-16">
                        <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Precios simples</p>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Elige tu plan</h2>
                        <p className="text-zinc-500">14 días gratis en cualquier plan. Sin tarjeta de crédito.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PLANS.map((p, i) => (
                            <motion.div key={i} {...fade} transition={{ delay: i * 0.08 }}
                                className={`p-6 rounded-2xl border flex flex-col ${p.highlighted ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500/30' : 'bg-zinc-900/50 border-zinc-800'}`}
                            >
                                {p.highlighted && <span className="self-start mb-3 px-2 py-0.5 text-xs font-black bg-purple-600 text-white rounded-full uppercase">Más popular</span>}
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                                    <p.icon size={18} className="text-white" />
                                </div>
                                <h3 className="text-white font-black text-xl mb-1">{p.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-black text-white">${p.price}</span>
                                    <span className="text-zinc-500 text-sm">USD/mes</span>
                                </div>
                                <ul className="space-y-2 mb-6 flex-1">
                                    {p.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                                            <Check size={14} className="text-emerald-400 flex-shrink-0" />{f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/signup" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${p.highlighted ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                                    Empezar gratis
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/precios" className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                            Ver comparativa completa <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-24 px-4 bg-zinc-950 border-t border-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fade} className="text-center mb-16">
                        <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Testimonios</p>
                        <h2 className="text-4xl font-black text-white">Lo que dicen las barberías</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} {...fade} transition={{ delay: i * 0.08 }} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                <div className="flex mb-3">
                                    {Array.from({ length: t.stars }).map((_, j) => (<Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />))}
                                </div>
                                <p className="text-zinc-300 text-sm mb-4 leading-relaxed">"{t.text}"</p>
                                <div>
                                    <p className="text-white font-bold text-sm">{t.name}</p>
                                    <p className="text-zinc-600 text-xs">{t.shop}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TEMPLATE SHOWCASE — "Elige tu estilo" */}
            <section className="py-24 px-4 border-t border-zinc-900 bg-zinc-950">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fade} className="text-center mb-16">
                        <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">Tu identidad, tu forma</p>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Elige tu estilo</h2>
                        <p className="text-zinc-500 max-w-xl mx-auto">
                            5 plantillas diseñadas por expertos, cada una con su propia personalidad.
                            La misma gestión de reservas en todas.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                        {TEMPLATES_SHOWCASE.map((t, i) => (
                            <motion.div
                                key={t.key}
                                {...fade}
                                transition={{ delay: i * 0.07 }}
                                className={`relative rounded-2xl overflow-hidden border border-zinc-800 group hover:-translate-y-1 transition-all duration-300 cursor-default`}
                            >
                                {/* Card visual */}
                                <div
                                    className={`h-40 bg-gradient-to-br ${t.gradient} flex flex-col items-center justify-center relative overflow-hidden`}
                                >
                                    {/* Fake browser bar */}
                                    <div className={`absolute top-0 inset-x-0 flex items-center gap-1 px-3 py-1.5 ${t.dark ? 'bg-gray-200/60' : 'bg-black/40'}`}>
                                        {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c, j) => (
                                            <div key={j} className={`w-2 h-2 rounded-full ${c} opacity-80`} />
                                        ))}
                                    </div>
                                    <span className="text-4xl mt-4">{t.emoji}</span>
                                    <span className="text-xs font-black mt-2 uppercase tracking-widest" style={{ color: t.accent }}>{t.name}</span>
                                </div>

                                {/* Card info */}
                                <div className="p-4 bg-zinc-900">
                                    <p className="text-white font-black text-sm mb-1">{t.name}</p>
                                    <p className="text-zinc-500 text-xs mb-3 leading-snug">{t.vibe}</p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {t.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{tag}</span>
                                        ))}
                                    </div>
                                    {t.plan ? (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-800">
                                            🔒 {t.planLabel}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
                                            ✓ {t.planLabel}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div {...fade} className="text-center">
                        <p className="text-zinc-500 text-sm mb-4">
                            🔑 <strong className="text-zinc-300">FREE y Básico</strong> incluyen Modern + Premium &nbsp;·&nbsp;
                            🚀 <strong className="text-zinc-300">Pro</strong> agrega Minimal + Vintage &nbsp;·&nbsp;
                            ✨ <strong className="text-zinc-300">Premium</strong> desbloquea Bold (todas las 5)
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5"
                        >
                            Elegir mi plantilla →
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-24 px-4 border-t border-zinc-900">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div {...fade}>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                            ¿Listo para modernizar<br />tu barbería?
                        </h2>
                        <p className="text-zinc-500 mb-8">Únete a las barberías que ya gestionan su negocio de forma profesional.</p>
                        <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-lg transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5">
                            Comenzar prueba gratis <ArrowRight size={20} />
                        </Link>
                        <p className="text-zinc-600 text-sm mt-4">14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras</p>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
