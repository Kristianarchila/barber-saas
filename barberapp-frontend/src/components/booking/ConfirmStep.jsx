// === ARCHIVO: components/booking/ConfirmStep.jsx ===
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Clock, Scissors, User, CheckCircle2 } from "lucide-react";

const ConfirmStep = ({ formData, service, barber, onConfirm, loading, onChange, errorApi }) => (
    <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start"
    >
        {/* CARD RESUMEN */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-black to-neutral-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl p-10 rounded-[2.8rem] border border-black/5 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-neutral-100 rounded-full blur-3xl opacity-50"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-neutral-400 mb-2">Resumen de Cita</h4>
                            <div className="h-1 w-12 bg-black rounded-full"></div>
                        </div>
                        <div className="bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase">Confirmación</div>
                    </div>

                    <div className="space-y-10">
                        <div className="flex items-start gap-5">
                            <div className="p-4 bg-neutral-50 rounded-2xl"><Scissors className="text-black" size={24} /></div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-neutral-400 block mb-1">Servicio seleccionado</label>
                                <p className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">{service?.nombre || "Corte de Pelo"}</p>
                                <div className="flex items-center gap-2 mt-2 text-neutral-500">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{service?.duracion || 30} MINUTOS</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                                    {barber?.foto ? (
                                        <img src={barber.foto} className="w-full h-full object-cover" alt={barber.nombre} />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300"><User size={20} /></div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">Especialista</label>
                                    <p className="font-black uppercase text-sm tracking-tight">{barber?.nombre}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-neutral-50 rounded-xl text-neutral-400"><CheckCircle2 size={24} /></div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">Fecha y Hora</label>
                                    <p className="font-black uppercase text-sm tracking-tight">
                                        {dayjs(formData.fecha).format("DD MMM")} • {formData.hora}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-black/5">
                            <div className="flex justify-between items-baseline">
                                <span className="font-black uppercase text-xl tracking-tighter">Total</span>
                                <div className="flex items-baseline">
                                    <span className="text-sm font-black mr-1">$</span>
                                    <span className="text-6xl font-black tracking-tighter leading-none">{service?.precio}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FORMULARIO */}
        <div className="flex flex-col h-full py-4">
            <div className="mb-10 text-center lg:text-left">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Tus Datos</h3>
                <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.2em]">Necesarios para validar tu espacio</p>
            </div>

            <div className="space-y-5">
                {[
                    { field: "nombreCliente", placeholder: "NOMBRE COMPLETO", type: "text", icon: <User size={18} />, autoComplete: "name" },
                    { field: "emailCliente",  placeholder: "EMAIL DE CONTACTO", type: "email", icon: <Clock size={18} className="rotate-45" />, autoComplete: "email" },
                    { field: "telefonoCliente", placeholder: "TELÉFONO (OPCIONAL)", type: "tel", icon: <CheckCircle2 size={18} />, autoComplete: "tel" },
                ].map(({ field, placeholder, type, icon, autoComplete }) => (
                    <div key={field} className="group relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-black transition-colors">{icon}</div>
                        <input
                            required={field !== "telefonoCliente"}
                            placeholder={placeholder}
                            type={type}
                            className="w-full pl-16 p-6 rounded-[1.5rem] border border-black/5 bg-white font-black text-sm tracking-widest outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                            value={formData[field]}
                            onChange={e => onChange(field, e.target.value)}
                            autoComplete={autoComplete}
                        />
                    </div>
                ))}

                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.15em] px-2 text-center lg:text-left">
                    🔒 Tu información está protegida por encriptación de grado militar
                </p>

                {errorApi && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border-2 border-red-500/10 rounded-2xl p-5 text-center">
                        <p className="text-red-600 font-black uppercase text-[10px] tracking-widest leading-relaxed">{errorApi}</p>
                    </motion.div>
                )}

                <div className="pt-6">
                    <button
                        onClick={onConfirm}
                        disabled={loading || !formData.nombreCliente || !formData.emailCliente}
                        className="relative w-full overflow-hidden group/btn"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-black translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                        <div className={`relative flex items-center justify-center gap-4 py-7 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] transition-all duration-300 ${
                            loading ? "bg-neutral-100 text-neutral-400" : "bg-black text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-none"
                        }`}>
                            {loading ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                                        ))}
                                    </div>
                                    <span>PROCESANDO RESERVA</span>
                                </div>
                            ) : (
                                <>AGENDAR AHORA <span className="opacity-50 group-hover/btn:translate-x-1 transition-transform">→</span></>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </motion.section>
);

export default ConfirmStep;
