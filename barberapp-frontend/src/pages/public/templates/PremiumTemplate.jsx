import HeroPremium from '../../../components/public/HeroPremium'
import BarbersTeam from '../../../components/public/BarbersTeam'
import BookingCTA from '../../../components/public/BookingCTA'
import BrandedFooter from '../../../components/public/BrandedFooter'
import WhatsAppButton from '../../../components/public/WhatsAppButton'
import MobileBottomNav from '../../../components/public/MobileBottomNav'
import ReviewsSection from '../../../components/public/ReviewsSection'
import LocationSection from '../../../components/public/LocationSection'

export default function PremiumTemplate({ barberia, servicios, barberos, resenas }) {
    return (
        <div className="bg-[#050505] text-white min-h-screen selection:bg-[var(--color-primary)] selection:text-white">

            {/* HeroPremium ya incluye su propia Navbar integrada para el diseño de impacto */}
            <HeroPremium />

            <main className="relative">

                {/* Sección de Barberos: Fondo azul/negro infinito */}
                <BarbersTeam barberos={barberos} />

                {/* Sección de Reseñas */}
                {barberia?.configuracion?.configuracionResenas?.mostrarEnWeb !== false && (
                    <div className="bg-gradient-to-b from-[#060b1a] to-[#0a0a0b]">
                        <ReviewsSection resenas={resenas} />
                    </div>
                )}

                {/* Sección de Ubicación */}
                <div className="bg-[#0a0a0b]">
                    <LocationSection barberia={barberia} />
                </div>

                {/* CTA Final */}
                <BookingCTA />

            </main>

            {/* Footer */}
            <BrandedFooter barberia={barberia} />

            {/* Elementos flotantes */}
            <MobileBottomNav />
            <WhatsAppButton phoneNumber={barberia?.telefono} />

        </div>
    )
}
