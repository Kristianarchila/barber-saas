import React from 'react';
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";
import { Clock, MapPin, Scissors, Star, Sparkles, TrendingUp } from 'lucide-react';

const activities = [
  {
    nombre: "Carlos M.",
    servicio: "Corte + Barba",
    barbero: "Juan Pérez",
    tiempo: "Hace 2 min",
    icon: "✂️",
    color: "#cc2b2b",
  },
  {
    nombre: "Miguel R.",
    servicio: "Fade Degradado",
    barbero: "Pedro López",
    tiempo: "Hace 5 min",
    icon: "💈",
    color: "#1e3a8a",
  },
  {
    nombre: "José L.",
    servicio: "Arreglo de Barba",
    barbero: "Juan Pérez",
    tiempo: "Hace 8 min",
    icon: "🪒",
    color: "#059669",
  },
  {
    nombre: "David S.",
    servicio: "Corte Clásico",
    barbero: "Carlos Ruiz",
    tiempo: "Hace 12 min",
    icon: "✨",
    color: "#7c3aed",
  },
  {
    nombre: "Antonio G.",
    servicio: "Pack Premium",
    barbero: "Pedro López",
    tiempo: "Hace 15 min",
    icon: "⭐",
    color: "#f59e0b",
  },
];

// Repetir para efecto continuo
const repeatedActivities = Array.from({ length: 3 }, () => activities).flat();

const ActivityNotification = ({ nombre, servicio, barbero, tiempo, icon, color }) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[380px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[102%]",
        "bg-white border border-neutral-100 shadow-md hover:shadow-xl"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        {/* Icon circular */}
        <div
          className="flex size-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Contenido */}
        <div className="flex flex-col overflow-hidden flex-1">
          <div className="flex items-center gap-2 mb-1">
            <figcaption className="text-sm font-black text-black">
              {nombre}
            </figcaption>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-400 font-semibold">
              {tiempo}
            </span>
          </div>
          
          <p className="text-xs font-bold text-neutral-600 mb-0.5">
            {servicio}
          </p>
          
          <div className="flex items-center gap-1">
            <Scissors size={10} className="text-neutral-400" />
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
              Con {barbero}
            </p>
          </div>
        </div>

        {/* Badge de status */}
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider">
            Reservado
          </span>
        </div>
      </div>
    </figure>
  );
};

export default function LiveActivity({ className }) {
  return (
    <div className={cn("relative flex w-full flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-xs font-black text-neutral-600 uppercase tracking-widest">
            Actividad en vivo
          </p>
        </div>
        <h3 className="text-2xl font-black text-black uppercase italic">
          Reservas recientes
        </h3>
      </div>

      {/* Animated List Container */}
      <div className="relative h-[420px] overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-50 to-white p-4">
        <AnimatedList delay={2500}>
          {repeatedActivities.map((item, idx) => (
            <ActivityNotification {...item} key={idx} />
          ))}
        </AnimatedList>

        {/* Gradiente fade-out inferior */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
        
        {/* Gradiente fade-out superior */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white via-white/60 to-transparent" />
      </div>

      {/* Footer stats */}
      <div className="mt-4 flex items-center justify-center gap-6 text-center">
        <div>
          <p className="text-2xl font-black text-[#cc2b2b]">127</p>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Hoy</p>
        </div>
        <div className="w-px h-8 bg-neutral-200" />
        <div>
          <p className="text-2xl font-black text-[#1e3a8a]">1,420</p>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Este mes</p>
        </div>
      </div>
    </div>
  );
}