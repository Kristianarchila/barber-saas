import HeroCarousel from '../../../components/public/HeroCarousel'
import ServicesSection from '../../../components/public/ServicesSection'
import BarbersTeam from '../../../components/public/BarbersTeam'
import BookingCTA from '../../../components/public/BookingCTA'
import BrandedFooter from '../../../components/public/BrandedFooter'
import WhatsAppButton from '../../../components/public/WhatsAppButton'
import MobileBottomNav from '../../../components/public/MobileBottomNav'
import ReviewsSection from '../../../components/public/ReviewsSection'
import LocationSection from '../../../components/public/LocationSection'
import PremiumNavbar from '../../../components/public/PremiumNavbar'

export default function ModernTemplate({ barberia, servicios, barberos, resenas }) {
  return (
    /* CAMBIO: De bg-white a un negro azulado profundo que une todo */
    <div className="bg-[#050505] text-white min-h-screen selection:bg-[#cc2b2b] selection:text-white">

      {/* NAVBAR: Asegúrate de que tenga z-index alto */}
      <PremiumNavbar />

      {/* HERO: Efecto Parallax Reveal 
          El Hero se mantiene sticky al fondo mientras el contenido principal sube.
      */}
      <div className="sticky top-0 h-screen w-full z-0">
        <HeroCarousel />
      </div>

      {/* CONTENIDO PRINCIPAL: 
          Subre el Hero con z-index superior y fondo sólido.
      */}
      <main className="relative z-10 bg-[#050505] shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">

        {/* 2. SERVICIOS: Sección de servicios con fondo blanco */}
        <ServicesSection servicios={servicios} />

        {/* 3. NUESTROS ARTISTAS: Sección de Barberos con fondo azul/negro infinito */}
        <BarbersTeam barberos={barberos} />

        {/* 4. LO QUE DICEN NUESTROS CLIENTES: Sección de Reseñas con gradiente sutil */}
        <div className="bg-gradient-to-b from-[#060b1a] to-[#0a0a0b]">
          <ReviewsSection resenas={resenas} />
        </div>

        {/* 5. VISIT: Sección de Ubicación */}
        <div className="bg-[#0a0a0b]">
          <LocationSection barberia={barberia} />
        </div>

        {/* 6. DOMINA TU LEGADO: CTA Final antes del footer */}
        <BookingCTA />

      </main>

      {/* Footer con branding */}
      <BrandedFooter barberia={barberia} />

      {/* Elementos flotantes */}
      <MobileBottomNav />
      <WhatsAppButton phoneNumber={barberia?.telefono} />

    </div>
  )
}
