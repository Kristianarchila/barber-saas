import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import { useBarberia } from '../../context/BarberiaContext';
import { useNavigate } from 'react-router-dom';

// Estilos globales para tipografía
const GlobalFonts = () => (
  <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        .hero-carousel {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga' 1, 'calt' 1;
        }
    `}</style>
);

// --- COMPONENTE HERO (FONDO NEGRO PARALLAX) ---
export default function HeroClassic() {
  const theme = useBarberiaTheme();
  const { slug } = useBarberia();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [index, setIndex] = useState(0);

  const images = theme.heroImages || [];

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 6000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yImage = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "25%"]), { stiffness: 100, damping: 30 });
  const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  return (
    <>
      <GlobalFonts />
      <main ref={containerRef} className="bg-[#0a0a0b] relative hero-carousel">

        {/* CAPA PARALLAX STICKY */}
        <section className="sticky top-0 h-screen w-full overflow-hidden z-0 bg-white/5">
          <motion.div style={{ y: yImage }} className="absolute inset-0">
            {images.length > 0 ? (
              images.map((img, i) => (
                <motion.img
                  key={i}
                  src={img}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: i === index ? 0.4 : 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 w-full h-full object-cover grayscale brightness-75"
                />
              ))
            ) : (
              <div className="absolute inset-0 bg-neutral-900" />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/20" />
          </motion.div>

          {/* Contenido Hero */}
          <motion.div
            style={{ opacity: opacityHero, scale: scaleHero }}
            className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="h-[1px] w-8 bg-white/20" />
              <span className="text-white text-[9px] font-black tracking-[.6em] uppercase">
                Est. {new Date().getFullYear()}
              </span>
              <div className="h-[1px] w-8 bg-white/20" />
            </motion.div>

            <h1 className="text-[14vw] md:text-[11rem] font-black text-white uppercase leading-[0.75] tracking-tighter mb-14">
              {theme.heroTitle || theme.nombre || "GENTLEMAN"} <br />
              <span className="text-transparent italic" style={{ WebkitTextStroke: '1.5px #FFFFFF' }}>
                Premium
              </span>
            </h1>

            <div className="flex flex-col md:flex-row justify-center gap-4 w-full max-w-md px-10">
              <button
                onClick={() => navigate(`/${slug}/book`)}
                className="px-12 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-neutral-200 transition-all shadow-2xl"
              >
                Agendar Cita
              </button>
              <button
                onClick={() => document.getElementById('servicios').scrollIntoView({ behavior: 'smooth' })}
                className="px-12 py-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-md hover:bg-white hover:text-black transition-all"
              >
                Servicios
              </button>
            </div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-12 flex flex-col items-center gap-3"
            >
              <span className="text-[8px] text-white/20 font-black tracking-[0.4em] uppercase">Explorar</span>
              <div className="w-[1px] h-10 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
          </motion.div>
        </section>

      </main>
    </>
  );
}
