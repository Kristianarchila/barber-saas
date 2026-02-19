import React, { useMemo, memo } from 'react';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import ChromaGrid from '../../components/ChromaGrid';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { cn } from "@/lib/utils";
import Marquee from "@/components/magicui/marquee";

// --- TARJETA DE RESEÑA MEJORADA --- (Memoizada)
const ReviewCard = memo(({ img, name, body }) => (
  <figure className={cn(
    "relative w-80 cursor-pointer overflow-hidden rounded-2xl border p-5",
    "border-neutral-200/50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
  )}>
    {/* Quote icon decorativo */}
    <div className="absolute top-3 right-3 text-[var(--color-primary)]/10">
      <Quote size={40} fill="currentColor" />
    </div>

    <div className="flex flex-row items-center gap-3 mb-4 relative z-10">
      <div className="relative">
        <img
          className="rounded-full border-2 border-neutral-100 shadow-md"
          width="48"
          height="48"
          src={img}
          alt={name}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
      </div>

      <div className="flex flex-col text-left">
        <figcaption className="text-sm font-black text-black">
          {name}
        </figcaption>
        <div className="flex gap-0.5 text-yellow-500 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
      </div>
    </div>

    <blockquote className="text-sm text-neutral-700 leading-relaxed text-left relative z-10">
      "{body}"
    </blockquote>

    {/* Borde decorativo inferior */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] opacity-50" />
  </figure>
));

ReviewCard.displayName = 'ReviewCard';

const reviews = [
  { name: "Carlos T.", body: "La mejor degradación que me han hecho en años. Atención premium y ambiente increíble.", img: "https://avatar.vercel.sh/1" },
  { name: "Miguel R.", body: "El ambiente es increíble y los barberos son unos verdaderos artistas del corte.", img: "https://avatar.vercel.sh/2" },
  { name: "Juan P.", body: "Agendar por la web fue super fácil. Puntualidad de 10 y excelente servicio.", img: "https://avatar.vercel.sh/3" },
  { name: "Andrés L.", body: "Servicio de barba con toalla caliente, una experiencia que todos deberían vivir.", img: "https://avatar.vercel.sh/4" },
  { name: "Pedro M.", body: "Profesionalismo de primer nivel. Siempre salgo renovado y con un look impecable.", img: "https://avatar.vercel.sh/5" },
  { name: "Diego S.", body: "El mejor fade de la ciudad. Precio justo y calidad excepcional. 100% recomendado.", img: "https://avatar.vercel.sh/6" },
];

export default function BarbersTeam({ barberos = [] }) {
  const theme = useBarberiaTheme();

  const BARBER_RED = "var(--color-primary)";
  const BARBER_BLUE = "var(--color-accent)";

  // Memoizar la transformación de barberos para evitar recalcular en cada render
  // MUST be called before any conditional returns to follow Rules of Hooks
  const barbersForGrid = useMemo(() => barberos.map((barbero, index) => {
    const isEven = index % 2 === 0;
    const activeColor = isEven ? BARBER_RED : BARBER_BLUE;

    return {
      image: barbero.foto,
      title: barbero.nombre,
      subtitle: barbero.especialidad || 'Master Barber',
      handle: barbero.instagram ? `@${barbero.instagram.replace('@', '')}` : '',
      borderColor: activeColor,
      gradient: `linear-gradient(180deg, ${activeColor}00 0%, ${activeColor}40 100%)`,
      url: barbero.instagram ? `https://instagram.com/${barbero.instagram.replace('@', '')}` : '#'
    };
  }), [barberos]);

  // Early return AFTER all hooks
  if (!barberos || barberos.length === 0) return null;

  return (
    <section id="equipo" className="relative py-32 bg-[#f1f1f2] overflow-hidden border-t border-black/5">
      {/* Anchor alternativo para sidebar que usa 'barberos' */}
      <div id="barberos" className="absolute -top-20" />

      {/* --- DECORACIÓN DE FONDO MEJORADA --- */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[var(--color-accent)]/10 blur-[140px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-[var(--color-primary)]/10 blur-[140px] rounded-full pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply" />

      {/* --- CONTENIDO --- */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header mejorado */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
            <p className="text-[var(--color-accent)] text-xs font-black uppercase tracking-[0.4em]">
              The Master Team
            </p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-8xl font-[900] text-[#0a0a0b] tracking-tighter uppercase italic leading-[0.8]"
          >
            NUESTROS{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" style={{ WebkitTextStroke: '1px var(--color-primary)' }}>
              ARTISTAS
            </span>
          </motion.h2>
        </div>

        {/* ChromaGrid con mejor animación */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden bg-[#0a0a0b] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] mb-32"
          style={{ minHeight: '700px' }}
        >
          <ChromaGrid
            items={barbersForGrid}
            radius={400}
            damping={0.2}
            fadeOut={0.9}
            ease="power4.out"
          />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.5)_100%)]" />
        </motion.div>

        {/* --- SECCIÓN DE RESEÑAS MEJORADA --- */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
              <p className="text-[var(--color-primary)] text-xs font-black uppercase tracking-[0.4em]">
                Testimonios
              </p>
              <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
            </div>
            <h3 className="text-4xl md:text-7xl font-black text-[#0a0a0b] tracking-tight uppercase italic leading-tight">
              Lo que dicen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                nuestros clientes
              </span>
            </h3>
          </motion.div>

          {/* Marquee con efecto de fade mejorado */}
          <div className="relative">
            {/* Fade left */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f1f1f2] to-transparent z-10 pointer-events-none" />

            {/* Marquee */}
            <Marquee pauseOnHover className="[--duration:60s] py-4">
              {reviews.map((rev, i) => <ReviewCard key={`review-${i}`} {...rev} />)}
            </Marquee>

            {/* Fade right */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f1f1f2] to-transparent z-10 pointer-events-none" />
          </div>

          {/* Stats decorativos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap justify-center gap-12"
          >
            <div className="text-center">
              <p className="text-5xl font-black text-[var(--color-primary)] mb-2">4.9</p>
              <div className="flex gap-1 justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" className="text-yellow-400" strokeWidth={0} />
                ))}
              </div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Calificación promedio
              </p>
            </div>

            <div className="w-px h-20 bg-neutral-300" />

            <div className="text-center">
              <p className="text-5xl font-black text-[var(--color-accent)] mb-2">2,500+</p>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Clientes satisfechos
              </p>
            </div>

            <div className="w-px h-20 bg-neutral-300" />

            <div className="text-center">
              <p className="text-5xl font-black text-[#059669] mb-2">98%</p>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Recomendación
              </p>
            </div>
          </motion.div>
        </div>

        {/* Indicador inferior mejorado */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <p className="text-xs text-neutral-400 font-black uppercase tracking-[0.5em]">
            Experience the craft
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-40 rounded-full" />
        </div>
      </div>

      <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.15; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
            `}</style>
    </section>
  );
}