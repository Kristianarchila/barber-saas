import { Link, useParams } from 'react-router-dom'
import ReviewsSection from '../../../components/public/ReviewsSection'
import LocationSection from '../../../components/public/LocationSection'
import BrandedFooter from '../../../components/public/BrandedFooter'
import WhatsAppButton from '../../../components/public/WhatsAppButton'
import MobileBottomNav from '../../../components/public/MobileBottomNav'
import MarketplaceSection from '../../../components/public/MarketplaceSection'

/**
 * VintageTemplate — Classic 1950s barbershop aesthetic
 * Colors: warm cream/sepia tones, dark brown accents, red stripe detail
 * Fonts: Playfair Display headings, warm body text
 */
export default function VintageTemplate({ barberia, servicios, barberos, resenas }) {
    const { slug } = useParams()

    const primaryColor = barberia?.configuracion?.colorPrincipal || '#8B0000'
    const logo = barberia?.configuracion?.logoUrl
    const nombre = barberia?.nombre || 'Barbería'

    return (
        <div className="min-h-screen text-[#2c1810]" style={{ backgroundColor: '#f5f0e8', fontFamily: "'Georgia', serif" }}>

            {/* Stripe decorativa */}
            <div className="h-2 w-full" style={{
                background: `repeating-linear-gradient(90deg, ${primaryColor} 0px, ${primaryColor} 20px, #f5f0e8 20px, #f5f0e8 40px)`
            }} />

            {/* NAVBAR */}
            <nav style={{ backgroundColor: '#2c1810' }} className="py-5">
                <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
                    {logo
                        ? <img src={logo} alt={nombre} className="h-10 object-contain brightness-0 invert" />
                        : (
                            <div className="text-center">
                                <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase">— Est. {barberia?.configuracion?.yearEstablished || '2024'} —</p>
                                <h1 className="text-2xl font-bold text-white tracking-wide">{nombre}</h1>
                            </div>
                        )
                    }
                    <Link to={`/${slug}/book`}
                        className="px-6 py-2.5 border-2 text-white font-bold text-sm tracking-widest uppercase hover:text-[#2c1810] transition-all"
                        style={{ borderColor: '#c9a96e', color: '#c9a96e', ':hover': { backgroundColor: '#c9a96e' } }}>
                        Reservar
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative overflow-hidden py-24">
                {/* Background image con overlay sepia */}
                {barberia?.configuracion?.galeria?.[0] && (
                    <div className="absolute inset-0">
                        <img src={barberia.configuracion.galeria[0]} alt="" className="w-full h-full object-cover" style={{ filter: 'sepia(60%) brightness(0.4)' }} />
                    </div>
                )}
                {!barberia?.configuracion?.galeria?.[0] && (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2c1810 0%, #4a2f1a 100%)' }} />
                )}

                <div className="relative max-w-4xl mx-auto px-6 text-center text-white z-10">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-16" style={{ backgroundColor: '#c9a96e' }} />
                        <p className="text-xs tracking-[0.4em] uppercase" style={{ color: '#c9a96e' }}>
                            {barberia?.configuracion?.badge || 'Tradición & Estilo'}
                        </p>
                        <div className="h-px w-16" style={{ backgroundColor: '#c9a96e' }} />
                    </div>

                    <h2 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {barberia?.configuracion?.heroTitle || 'El Arte del Barbero'}
                    </h2>
                    <p className="text-lg mb-10 opacity-80 max-w-xl mx-auto leading-relaxed">
                        {barberia?.configuracion?.mensajeBienvenida || 'Tradición, precisión y estilo. Llevamos décadas perfeccionando el arte de la barbería.'}
                    </p>

                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link to={`/${slug}/book`}
                            className="px-8 py-4 font-bold tracking-widest uppercase text-[#2c1810] transition-all hover:opacity-90"
                            style={{ backgroundColor: '#c9a96e' }}>
                            {barberia?.configuracion?.ctaPrimary || 'Reservar Turno'}
                        </Link>
                        <a href="#servicios"
                            className="px-8 py-4 border-2 font-bold tracking-widest uppercase text-white hover:bg-white/10 transition-all"
                            style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
                            {barberia?.configuracion?.ctaSecondary || 'Ver Servicios'}
                        </a>
                    </div>
                </div>
            </section>

            {/* Divider ornamental */}
            <div className="flex items-center justify-center py-8" style={{ backgroundColor: '#ede8dc' }}>
                <div className="h-px w-24" style={{ backgroundColor: '#c9a96e' }} />
                <span className="mx-4 text-2xl" style={{ color: '#c9a96e' }}>✦</span>
                <div className="h-px w-24" style={{ backgroundColor: '#c9a96e' }} />
            </div>

            {/* SERVICIOS */}
            <section id="servicios" className="py-20" style={{ backgroundColor: '#ede8dc' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold mb-3">Nuestros Servicios</h2>
                        <p style={{ color: '#7a5c42' }}>El arte de verse impecable</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(servicios || []).map(s => (
                            <div key={s._id} className="p-6 border flex items-center gap-5 hover:shadow-md transition-shadow"
                                style={{ borderColor: '#c9a96e', backgroundColor: '#f5f0e8' }}>
                                <div className="text-3xl flex-shrink-0" style={{ color: primaryColor }}>✦</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-lg">{s.nombre}</h3>
                                        <span className="font-black text-lg" style={{ color: primaryColor }}>${s.precio?.toLocaleString()}</span>
                                    </div>
                                    {s.descripcion && <p className="text-sm leading-relaxed" style={{ color: '#7a5c42' }}>{s.descripcion}</p>}
                                    <p className="text-xs mt-2" style={{ color: '#9a7c5a' }}>{s.duracion} minutos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BARBEROS */}
            {(barberos || []).length > 0 && (
                <section className="py-20 text-white" style={{ backgroundColor: '#2c1810' }}>
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold mb-3" style={{ color: '#c9a96e' }}>Los Maestros</h2>
                        <p className="mb-14 opacity-60">Tradición en manos expertas</p>
                        <div className="flex flex-wrap justify-center gap-10">
                            {barberos.map(b => (
                                <div key={b._id} className="text-center">
                                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4"
                                        style={{ ringColor: '#c9a96e', borderColor: '#c9a96e', border: '4px solid #c9a96e' }}>
                                        {b.fotoPerfil
                                            ? <img src={b.fotoPerfil} alt={b.nombre} className="w-full h-full object-cover" style={{ filter: 'sepia(20%)' }} />
                                            : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: '#4a2f1a' }}>✂️</div>
                                        }
                                    </div>
                                    <p className="font-bold text-lg" style={{ color: '#c9a96e' }}>{b.nombre}</p>
                                    {b.especialidad && <p className="text-sm opacity-60">{b.especialidad}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TIENDA: productos destacados, solo si tienda activa */}
            <MarketplaceSection colorPrimary={primaryColor} />

            {/* BOOKING CTA */}
            <section className="py-20 text-center" style={{ backgroundColor: primaryColor }}>
                <h2 className="text-4xl font-bold text-white mb-4">Agendá tu Turno</h2>
                <p className="text-white/70 mb-8">Sin esperas. Con estilo.</p>
                <Link to={`/${slug}/book`}
                    className="px-10 py-4 font-bold text-xl uppercase tracking-wider text-[#2c1810] hover:opacity-90 transition-all inline-block"
                    style={{ backgroundColor: '#c9a96e' }}>
                    Reservar Ahora ✦
                </Link>
            </section>

            {/* RESEÑAS */}
            {barberia?.configuracion?.configuracionResenas?.mostrarEnWeb !== false && (
                <ReviewsSection resenas={resenas} />
            )}

            <LocationSection barberia={barberia} />
            <BrandedFooter barberia={barberia} />
            <MobileBottomNav />
            <WhatsAppButton phoneNumber={barberia?.telefono} />

            {/* Stripe inferior */}
            <div className="h-2 w-full" style={{
                background: `repeating-linear-gradient(90deg, ${primaryColor} 0px, ${primaryColor} 20px, #f5f0e8 20px, #f5f0e8 40px)`
            }} />
        </div>
    )
}
