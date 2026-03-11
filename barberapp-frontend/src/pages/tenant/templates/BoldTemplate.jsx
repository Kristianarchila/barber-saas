import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ReviewsSection from '../../../components/public/ReviewsSection'
import LocationSection from '../../../components/public/LocationSection'
import BrandedFooter from '../../../components/public/BrandedFooter'
import WhatsAppButton from '../../../components/public/WhatsAppButton'
import MobileBottomNav from '../../../components/public/MobileBottomNav'
import MarketplaceSection from '../../../components/public/MarketplaceSection'

/**
 * BoldTemplate — Geometric, color-block layout driven by admin's primary color.
 * Aesthetic: oversized type, diagonal sections, high contrast blocks.
 * Plan: Premium only.
 */
export default function BoldTemplate({ barberia, servicios, barberos, resenas }) {
    const { slug } = useParams()
    const [activeService, setActiveService] = useState(null)

    const color = barberia?.configuracion?.colorPrincipal || '#7C3AED'
    const dark = barberia?.configuracion?.colorDark || '#0a0a0a'
    const logo = barberia?.configuracion?.logoUrl
    const nombre = barberia?.nombre || 'Barbería'

    // Darken the primary color for hover states (simple CSS trick)
    useEffect(() => {
        document.documentElement.style.setProperty('--bold-primary', color)
    }, [color])

    return (
        <div className="min-h-screen text-white" style={{ backgroundColor: dark, fontFamily: "'Inter', sans-serif" }}>

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between"
                style={{ backgroundColor: `${dark}ee`, backdropFilter: 'blur(10px)' }}>
                {logo
                    ? <img src={logo} alt={nombre} className="h-9 object-contain brightness-0 invert" />
                    : <span className="text-2xl font-black tracking-tighter text-white">{nombre}</span>
                }
                <Link to={`/${slug}/book`}
                    className="px-8 py-3 font-black text-sm uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: color }}>
                    Reservar →
                </Link>
            </nav>

            {/* HERO — diagonal split */}
            <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
                {/* Color block left */}
                <div className="absolute inset-y-0 left-0 w-1/2 hidden lg:block" style={{ backgroundColor: color }} />

                {/* Diagonal divider */}
                <div className="absolute inset-y-0 hidden lg:block" style={{
                    left: 'calc(50% - 80px)',
                    width: '160px',
                    background: `linear-gradient(to bottom right, ${color} 50%, ${dark} 50%)`
                }} />

                <div className="relative max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left — on dark bg (lg: on color bg) */}
                    <div className="lg:text-left">
                        <p className="text-xs font-black tracking-[0.5em] uppercase mb-6 opacity-60">
                            {barberia?.configuracion?.badge || 'Premium Barbershop'}
                        </p>
                        <h1 className="text-7xl lg:text-8xl font-black leading-none tracking-tighter mb-8 uppercase">
                            {(barberia?.configuracion?.heroTitle || nombre).split(' ').map((word, i) => (
                                <span key={i} className="block">{word}</span>
                            ))}
                        </h1>
                        <p className="text-lg opacity-70 mb-10 max-w-sm leading-relaxed">
                            {barberia?.configuracion?.mensajeBienvenida || 'Definimos el estilo. Tú lo llevás puesto.'}
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            <Link to={`/${slug}/book`}
                                className="px-8 py-4 font-black text-sm uppercase tracking-widest text-white transition-all hover:opacity-90"
                                style={{ backgroundColor: dark, border: `3px solid ${color}` }}>
                                {barberia?.configuracion?.ctaPrimary || 'Reservar Turno'}
                            </Link>
                            <a href="#servicios"
                                className="px-8 py-4 font-black text-sm uppercase tracking-widest border-2 border-white/30 text-white hover:border-white transition-all">
                                {barberia?.configuracion?.ctaSecondary || 'Ver Servicios'}
                            </a>
                        </div>
                    </div>

                    {/* Right — photo collage on dark section */}
                    {barberia?.configuracion?.galeria?.length > 0 && (
                        <div className="relative hidden lg:block h-[500px]">
                            {barberia.configuracion.galeria.slice(0, 3).map((img, i) => (
                                <div key={i} className="absolute rounded-2xl overflow-hidden shadow-2xl"
                                    style={{
                                        top: `${i * 15}%`,
                                        left: `${i * 8}%`,
                                        width: '75%',
                                        height: '70%',
                                        zIndex: 3 - i,
                                        transform: `rotate(${(i - 1) * 3}deg)`,
                                    }}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Noise texture overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' /%3E%3C/svg%3E")' }}
                />
            </section>

            {/* SERVICIOS — horizontal scroll cards */}
            <section id="servicios" className="py-24">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Servicios</h2>
                            <div className="h-1 mt-2" style={{ backgroundColor: color, width: '60px' }} />
                        </div>
                        <Link to={`/${slug}/book`} className="text-sm font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color }}>
                            Reservar ahora →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(servicios || []).map(s => (
                            <div key={s._id}
                                onMouseEnter={() => setActiveService(s._id)}
                                onMouseLeave={() => setActiveService(null)}
                                className="p-6 border border-white/10 transition-all cursor-default"
                                style={{
                                    backgroundColor: activeService === s._id ? color : 'transparent',
                                    transform: activeService === s._id ? 'translateY(-4px)' : 'none',
                                }}>
                                <div className="text-4xl font-black opacity-10 mb-4">{String(servicios.indexOf(s) + 1).padStart(2, '0')}</div>
                                <h3 className="font-black text-xl mb-2">{s.nombre}</h3>
                                {s.descripcion && <p className="text-sm opacity-60 mb-4 leading-relaxed">{s.descripcion}</p>}
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-black text-2xl">${s.precio?.toLocaleString()}</span>
                                    <span className="text-xs opacity-40">{s.duracion}m</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BARBEROS — full-width horizontal strip */}
            {(barberos || []).length > 0 && (
                <section className="py-24" style={{ backgroundColor: color }}>
                    <div className="max-w-7xl mx-auto px-8">
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-12 text-black">El Equipo</h2>
                        <div className="flex gap-6 overflow-x-auto pb-4">
                            {barberos.map(b => (
                                <div key={b._id} className="flex-shrink-0 text-center group">
                                    <div className="w-36 h-36 overflow-hidden mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all"
                                        style={{ backgroundColor: dark }}>
                                        {b.fotoPerfil
                                            ? <img src={b.fotoPerfil} alt={b.nombre} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-4xl text-white">✂️</div>
                                        }
                                    </div>
                                    <p className="font-black text-black text-sm uppercase tracking-widest">{b.nombre}</p>
                                    {b.especialidad && <p className="text-black/60 text-xs">{b.especialidad}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TIENDA: productos destacados, solo si tienda activa */}
            <MarketplaceSection colorPrimary={color} />

            {/* BOOKING CTA */}
            <section className="py-32 text-center" style={{ backgroundColor: dark }}>
                <p className="text-xs font-black tracking-[0.5em] uppercase mb-6 opacity-40">— Agendá online —</p>
                <h2 className="text-7xl font-black uppercase tracking-tighter mb-10 leading-none">
                    Tu estilo.<br />Tu turno.
                </h2>
                <Link to={`/${slug}/book`}
                    className="inline-block px-12 py-5 font-black text-lg uppercase tracking-widest text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: color }}>
                    Reservar Ahora
                </Link>
            </section>

            {/* RESEÑAS & UBICACIÓN */}
            {barberia?.configuracion?.configuracionResenas?.mostrarEnWeb !== false && (
                <ReviewsSection resenas={resenas} />
            )}
            <LocationSection barberia={barberia} />
            <BrandedFooter barberia={barberia} />
            <MobileBottomNav />
            <WhatsAppButton phoneNumber={barberia?.telefono} />
        </div>
    )
}
