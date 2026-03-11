// === ARCHIVO: components/booking/SmartSuggestPanel.jsx ===
import dayjs from "dayjs";
import { User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * SmartSuggestPanel
 * Props:
 *   smartSuggest: { nextDays: [{fecha, turnos}], otherBarbers: [{barber, turnos}] } | null
 *   loadingSmartSuggest: boolean
 *   selectedBarber: objeto barbero actual | null
 *   formData: { fecha, ... }
 *   setFormData: fn
 *   setStep: fn
 *   onOpenWaitingList: fn
 */
const SmartSuggestPanel = ({ smartSuggest, loadingSmartSuggest, selectedBarber, formData, setFormData, setStep, onOpenWaitingList }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-8 rounded-[2.5rem] overflow-hidden border border-black/8 bg-white shadow-xl"
    >
        {/* Header */}
        <div className="bg-black px-8 py-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
            </div>
            <div>
                <h3 className="text-white font-black uppercase text-xs tracking-[0.2em]">
                    {selectedBarber?.nombre || "Este barbero"} no tiene turnos el {dayjs(formData.fecha).format("DD [de] MMMM")}
                </h3>
                <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mt-1">Smart Suggest — Encontramos estas alternativas</p>
            </div>
        </div>

        <div className="p-6 md:p-8">
            {loadingSmartSuggest ? (
                <div className="flex items-center justify-center py-10 gap-3">
                    <Loader2 className="animate-spin text-black/30" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Buscando alternativas...</span>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Próximos días con el mismo barbero */}
                    {smartSuggest?.nextDays?.length > 0 && (
                        <div>
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4 flex items-center gap-2">
                                <div className="h-px flex-1 bg-black/5"></div>
                                Próximos días con {selectedBarber?.nombre}
                                <div className="h-px flex-1 bg-black/5"></div>
                            </h4>
                            <div className="space-y-3">
                                {smartSuggest.nextDays.map(({ fecha, turnos }) => (
                                    <div key={fecha} className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02] hover:bg-black/[0.04] transition-colors">
                                        <div className="flex-shrink-0 text-center bg-white rounded-xl p-2 border border-black/5 min-w-[52px]">
                                            <div className="text-[8px] font-black uppercase tracking-widest text-neutral-400">{dayjs(fecha).format("ddd")}</div>
                                            <div className="text-lg font-black leading-none">{dayjs(fecha).format("D")}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 flex-1">
                                            {turnos.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => { setFormData(prev => ({ ...prev, fecha, hora: t })); setStep(4); }}
                                                    className="px-3 py-2 bg-black text-white rounded-xl text-[10px] font-black tracking-tight hover:bg-neutral-800 transition-colors shadow-sm"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Otros barberos disponibles hoy */}
                    {smartSuggest?.otherBarbers?.length > 0 && (
                        <div>
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4 flex items-center gap-2">
                                <div className="h-px flex-1 bg-black/5"></div>
                                Disponible hoy con otro maestro
                                <div className="h-px flex-1 bg-black/5"></div>
                            </h4>
                            <div className="space-y-3">
                                {smartSuggest.otherBarbers.map(({ barber, turnos }) => (
                                    <div key={barber._id} className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02] hover:bg-black/[0.04] transition-colors">
                                        <img
                                            src={barber.foto || "https://res.cloudinary.com/diz8m6fxi/image/upload/v1710926715/ux-placeholder-barber.png"}
                                            className="w-12 h-12 rounded-2xl object-cover flex-shrink-0 border border-black/5"
                                            alt={barber.nombre}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black uppercase tracking-tight truncate mb-2">{barber.nombre}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {turnos.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => { setFormData(prev => ({ ...prev, barberoId: barber._id, hora: t })); setStep(4); }}
                                                        className="px-3 py-2 bg-black text-white rounded-xl text-[10px] font-black tracking-tight hover:bg-neutral-800 transition-colors shadow-sm"
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sin ninguna alternativa */}
                    {!loadingSmartSuggest && !smartSuggest?.nextDays?.length && !smartSuggest?.otherBarbers?.length && (
                        <div className="text-center py-8">
                            <p className="text-sm font-black uppercase tracking-tighter text-neutral-400 mb-4">Sin disponibilidad cercana</p>
                            <button onClick={onOpenWaitingList} className="px-8 py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">
                                Unirse a Lista de Espera
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </motion.div>
);

export default SmartSuggestPanel;
