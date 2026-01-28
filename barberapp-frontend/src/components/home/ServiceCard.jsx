import { motion } from "framer-motion";

export const ServiceCard = ({ servicio }) => {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      className="min-w-[300px] snap-center glass-premium p-10 rounded-[3rem] relative overflow-hidden group border-white/5"
    >
      {/* Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-[9px] tracking-[0.5em] text-gold uppercase font-black px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
              Exclusive
            </span>
            <span className="text-xl opacity-80 filter grayscale group-hover:grayscale-0 transition-all duration-300">✂️</span>
          </div>

          <h3 className="text-3xl font-serif italic text-white leading-tight mb-2 tracking-tighter">
            {servicio.nombre}
          </h3>

          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-medium">
            Personalizado • {servicio.duracion} MIN
          </p>
        </div>

        <div className="mt-8 flex justify-between items-end border-t border-white/5 pt-6">
          <div className="flex flex-col">
            <span className="text-gray-500 text-[9px] uppercase tracking-widest mb-1">Inversión</span>
            <span className="text-4xl font-serif text-white flex items-start">
              <span className="text-sm mt-1 mr-1 text-gold">$</span>
              {servicio.precio}
            </span>
          </div>

          <motion.div
            whileHover={{ rotate: 90 }}
            className="h-12 w-12 rounded-full border border-gold/30 flex items-center justify-center text-gold bg-gold/5 group-hover:bg-gold group-hover:text-black transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};