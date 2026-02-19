import { Stars, Clock, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AISuggestionBox = ({ suggestion, onSelectSlot, loading }) => {
    if (loading) {
        return (
            <div className="mt-8 bg-white border border-black/5 rounded-[2rem] p-8 md:p-12 text-center animate-pulse">
                <div className="w-12 h-12 bg-neutral-100 rounded-full mx-auto mb-6" />
                <div className="h-4 bg-neutral-100 rounded w-3/4 mx-auto mb-4" />
                <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto" />
            </div>
        );
    }

    if (!suggestion || !suggestion.slots || suggestion.slots.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 relative overflow-hidden bg-white border border-black/5 rounded-[2.5rem] p-8 md:p-12 shadow-xl"
        >
            {/* Decorative Gradient Background */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

            {/* Header with AI Badge */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                        <Stars size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Recomendación Smart</span>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Sugerencia IA</h3>
                    </div>
                </div>
                <div className="px-5 py-2 bg-neutral-100 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Optimizando Agenda</span>
                </div>
            </div>

            {/* AI Conversational Text */}
            <div className="mb-10 relative">
                <span className="absolute -left-6 top-0 text-6xl text-black/5 font-black leading-none">“</span>
                <p className="text-lg md:text-xl font-medium text-neutral-700 leading-relaxed italic">
                    {suggestion.text}
                </p>
            </div>

            {/* Suggested Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestion.slots.map((slot, index) => (
                    <button
                        key={`${slot.fecha}-${slot.hora}`}
                        onClick={() => onSelectSlot(slot.fecha, slot.hora)}
                        className="group relative bg-[#FAFAFA] hover:bg-black p-6 rounded-[1.8rem] border border-black/5 transition-all duration-500 text-left overflow-hidden"
                    >
                        <div className="relative z-10 transition-colors duration-500 group-hover:text-white">
                            <div className="flex items-center gap-2 mb-4 opacity-50 group-hover:opacity-100">
                                <Calendar size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{slot.diaLabel}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-purple-600 group-hover:text-white" />
                                    <span className="text-2xl font-black tracking-tighter">{slot.hora}</span>
                                </div>
                                <ArrowRight size={20} className="transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-8 border-t border-black/5 flex items-center justify-center gap-2 text-neutral-400">
                <Stars size={14} className="animate-spin-slow" />
                <span className="text-[9px] font-black uppercase tracking-widest">Nuestra IA analiza patrones de reserva para sugerirte el mejor momento</span>
            </div>
        </motion.div>
    );
};

export default AISuggestionBox;
