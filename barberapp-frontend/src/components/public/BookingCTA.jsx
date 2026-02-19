import { useNavigate, useParams } from 'react-router-dom';
import { useBarberiaTheme } from '../../context/BarberiaThemeContext';
import { Calendar, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

// Estilos globales para tipografía
const GlobalFonts = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        .booking-cta {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga' 1, 'calt' 1;
        }
    `}</style>
);

export default function BookingCTA() {
    const theme = useBarberiaTheme();
    const navigate = useNavigate();
    const { slug } = useParams();

    // Use images from barberia's gallery (uploaded by owner)
    const images = theme.heroImages || [];

    return (
        <>
            <GlobalFonts />
            <section className="py-24 bg-white overflow-hidden booking-cta">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-[#0a0a0b] shadow-2xl">

                        {/* Collage con overlay más sutil - Solo si hay imágenes */}
                        {images.length > 0 && (
                            <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 opacity-30 grayscale group">
                                {images.slice(0, 4).map((img, i) => (
                                    <div key={i} className="relative h-full w-full overflow-hidden border-r border-white/5">
                                        <img src={img} className="h-full w-full object-cover" alt="Barbería" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Gradiente refinado: El rojo solo como acento central */}
                        <div
                            className="absolute inset-0"
                            style={{ background: `radial-gradient(circle at center, rgba(204, 43, 43, 0.15) 0%, #0a0a0b 80%)` }}
                        />

                        {/* Contenido Principal */}
                        <div className="relative z-10 p-12 md:p-32 text-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium uppercase tracking-[0.2em] mb-10"
                            >
                                <Calendar size={14} className="text-[#cc2b2b]" />
                                Disponibilidad Limitada
                            </motion.div>

                            <h2 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tighter leading-[0.9]">
                                DOMINA TU <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
                                    LEGADO
                                </span>
                            </h2>

                            <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                                Eleva tu estilo a un nivel superior. La excelencia no espera, <span className="text-white">tu espacio es hoy.</span>
                            </p>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={() => navigate(`/${slug}/book`)}
                                    className="group relative px-10 py-5 bg-[#cc2b2b] text-white font-bold text-sm uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
                                >
                                    <span className="relative z-10">Agendar Turno Ahora</span>
                                    <Scissors size={18} className="relative z-10 group-hover:rotate-12 transition-transform" />
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                                </button>
                            </div>

                            <div className="mt-16 flex justify-center items-center gap-6 opacity-20">
                                <span className="text-[10px] text-white font-medium uppercase tracking-[0.5em]">Experiencia Premium</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}