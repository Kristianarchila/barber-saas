import { motion } from "framer-motion";

export const StickyCTA = ({ onClick }) => {
  return (
    <div className="fixed bottom-10 left-0 right-0 px-8 z-50 pointer-events-none flex justify-center">
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="pointer-events-auto max-w-md w-full h-20 text-gold-soft bg-black border border-gold/30 rounded-full font-black uppercase tracking-[0.4em] text-[10px] shadow-gold-soft flex items-center justify-center gap-4 group overflow-hidden relative"
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <span className="relative z-10 text-gold">Reservar Experiencia</span>
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative z-10 text-gold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </motion.div>
      </motion.button>
    </div>
  );
};