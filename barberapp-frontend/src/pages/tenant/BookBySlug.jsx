// === ARCHIVO: pages/tenant/BookBySlug.jsx ===
import { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Scissors, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { useBarberia } from "../../context/BarberiaContext";
import { crearReservaBySlug, reagendarReservaByToken } from "../../services/publicService";

// Hooks de dominio
import { useAvailability } from "../../hooks/useAvailability";
import { useSmartSuggest } from "../../hooks/useSmartSuggest";
import { useAISuggestions } from "../../hooks/useAISuggestions";

// Componentes de booking
import ServiceGridCard    from "../../components/booking/ServiceGridCard";
import BarberSelector     from "../../components/booking/BarberSelector";
import DatePicker         from "../../components/booking/DatePicker";
import TimeGrid           from "../../components/booking/TimeGrid";
import SmartSuggestPanel  from "../../components/booking/SmartSuggestPanel";
import ConfirmStep        from "../../components/booking/ConfirmStep";
import SuccessScreen      from "../../components/booking/SuccessScreen";
import LoadingScreen      from "../../components/booking/LoadingScreen";
import JoinWaitingListModal from "../../components/modals/JoinWaitingListModal";
import AISuggestionBox    from "../../components/booking/AISuggestionBox";

// --- Micro-componentes internos del layout ---
const EnergyGrid = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, black 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
    </div>
);

const ProgressBar = ({ currentStep, totalSteps = 5 }) => (
    <div className="absolute top-0 left-0 w-full h-1 bg-neutral-100 overflow-hidden">
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        />
    </div>
);

// --- Componente principal ---
export default function BookBySlug() {
    const { slug: slugFromParams, rescheduleToken } = useParams();
    const location  = useLocation();
    const navigate  = useNavigate();
    const { slug: slugContext, barberia, barberos = [], servicios = [], loading: loadingContext } = useBarberia();
    const slug = slugContext || slugFromParams;

    const [step, setStep]                   = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [searchTerm, setSearchTerm]       = useState("");
    const [reservando, setReservando]       = useState(false);
    const [errorApi, setErrorApi]           = useState(null);
    const [showWaitingListModal, setShowWaitingListModal] = useState(false);
    const [formData, setFormData]           = useState({
        barberoId: location.state?.barberoId || "",
        servicioId: "", fecha: "", hora: "",
        nombreCliente: "", emailCliente: "", telefonoCliente: ""
    });

    const handleSelect = (name, value) => {
        setFormData(prev => ({
            ...prev, [name]: value,
            ...(["fecha", "barberoId", "servicioId"].includes(name) && { hora: "" })
        }));
        if (window.navigator.vibrate) window.navigator.vibrate(10);
    };

    // Auto-seleccionar HOY al entrar al Paso 2
    useEffect(() => {
        if (step === 2 && !formData.fecha) {
            const today = new Date();
            const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
            setFormData(prev => ({ ...prev, fecha: iso }));
        }
    }, [step]);

    // Hooks de dominio
    const { turnosDisponibles, setTurnosDisponibles, loadingTurnos } = useAvailability({
        slug, barberoId: formData.barberoId, fecha: formData.fecha, servicioId: formData.servicioId
    });

    const { smartSuggest, setSmartSuggest, loadingSmartSuggest } = useSmartSuggest({
        slug, barberoId: formData.barberoId, fecha: formData.fecha, servicioId: formData.servicioId,
        barberos, turnosDisponibles, loadingTurnos
    });

    const { aiSuggestion, loadingAI } = useAISuggestions({
        barberiaId: barberia?._id, barberoId: formData.barberoId,
        servicioId: formData.servicioId, fecha: formData.fecha,
        turnosDisponibles, loadingTurnos
    });

    // Memos
    const categorias = useMemo(() => {
        const counts = { "Todos": servicios.length };
        servicios.forEach(s => { const cat = s.categoria || "General"; counts[cat] = (counts[cat] || 0) + 1; });
        return Object.entries(counts).map(([nombre, count]) => ({ nombre, count }));
    }, [servicios]);

    const serviciosFiltrados = useMemo(() =>
        servicios.filter(s => {
            const matchCat = selectedCategory === "Todos" || (s.categoria || "General") === selectedCategory;
            const matchSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCat && matchSearch;
        }), [servicios, selectedCategory, searchTerm]);

    const selectedService = useMemo(() => servicios.find(s => s._id === formData.servicioId), [formData.servicioId, servicios]);
    const selectedBarber  = useMemo(() => barberos.find(b => b._id === formData.barberoId),  [formData.barberoId, barberos]);

    // Confirmación
    const handleConfirmar = async () => {
        if (!formData.nombreCliente || formData.nombreCliente.trim().length < 2) { toast.error("Ingresa tu nombre completo (mínimo 2 caracteres)"); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.emailCliente || !emailRegex.test(formData.emailCliente)) { toast.error("Ingresa un correo electrónico válido"); return; }
        if (formData.telefonoCliente) {
            const phoneClean = formData.telefonoCliente.replace(/\s/g, "");
            if (!/^[+]?[0-9]{7,15}$/.test(phoneClean)) { toast.error("El teléfono ingresado no es válido"); return; }
        }
        setReservando(true); setErrorApi(null);
        try {
            if (rescheduleToken) await reagendarReservaByToken(rescheduleToken, formData);
            else                 await crearReservaBySlug(slug, formData.barberoId, formData);
            setStep(5);
        } catch (e) {
            const msg = e.response?.data?.message || e.message || "Error al procesar la reserva.";
            if (msg.includes("bloqueado") || msg.includes("no puede reservar")) setErrorApi("❌ Tu cuenta está temporalmente bloqueada.");
            else if (msg.includes("cancelaciones") || msg.includes("límite"))   setErrorApi("⚠️ Has alcanzado el límite de cancelaciones.");
            else if (msg.includes("No se puede reservar"))                       setErrorApi("🚫 Esta fecha/hora no está disponible.");
            else setErrorApi(msg);
        } finally { setReservando(false); }
    };

    if (loadingContext) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900 relative">
            <EnergyGrid />

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/95 border-b border-black/5">
                <ProgressBar currentStep={step} />
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { if (step > 1) setStep(s => s - 1); else navigate(-1); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 overflow-hidden">
                            {barberia?.logo
                                ? <img src={barberia.logo} alt={barberia?.nombre} className="h-6 md:h-8 w-auto object-contain" />
                                : <span className="font-black text-xs md:text-sm tracking-widest uppercase truncate max-w-[120px] md:max-w-none">{barberia?.nombre || "Cargando..."}</span>
                            }
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">PASO</span>
                        <span className="text-xs font-black tracking-widest">{step}/5</span>
                    </div>
                </div>

                {/* Mini ticket en móvil */}
                <AnimatePresence>
                    {step >= 2 && step <= 3 && (
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                            className="lg:hidden bg-black text-white px-6 py-3 flex items-center justify-between border-t border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                                    {selectedService?.imagen ? <img src={selectedService.imagen} className="w-full h-full object-cover opacity-70" /> : <Scissors size={14} className="text-white/40" />}
                                </div>
                                <div className="leading-none">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/40 block mb-1">Tu Servicio</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[120px] block">{selectedService?.nombre}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[7px] font-black uppercase tracking-widest text-white/40 block mb-1">A Pagar</span>
                                <span className="text-sm font-black tracking-tighter">${selectedService?.precio}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* SIDEBAR DESKTOP */}
            <AnimatePresence>
                {step >= 2 && step <= 4 && (
                    <motion.aside initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
                        className="fixed right-0 top-[73px] bottom-0 w-[400px] bg-white border-l border-black/5 z-40 hidden lg:flex flex-col p-8"
                    >
                        <div className="flex-grow space-y-10">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-neutral-400 mb-2">Tu Selección</h4>
                                    <div className="h-1 w-12 bg-black rounded-full"></div>
                                </div>
                                <div className="bg-black/5 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase text-neutral-400">Resumen Live</div>
                            </div>
                            {selectedService && (
                                <div className="flex items-start gap-5">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-neutral-100">
                                        {selectedService.imagen ? <img src={selectedService.imagen} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Scissors size={24} className="text-black/10" /></div>}
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-black uppercase text-neutral-400 mb-1">Servicio</span>
                                        <p className="text-xl font-black uppercase tracking-tighter leading-none mb-2">{selectedService.nombre}</p>
                                        <div className="flex items-center gap-2 text-neutral-400"><Clock size={10} /><span className="text-[9px] font-bold uppercase tracking-widest">{selectedService.duracion} MIN</span></div>
                                    </div>
                                </div>
                            )}
                            {selectedBarber && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                                        <img src={selectedBarber.foto || "https://res.cloudinary.com/diz8m6fxi/image/upload/v1710926715/ux-placeholder-barber.png"} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-black uppercase text-neutral-400 mb-0.5">Especialista</span>
                                        <p className="font-black uppercase text-xs tracking-tight">{selectedBarber.nombre}</p>
                                    </div>
                                </motion.div>
                            )}
                            {formData.fecha && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
                                    <div className="p-3 bg-neutral-50 rounded-xl text-black"><CheckCircle2 size={20} /></div>
                                    <div>
                                        <span className="block text-[8px] font-black uppercase text-neutral-400 mb-0.5">Cita Programada</span>
                                        <p className="font-black uppercase text-xs tracking-tight">{dayjs(formData.fecha).format("DD MMM")} {formData.hora ? `• ${formData.hora}` : ""}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        <div className="pt-8 border-t border-black/5">
                            <div className="flex justify-between items-baseline">
                                <span className="font-black uppercase text-sm tracking-tighter">Total</span>
                                <div className="flex items-baseline"><span className="text-xs font-black mr-1">$</span><span className="text-4xl font-black tracking-tighter">{selectedService?.precio}</span></div>
                            </div>
                            {step < 4 && (
                                <button onClick={() => formData.hora && setStep(4)} disabled={!formData.hora}
                                    className={`w-full mt-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all ${formData.hora ? "bg-black text-white shadow-xl hover:scale-[1.02]" : "bg-neutral-100 text-neutral-300 pointer-events-none"}`}
                                >
                                    Siguiente Paso →
                                </button>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* MAIN */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
                <AnimatePresence mode="wait">
                    {/* PASO 1: Servicios */}
                    {step === 1 && (
                        <motion.section key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="mb-8 md:mb-16 text-center mt-4 md:mt-0">
                                <h2 className="text-4xl md:text-9xl font-black tracking-[-0.05em] uppercase leading-[0.85] mb-4 md:mb-6 px-4">
                                    Nuestros<br />
                                    <span className="text-transparent" style={{ WebkitTextStroke: "1.5px #000" }}>Servicios</span>
                                </h2>
                                <div className="max-w-md mx-auto relative group">
                                    <input type="text" placeholder="ENCUENTRA TU ESTILO..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/50 border-b-2 border-black/5 py-4 px-2 text-[10px] font-black tracking-[0.2em] outline-none focus:border-black transition-all text-center rounded-t-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 md:gap-4 overflow-x-auto pb-8 no-scrollbar">
                                {categorias.map(cat => (
                                    <button key={cat.nombre} onClick={() => setSelectedCategory(cat.nombre)}
                                        className={`flex-shrink-0 px-6 min-h-[44px] rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${selectedCategory === cat.nombre ? "bg-black text-white border-black" : "bg-white text-black border-black/10 hover:border-black"}`}
                                    >
                                        {cat.nombre} ({cat.count})
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                <AnimatePresence mode="popLayout">
                                    {serviciosFiltrados.map(s => (
                                        <ServiceGridCard key={s._id} service={s} onSelect={() => { handleSelect("servicioId", s._id); setStep(2); }} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    )}

                    {/* PASO 2+3: Barbero + Agenda */}
                    {step === 2 && (
                        <motion.section key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto lg:pr-[420px]">
                            <div className="grid grid-cols-1 gap-12">
                                <div>
                                    <div className="mb-8">
                                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">Paso 2: Maestro</h2>
                                        <p className="text-neutral-400 font-black text-[9px] uppercase tracking-[0.4em]">ELIGE TU ARTISTA O SMART-MATCH</p>
                                    </div>
                                    <BarberSelector barberos={barberos} selectedBarberoId={formData.barberoId} onSelect={id => handleSelect("barberoId", id)} />
                                </div>

                                <div className={`${!formData.barberoId ? "opacity-20 pointer-events-none" : "opacity-100"} transition-opacity duration-500`}>
                                    <div className="mb-8">
                                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">Paso 3: Agenda</h2>
                                        <p className="text-neutral-400 font-black text-[9px] uppercase tracking-[0.4em]">DISPONIBILIDAD EN TIEMPO REAL</p>
                                    </div>

                                    <DatePicker selectedDate={formData.fecha} onSelect={d => handleSelect("fecha", d)} />

                                    <div className="mt-10">
                                        <TimeGrid turnos={turnosDisponibles} selectedTime={formData.hora} loading={loadingTurnos} onSelect={t => handleSelect("hora", t)} />
                                    </div>

                                    {!smartSuggest && (
                                        <div className="mt-10">
                                            <AISuggestionBox suggestion={aiSuggestion} loading={loadingAI}
                                                onSelectSlot={(fecha, hora) => { setFormData(prev => ({ ...prev, fecha, hora })); setStep(4); }}
                                            />
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {!loadingTurnos && turnosDisponibles.length === 0 && formData.fecha && formData.barberoId && formData.barberoId !== "any" && (
                                            <SmartSuggestPanel
                                                smartSuggest={smartSuggest}
                                                loadingSmartSuggest={loadingSmartSuggest}
                                                selectedBarber={selectedBarber}
                                                formData={formData}
                                                setFormData={setFormData}
                                                setStep={setStep}
                                                onOpenWaitingList={() => setShowWaitingListModal(true)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Botón móvil */}
                            <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
                                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                    <button disabled={!formData.hora} onClick={() => setStep(4)}
                                        className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.4)] ${formData.hora ? "bg-black text-white" : "bg-neutral-100 text-neutral-400 pointer-events-none"}`}
                                    >
                                        {formData.hora && (
                                            <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                                            />
                                        )}
                                        <div className="relative flex items-center justify-between py-4 px-6 h-20">
                                            <div className="flex flex-col items-start min-w-0 flex-1 pr-6">
                                                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Tu Experiencia</span>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-[11px] font-black uppercase tracking-widest truncate">CONFIRMAR {formData.hora}</span>
                                                    <ChevronRight size={14} className="text-white/20 shrink-0" />
                                                </div>
                                            </div>
                                            <div className="flex items-center shrink-0 border-l border-white/10 pl-6 my-1">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-[10px] font-black text-white/40">$</span>
                                                        <span className="text-[18px] font-black tracking-tighter leading-none">{selectedService?.precio}</span>
                                                    </div>
                                                    <span className="text-[6px] font-black uppercase tracking-[0.2em] mt-1.5 text-white/30">TOTAL</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            </div>
                        </motion.section>
                    )}

                    {step === 4 && <ConfirmStep formData={formData} service={selectedService} barber={selectedBarber} onConfirm={handleConfirmar} loading={reservando} onChange={handleSelect} errorApi={errorApi} />}
                    {step === 5 && <SuccessScreen formData={formData} service={selectedService} barberia={barberia} />}
                </AnimatePresence>
            </main>

            <JoinWaitingListModal
                isOpen={showWaitingListModal}
                onClose={() => setShowWaitingListModal(false)}
                barberiaId={barberia?._id}
                barberoId={formData.barberoId}
                barberoNombre={selectedBarber?.nombre}
                servicioId={formData.servicioId}
                servicioNombre={selectedService?.nombre}
                clienteData={{ nombre: formData.nombreCliente, email: formData.emailCliente, telefono: formData.telefonoCliente }}
            />
        </div>
    );
}