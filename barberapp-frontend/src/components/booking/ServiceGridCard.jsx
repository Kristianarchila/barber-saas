// === ARCHIVO: components/booking/ServiceGridCard.jsx ===
import { motion } from "framer-motion";
import { Clock, Scissors, ChevronRight } from "lucide-react";

const ServiceGridCard = ({ service, onSelect }) => (
    <motion.div
        layout
        onClick={onSelect}
        whileHover={{ y: -10, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative bg-white/70 backdrop-blur-sm rounded-[2.5rem] overflow-hidden border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer"
    >
        <div className="relative h-56 md:h-80 bg-neutral-100 overflow-hidden">
            {service.imagen ? (
                <img src={service.imagen} alt={service.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200">
                    <Scissors size={48} className="text-black/5" />
                </div>
            )}

            <div className="absolute top-6 left-6 flex flex-col gap-2">
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

            <div className="absolute top-6 right-6">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        <div className="p-8 md:p-10 relative">
            <div className="flex justify-between items-start mb-4">
                <div className="max-w-[80%]">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-[0.9] mb-3 group-hover:translate-x-2 transition-transform duration-500">{service.nombre}</h3>
                    <p className="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-wider leading-relaxed line-clamp-2">{service.descripcion || "Experiencia de grooming de alta gama diseñada para el caballero moderno."}</p>
                </div>
            </div>

            <div className="pt-8 flex items-center justify-between">
                <div className="h-px flex-1 bg-black/5 mr-6"></div>
                <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.3em] group-hover:text-black transition-colors">
                    RESERVAR <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
            </div>
        </div>

        <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent group-hover:border-white/10 transition-all duration-700 rounded-[2.5rem]"></div>
    </motion.div>
);

export default ServiceGridCard;
