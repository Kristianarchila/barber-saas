// === ARCHIVO: components/booking/TimeGrid.jsx ===
import { motion } from "framer-motion";
import { Sun, CloudSun, Moon } from "lucide-react";

const TimeBlock = ({ title, slots, icon: Icon, theme, selectedTime, onSelect }) => {
    if (slots.length === 0) return null;
    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
                    <Icon size={16} />
                </div>
                <span className="font-black uppercase text-[10px] tracking-[0.3em] text-neutral-400">{title}</span>
                <div className="h-px bg-black/5 flex-grow"></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {slots.map((t, i) => {
                    const isRecommended = i === 1;
                    return (
                        <motion.button
                            key={t}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(t)}
                            className={`group relative min-h-[64px] rounded-2xl border-2 font-black text-sm transition-all overflow-hidden ${
                                selectedTime === t ? "bg-black text-white border-black shadow-lg" : "bg-white border-black/5 hover:border-black/20"
                            }`}
                        >
                            {isRecommended && selectedTime !== t && (
                                <div className={`absolute inset-0 bg-gradient-to-tr ${theme.glow} to-transparent opacity-50`}></div>
                            )}
                            <span className="relative z-10">{t}</span>
                            {isRecommended && selectedTime !== t && (
                                <span className={`absolute top-1 right-1 w-1.5 h-1.5 ${theme.dot} rounded-full animate-pulse shadow-lg`}></span>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

const TimeGrid = ({ turnos, selectedTime, onSelect, loading }) => {
    if (loading) return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {Array(10).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-2xl" />
            ))}
        </div>
    );

    const morning   = turnos.filter(t => parseInt(t.split(":")[0]) < 13);
    const afternoon = turnos.filter(t => parseInt(t.split(":")[0]) >= 13 && parseInt(t.split(":")[0]) < 19);
    const evening   = turnos.filter(t => parseInt(t.split(":")[0]) >= 19);

    return (
        <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-neutral-100/50 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-1/2 -right-20 w-96 h-96 bg-neutral-50 rounded-full blur-3xl -z-10"></div>
            <TimeBlock title="Mañana"  slots={morning}   icon={Sun}      theme={{ bg: "bg-orange-50", text: "text-orange-400", glow: "from-orange-400/5", dot: "bg-orange-400" }} selectedTime={selectedTime} onSelect={onSelect} />
            <TimeBlock title="Tarde"   slots={afternoon} icon={CloudSun} theme={{ bg: "bg-blue-50",   text: "text-blue-400",   glow: "from-blue-400/5",   dot: "bg-blue-400"   }} selectedTime={selectedTime} onSelect={onSelect} />
            <TimeBlock title="Noche"   slots={evening}   icon={Moon}     theme={{ bg: "bg-indigo-50", text: "text-indigo-400", glow: "from-indigo-400/5", dot: "bg-indigo-400" }} selectedTime={selectedTime} onSelect={onSelect} />
        </div>
    );
};

export default TimeGrid;
