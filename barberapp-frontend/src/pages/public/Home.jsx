import { useParams, useNavigate } from "react-router-dom";
import { useBarberia } from "../../context/BarberiaContext";
import { Hero } from "../../components/home/Hero";
import { ServiceCard } from "../../components/home/ServiceCard";
import { StickyCTA } from "../../components/home/StickyCTA";
import { BarberCard } from "../../components/home/BarberCard";
import { PortfolioGallery } from "../../components/home/PortfolioGallery";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { barberia, servicios, barberos, loading } = useBarberia();

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-black min-h-screen text-white selection:bg-gold/30 scroll-smooth"
    >
      {/* 1. Cinematic Impact Section */}
      <Hero
        nombre={barberia?.nombre}
        mensaje={barberia?.configuracion?.mensajeBienvenida}
      />

      {/* 2. Services Section - Refined Spacing */}
      <section className="py-32 relative">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="px-6 mb-12 flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-gold tracking-[0.5em] text-[10px] uppercase font-black mb-4"
          >
            Nuestra Carta
          </motion.h2>
          <p className="text-4xl md:text-6xl font-serif italic tracking-tighter text-white">
            Servicios de Maestría
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 px-6 no-scrollbar pb-20 max-w-7xl mx-auto">
          {servicios && servicios.length > 0 ? (
            servicios.map((s) => (
              <ServiceCard key={s._id} servicio={s} />
            ))
          ) : (
            <div className="w-full text-center py-20 glass-premium rounded-[3rem]">
              <p className="text-gray-500 text-sm tracking-widest uppercase">Próximamente disponibles</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Team Portfolio Section */}
      <section className="py-32 bg-neutral-950/50">
        <div className="px-6 mb-16 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-gold tracking-[0.5em] text-[10px] uppercase font-black mb-4">
              El Equipo
            </h2>
            <p className="text-4xl md:text-6xl font-serif italic tracking-tighter text-white">
              Maestros del Oficio
            </p>
          </div>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed italic">
            Artistas especializados en el arte de la barbería tradicional y contemporánea.
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 no-scrollbar pb-10 max-w-7xl mx-auto">
          {barberos && barberos.length > 0 ? (
            barberos.map((b) => (
              <BarberCard key={b._id} barbero={b} />
            ))
          ) : (
            <div className="w-full text-center py-20 border border-white/5 rounded-[3rem]">
              <p className="text-gray-500 text-sm tracking-widest uppercase italic">Nuestros barberos se están preparando...</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Visual Proof Section - The Gallery */}
      <section className="py-32 bg-black">
        <div className="px-6 mb-16 flex flex-col items-center text-center">
          <h2 className="text-gold tracking-[0.5em] text-[10px] uppercase font-black mb-4">
            Galería
          </h2>
          <p className="text-4xl md:text-6xl font-serif italic tracking-tighter text-white">
            Nuestro Trabajo
          </p>
        </div>

        <PortfolioGallery />
      </section>

      {/* 5. Footer Branding */}
      <footer className="py-20 border-t border-white/5 text-center bg-black">
        <p className="text-[10px] tracking-[0.8em] text-gray-700 uppercase font-black">
          © {new Date().getFullYear()} {barberia?.nombre} • Crafted for excellence
        </p>
      </footer>

      {/* 6. Sticky Call to Action */}
      <StickyCTA onClick={() => navigate(`/${slug}/book`)} />
    </motion.div>
  );
}

const LoadingSpinner = () => (
  <div className="h-screen bg-black flex items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border border-gold/20 rounded-full" />
      <div className="absolute inset-0 w-16 h-16 border-t-2 border-gold rounded-full animate-spin" />
    </div>
  </div>
);