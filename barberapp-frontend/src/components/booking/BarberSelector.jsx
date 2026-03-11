// === ARCHIVO: components/booking/BarberSelector.jsx ===
import { motion } from "framer-motion";
import { User } from "lucide-react";

// BarberCard: item individual de barbero con aura animada al seleccionarse
const BarberCard = ({ barber, isSelected, onSelect }) => (
    <motion.div
        onClick={onSelect}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-8 md:p-12 rounded-[3.5rem] border-2 transition-all duration-700 cursor-pointer text-center group ${
            isSelected
                ? "border-black bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]"
                : "border-black/5 bg-white/40 backdrop-blur-sm hover:border-black/20 hover:bg-white"
        }`}
    >
        {isSelected && (
            <motion.div
                layoutId="aura"
                className="absolute inset-0 rounded-[3.5rem] bg-black/5 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            />
        )}

        <div className="relative z-10">
            <div className={`w-28 h-28 md:w-40 md:h-40 mx-auto mb-8 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 transform ${
                isSelected ? "scale-110 -rotate-3 ring-4 ring-black/5" : "group-hover:rotate-2"
            }`}>
                {barber.foto ? (
                    <img src={barber.foto} className="w-full h-full object-cover" alt={barber.nombre} />
                ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <User className="text-black/10" size={48} />
                    </div>
                )}
            </div>

            <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-2">Senior Barber</span>
            <h3 className="font-black uppercase tracking-tighter text-xl md:text-2xl mb-4 leading-none">{barber.nombre}</h3>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                isSelected ? "bg-black text-white" : "bg-black/5 text-black/40 group-hover:bg-black/10"
            }`}>
                {isSelected ? "Seleccionado" : "Ver Agenda"}
            </div>
        </div>

        <div className={`absolute top-8 right-8 w-2 h-2 rounded-full transition-all duration-700 ${isSelected ? "bg-black scale-150" : "bg-black/10"}`}></div>
    </motion.div>
);

/**
 * BarberSelector
 * Props:
 *   barberos: array de barberos
 *   selectedBarberoId: string (id del seleccionado o 'any')
 *   onSelect: fn(barberoId: string)
 */
const BarberSelector = ({ barberos, selectedBarberoId, onSelect }) => (
    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
        {/* Opción "Cualquiera" (Smart Match) */}
        <button
            onClick={() => onSelect("any")}
            className={`flex-shrink-0 w-32 md:w-40 p-6 rounded-[2rem] border-2 transition-all text-center ${
                selectedBarberoId === "any" ? "border-black bg-white shadow-lg" : "border-black/5 bg-white/40 hover:border-black/20"
            }`}
        >
            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-2xl flex items-center justify-center">
                <User size={24} />
            </div>
            <span className="block font-black uppercase text-[10px] tracking-tight">Cualquiera</span>
        </button>

        {barberos.map((b) => (
            <button
                key={b._id}
                onClick={() => onSelect(b._id)}
                className={`flex-shrink-0 w-32 md:w-40 p-6 rounded-[2rem] border-2 transition-all text-center ${
                    selectedBarberoId === b._id ? "border-black bg-white shadow-lg" : "border-black/5 bg-white/40 hover:border-black/20"
                }`}
            >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden border border-black/5">
                    <img
                        src={b.foto || "https://res.cloudinary.com/diz8m6fxi/image/upload/v1710926715/ux-placeholder-barber.png"}
                        className="w-full h-full object-cover"
                        alt={b.nombre}
                    />
                </div>
                <span className="block font-black uppercase text-[10px] tracking-tight truncate">{b.nombre}</span>
            </button>
        ))}
    </div>
);

export { BarberCard };
export default BarberSelector;
