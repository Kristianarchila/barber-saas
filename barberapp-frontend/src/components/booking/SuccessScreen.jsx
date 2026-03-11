// === ARCHIVO: components/booking/SuccessScreen.jsx ===
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const SuccessScreen = ({ formData, service, barberia }) => {
    const generateGoogleUrl = () => {
        const start = dayjs(`${formData.fecha}T${formData.hora}:00`);
        const end = start.add(service?.duracion || 30, "minute");
        const fmt = (d) => d.format("YYYYMMDDTHHmmss");
        const text = encodeURIComponent(`Cita en ${barberia?.nombre}: ${service?.nombre}`);
        const dates = `${fmt(start)}/${fmt(end)}`;
        const details = encodeURIComponent(`Cita confirmada con ${barberia?.nombre}. Servicio: ${service?.nombre}. Ubicación: ${barberia?.direccion || ""}`);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
    };

    const generateOutlookUrl = () => {
        const start = dayjs(`${formData.fecha}T${formData.hora}:00`);
        const end = start.add(service?.duracion || 30, "minute");
        const subject = encodeURIComponent(`Cita en ${barberia?.nombre}: ${service?.nombre}`);
        const startdt = start.format("YYYY-MM-DDTHH:mm:ss");
        const enddt = end.format("YYYY-MM-DDTHH:mm:ss");
        const body = encodeURIComponent(`Cita confirmada con ${barberia?.nombre}. Servicio: ${service?.nombre}.`);
        return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&startdt=${startdt}&enddt=${enddt}&body=${body}`;
    };

    return (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20 px-4 max-w-3xl mx-auto">
            <div className="relative w-32 h-32 mx-auto mb-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="absolute inset-0 bg-green-500 rounded-full shadow-[0_20px_50px_rgba(34,197,94,0.4)] flex items-center justify-center text-white"
                >
                    <CheckCircle2 size={64} />
                </motion.div>
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-4 border-4 border-green-500 rounded-full"
                />
            </div>

            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
                ¡Cita Lista<span className="text-green-500">.</span>!
            </h2>
            <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-16 max-w-md mx-auto leading-relaxed">
                Tu reserva ha sido confirmada. Los detalles viajan ahora mismo a tu bandeja de entrada.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {[
                    { href: generateGoogleUrl(), src: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg", label: "Google Calendar" },
                    { href: generateOutlookUrl(), src: "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg", label: "Outlook / Office" },
                ].map(({ href, src, label }) => (
                    <motion.a key={label} whileHover={{ y: -5 }} href={href} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-4 p-8 bg-white border border-black/5 rounded-[2rem] hover:shadow-xl transition-all group"
                    >
                        <img src={src} className="w-10 h-10 group-hover:scale-110 transition-transform" alt={label} />
                        <div>
                            <span className="block font-black uppercase text-[10px] tracking-widest text-neutral-400 mb-1">Añadir a</span>
                            <span className="block font-black uppercase text-xs tracking-tighter">{label}</span>
                        </div>
                    </motion.a>
                ))}
            </div>

            <button onClick={() => window.location.reload()} className="group relative px-16 py-6 bg-black text-white rounded-full font-black uppercase text-xs tracking-[0.4em] overflow-hidden transition-all hover:pr-20">
                <span className="relative z-10">Finalizar Experiencia</span>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span>
            </button>
        </motion.div>
    );
};

export default SuccessScreen;
