import { motion } from "framer-motion";

export const BarberCard = ({ barbero }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="min-w-[260px] snap-center group relative h-[400px] rounded-[2rem] overflow-hidden"
        >
            {/* Photo with Overlay */}
            <img
                src={barbero.foto || '/barber-placeholder.jpg'}
                alt={barbero.nombre}
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

            {/* Info Container */}
            <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-gold text-[9px] tracking-[0.4em] uppercase font-black mb-2 block">
                    {barbero.especialidades?.[0] || 'Master Barber'}
                </span>

                <h3 className="text-3xl font-serif italic text-white mb-2 leading-none">
                    {barbero.nombre}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                    <div className="h-[1px] w-8 bg-gold/50" />
                    <span className="text-gray-400 text-[10px] uppercase tracking-widest">
                        {barbero.experiencia || 5}+ Años de Maestría
                    </span>
                </div>

                <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                    {barbero.descripcion || 'Especialista en cortes clásicos y acabados de alta precisión.'}
                </p>
            </div>
        </motion.div>
    );
};
