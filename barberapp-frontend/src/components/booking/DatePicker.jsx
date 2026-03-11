// === ARCHIVO: components/booking/DatePicker.jsx ===
import { motion } from "framer-motion";

const DatePicker = ({ selectedDate, onSelect }) => {
    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const toLocalISO = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {dates.map((d, i) => {
                    const iso = toLocalISO(d);
                    const active = selectedDate === iso;
                    const isToday = i === 0;
                    return (
                        <motion.button
                            key={iso}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => onSelect(iso)}
                            className={`flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all relative overflow-hidden ${
                                active
                                    ? "bg-black text-white shadow-lg scale-105 z-10"
                                    : isToday
                                    ? "bg-white border-2 border-black/20 text-neutral-600"
                                    : "bg-white border border-black/5 text-neutral-400"
                            }`}
                        >
                            <span className={`text-[8px] font-black uppercase tracking-wider mb-0.5 ${active ? "text-white/60" : isToday ? "text-black/40" : "text-neutral-300"}`}>
                                {isToday && !active ? "HOY" : d.toLocaleDateString("es-ES", { weekday: "short" }).slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-xl font-black tracking-tighter leading-none">{d.getDate()}</span>
                            {active && <motion.div layoutId="date-active" className="absolute bottom-2 w-1 h-1 bg-white rounded-full" />}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default DatePicker;
