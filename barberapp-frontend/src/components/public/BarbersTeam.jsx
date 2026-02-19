import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Instagram } from 'lucide-react';
import { cn } from "@/lib/utils";
import Marquee from "@/components/magicui/marquee";

// --- TARJETA DE RESEÑA ---
const ReviewCard = memo(({ img, name, body }) => (
  <figure className={cn(
    "relative w-72 cursor-pointer overflow-hidden rounded-2xl border p-5",
    "border-neutral-200/50 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  )}>
    <div className="absolute top-3 right-3 text-[var(--color-primary)]/10">
      <Quote size={36} fill="currentColor" />
    </div>
    <div className="flex flex-row items-center gap-3 mb-3 relative z-10">
      <img className="rounded-full border-2 border-neutral-100" width="44" height="44" src={img} alt={name} loading="lazy" />
      <div className="flex flex-col text-left">
        <figcaption className="text-sm font-black text-black">{name}</figcaption>
        <div className="flex gap-0.5 text-yellow-500 mt-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" strokeWidth={0} />)}
        </div>
      </div>
    </div>
    <blockquote className="text-sm text-neutral-600 leading-relaxed text-left relative z-10">"{body}"</blockquote>
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

// --- TARJETA DE BARBERO ---
const BarberCard = memo(({ barbero, index }) => {
  const delay = index * 0.1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-500"
    >
      {/* Foto */}
      <div className="relative h-64 sm:h-72 bg-neutral-100 overflow-hidden">
        {barbero.foto ? (
          <img
            src={barbero.foto}
            alt={barbero.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <span className="text-6xl font-black text-black/10">{barbero.nombre?.[0]}</span>
          </div>
        )}
        {/* Overlay gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Instagram badge */}
        {barbero.instagram && (
          <a
            href={`https://instagram.com/${barbero.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <Instagram size={16} className="text-neutral-800" />
          </a>
        )}

        {/* Nombre sobre la foto */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white font-black uppercase tracking-tighter text-xl leading-none mb-1">
            {barbero.nombre}
          </h3>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
            {barbero.especialidad || 'Master Barber'}
          </p>
        </div>
      </div>

      {/* Barra de color inferior del tema */}
      <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
    </motion.div>
  );
});
BarberCard.displayName = 'BarberCard';

export default function BarbersTeam({ barberos = [] }) {
  if (!barberos || barberos.length === 0) return null;

  return (
    <section id="equipo" className="relative py-24 bg-[#f1f1f2] overflow-hidden border-t border-black/5">
      <div id="barberos" className="absolute -top-20" />

      {/* Fondo decorativo sutil */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)]/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-primary)]/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">

        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-5"
          >
            <div className="h-0.5 w-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]" />
            <p className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.4em]">
              El Equipo
            </p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-[900] text-[#0a0a0b] tracking-tighter uppercase italic leading-[0.85]"
          >
            NUESTROS{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
              ARTISTAS
            </span>
          </motion.h2>
        </div>

        {/* Grid de barberos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-24">
          {barberos.map((barbero, index) => (
            <BarberCard key={barbero._id || index} barbero={barbero} index={index} />
          ))}
        </div>

        {/* --- SECCIÓN DE RESEÑAS --- */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-0.5 w-10 bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
              <p className="text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.4em]">Testimonios</p>
              <div className="h-0.5 w-10 bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-[#0a0a0b] tracking-tight uppercase italic">
              Lo que dicen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                nuestros clientes
              </span>
            </h3>
          </motion.div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#f1f1f2] to-transparent z-10 pointer-events-none" />
            <Marquee pauseOnHover className="[--duration:60s] py-3">
              {reviews.map((rev, i) => <ReviewCard key={`review-${i}`} {...rev} />)}
            </Marquee>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#f1f1f2] to-transparent z-10 pointer-events-none" />
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 flex flex-wrap justify-center gap-8 md:gap-12"
          >
            <div className="text-center">
              <p className="text-4xl font-black text-[var(--color-primary)] mb-1">4.9</p>
              <div className="flex gap-1 justify-center mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" className="text-yellow-400" strokeWidth={0} />)}
              </div>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Calificación</p>
            </div>
            <div className="w-px h-16 bg-neutral-300 self-center" />
            <div className="text-center">
              <p className="text-4xl font-black text-[var(--color-accent)] mb-1">2,500+</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Clientes</p>
            </div>
            <div className="w-px h-16 bg-neutral-300 self-center" />
            <div className="text-center">
              <p className="text-4xl font-black text-[#059669] mb-1">98%</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Recomendación</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}