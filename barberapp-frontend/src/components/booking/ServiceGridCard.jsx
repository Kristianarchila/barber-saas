// === ARCHIVO: components/booking/ServiceGridCard.jsx ===
import { motion } from "framer-motion";
import { Clock, Scissors, ChevronRight } from "lucide-react";

const ServiceGridCard = ({ service, onSelect }) => (
    <motion.div
        layout
        onClick={onSelect}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="group relative bg-white/70 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer"
    >
        {/* Imagen */}
        <div className="relative h-28 sm:h-40 md:h-80 bg-neutral-100 overflow-hidden">
            {service.imagen ? (
                <img src={service.imagen} alt={service.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200">
                    <Scissors size={36} className="text-black/5" />
                </div>
            )}

            {/* Precio + duración — solo visible en md+ sobre la imagen */}
            <div className="hidden md:flex absolute top-6 left-6 flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white">
                    <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 leading-none mb-1">Precio</span>
                    <span className="block text-xl font-black tracking-tighter">${service.precio}</span>
                </div>
                <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/10 w-fit">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <Clock size={12} className="text-white/50" /> {service.duracion} MIN
                    </span>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Contenido */}
        <div className="p-3 sm:p-5 md:p-10 relative">
            {/* Nombre */}
            <h3 className="text-sm sm:text-base md:text-3xl font-black uppercase tracking-tighter leading-tight mb-1 md:mb-3 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform duration-500">
                {service.nombre}
            </h3>

            {/* Precio + duración en móvil (debajo del nombre) */}
            <div className="flex items-center gap-2 md:hidden mb-2">
                <span className="text-xs font-black tracking-tight">${service.precio}</span>
                <span className="text-[9px] font-bold text-neutral-400 flex items-center gap-1">
                    <Clock size={10} /> {service.duracion}m
                </span>
            </div>

            {/* Descripción solo en md+ */}
            <p className="hidden md:block text-neutral-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed line-clamp-2 mb-0">
                {service.descripcion || "Experiencia de grooming de alta gama."}
            </p>

            {/* Footer */}
            <div className="pt-2 md:pt-8 flex items-center justify-between">
                <div className="h-px flex-1 bg-black/5 mr-3 md:mr-6 hidden sm:block" />
                <div className="flex items-center gap-1 md:gap-3 font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-500 group-hover:text-black transition-colors">
                    Reservar <ChevronRight size={12} className="group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform" />
                </div>
            </div>
        </div>
    </motion.div>
);

export default ServiceGridCard;
