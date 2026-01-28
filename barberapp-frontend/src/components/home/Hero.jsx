import { motion } from "framer-motion";

export const Hero = ({ nombre, mensaje }) => {
  return (
    <section className="relative h-[85dvh] w-full flex items-center justify-center px-6 overflow-hidden bg-black">
      {/* Background Cinematic Image with Subtle Zoom Animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />

      {/* Dynamic Overlays for Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/40 z-10" />

      {/* Hero Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block text-gold tracking-[0.6em] text-[10px] md:text-xs uppercase font-black mb-6 drop-shadow-lg">
            Establecimiento de Lujo
          </span>

          <h1 className="text-6xl md:text-9xl font-serif italic text-white leading-none tracking-tighter mb-8 filter drop-shadow-2xl">
            {nombre || "La Barbería"}
          </h1>

          <div className="w-24 h-[1px] bg-gold/50 mx-auto mb-8" />

          <p className="text-gray-300 text-sm md:text-lg max-w-lg mx-auto leading-relaxed font-light tracking-wide italic">
            "{mensaje || "Cortes clásicos y modernos con un toque de distinción y maestría."}"
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};