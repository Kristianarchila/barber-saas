import { useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    ChevronLeft, ChevronRight, Clock, Search, Scissors, Loader2, User, CheckCircle2, Sun, CloudSun, Moon
} from "lucide-react";
import { useBarberia } from "../../context/BarberiaContext";
import {
    getDisponibilidadBySlug,
    crearReservaBySlug,
    getReservaByToken,
    reagendarReservaByToken
} from "../../services/publicService";
import { motion, AnimatePresence } from "framer-motion";
import JoinWaitingListModal from "../../components/modals/JoinWaitingListModal";
import AISuggestionBox from "../../components/booking/AISuggestionBox";
import toast from "react-hot-toast";
import { getAISuggestions } from "../../services/publicService";
const EnergyGrid = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
    </div>
);

const ProgressBar = ({ currentStep, totalSteps = 5 }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-100 overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="h-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            />
        </div>
    );
};

// --- HELPERS ---
const calcularHoraFin = (horaInicio, duracionMinutos) => {
    if (!horaInicio) return "";
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMinutos = h * 60 + m + duracionMinutos;
    const horaFin = Math.floor(totalMinutos / 60);
    const minutoFin = totalMinutos % 60;
    return `${String(horaFin).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}`;
};

export default function BookBySlug() {
    const { slug: slugFromParams, rescheduleToken } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { slug: slugContext, barberia, barberos = [], servicios = [], loading: loadingContext } = useBarberia();

    const slug = slugContext || slugFromParams;

    // --- ESTADOS ---
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [turnosDisponibles, setTurnosDisponibles] = useState([]);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [reservando, setReservando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);
    const [showWaitingListModal, setShowWaitingListModal] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const [formData, setFormData] = useState({
        barberoId: location.state?.barberoId || "",
        servicioId: "",
        fecha: "",
        hora: "",
        nombreCliente: "",
        emailCliente: "",
        telefonoCliente: ""
    });

    // --- FILTRADO ---
    const categorias = useMemo(() => {
        const counts = { 'Todos': servicios.length };
        servicios.forEach(s => {
            const cat = s.categoria || 'General';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).map(([nombre, count]) => ({ nombre, count }));
    }, [servicios]);

    const serviciosFiltrados = useMemo(() => {
        return servicios.filter(s => {
            const matchesCategory = selectedCategory === 'Todos' || (s.categoria || 'General') === selectedCategory;
            const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [servicios, selectedCategory, searchTerm]);

    // --- HANDLERS ---
    const handleSelect = (name, value) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value,
                ...(['fecha', 'barberoId', 'servicioId'].includes(name) && { hora: "" })
            };
            return newData;
        });
        
        // Haptic feedback
        if (window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();

        const fetchTurnos = async () => {
            // Manejamos 'any' como un barbero vacío para que el backend busque disponibilidad general
            const targetBarberId = formData.barberoId === 'any' ? "" : formData.barberoId;
            
            if (!formData.fecha || !formData.servicioId || !slug) return;
            
            setLoadingTurnos(true);
            setTurnosDisponibles([]);
            try {
                const data = await getDisponibilidadBySlug(slug, targetBarberId, formData.fecha, formData.servicioId);
                if (!abortController.signal.aborted) {
                    setTurnosDisponibles(data.turnosDisponibles || []);
                }
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error("Error fetching turnos:", error);
                    setTurnosDisponibles([]);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingTurnos(false);
                }
            }
        };

        const timer = setTimeout(fetchTurnos, 300);
        return () => {
            clearTimeout(timer);
            abortController.abort();
        };
    }, [formData.fecha, formData.barberoId, formData.servicioId, slug]);

    // --- AI SUGGESTIONS LOGIC ---
    useEffect(() => {
        const fetchAISuggestions = async () => {
            if (!loadingTurnos && turnosDisponibles.length === 0 && formData.fecha && formData.barberoId && formData.servicioId && barberia?._id) {
                setLoadingAI(true);
                try {
                    const result = await getAISuggestions(
                        barberia?._id,
                        formData.barberoId,
                        formData.servicioId,
                        formData.fecha,
                        "12:00" // Default time since we don't have it yet
                    );
                    setAiSuggestion(result);
                } catch (error) {
                    console.error("Error fetching AI suggestions:", error);
                } finally {
                    setLoadingAI(false);
                }
            } else if (turnosDisponibles.length > 0) {
                setAiSuggestion(null);
            }
        };

        fetchAISuggestions();
    }, [turnosDisponibles, formData.fecha, formData.barberoId, formData.servicioId, loadingTurnos, barberia?._id]);

    const handleSelectAISlot = (fecha, hora) => {
        setFormData(prev => ({
            ...prev,
            fecha,
            hora
        }));
        // Scroll to confirms or move to next step?
        // Let's just select it. The user will see it selected in TimeGrid or we can jump to step 4.
        setStep(4);
    };

    const handleConfirmar = async () => {
        // Client-side validation before API call
        if (!formData.nombreCliente || formData.nombreCliente.trim().length < 2) {
            toast.error('Ingresa tu nombre completo (mínimo 2 caracteres)');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.emailCliente || !emailRegex.test(formData.emailCliente)) {
            toast.error('Ingresa un correo electrónico válido');
            return;
        }
        if (formData.telefonoCliente) {
            const phoneClean = formData.telefonoCliente.replace(/\s/g, '');
            if (!/^[+]?[0-9]{7,15}$/.test(phoneClean)) {
                toast.error('El teléfono ingresado no es válido');
                return;
            }
        }
        setReservando(true);
        setErrorApi(null);
        try {
            if (rescheduleToken) {
                await reagendarReservaByToken(rescheduleToken, formData);
            } else {
                await crearReservaBySlug(slug, formData.barberoId, formData);
            }
            setStep(5);
        } catch (e) {
            // Extract error message from API response
            const errorMessage = e.response?.data?.message || e.message || 'Error al procesar la reserva.';

            // Check for specific error types
            if (errorMessage.includes('bloqueado') || errorMessage.includes('no puede reservar')) {
                setErrorApi('❌ Tu cuenta está temporalmente bloqueada. Contacta con la barbería para más información.');
            } else if (errorMessage.includes('cancelaciones') || errorMessage.includes('límite')) {
                setErrorApi('⚠️ Has alcanzado el límite de cancelaciones permitidas este mes.');
            } else if (errorMessage.includes('No se puede reservar en esta fecha')) {
                setErrorApi('🚫 Esta fecha/hora no está disponible. Por favor selecciona otra.');
            } else {
                setErrorApi(errorMessage);
            }
            console.error('Error al reservar:', e);
        } finally {
            setReservando(false);
        }
    };

    const selectedService = useMemo(() => servicios.find(s => s._id === formData.servicioId), [formData.servicioId, servicios]);
    const selectedBarber = useMemo(() => barberos.find(b => b._id === formData.barberoId), [formData.barberoId, barberos]);

    if (loadingContext) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900 relative">
            <EnergyGrid />
            {/* HEADER COMPACTO CON PROGRESO */}
            <header className="sticky top-0 z-50 bg-white/95 border-b border-black/5">
                <ProgressBar currentStep={step} />
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0">
                            <ChevronLeft size={20} />
                        </button>
                        
                        {/* LOGO DINÁMICO */}
                        <div className="flex items-center gap-2 overflow-hidden">
                            {barberia?.logo ? (
                                <img src={barberia.logo} alt={barberia?.nombre} className="h-6 md:h-8 w-auto object-contain" />
                            ) : (
                                <span className="font-black text-xs md:text-sm tracking-widest uppercase truncate max-w-[120px] md:max-w-none">
                                    {barberia?.nombre || "Cargando..."}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">PASO</span>
                            <span className="text-xs font-black tracking-widest">{step}/5</span>
                        </div>
                    </div>
                </div>

                {/* MOBILE FLOATING TICKET SUMMARY (Solo móvil, Paso 2 y 3) */}
                <AnimatePresence>
                    {step >= 2 && step <= 3 && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="lg:hidden bg-black text-white px-6 py-3 flex items-center justify-between border-t border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                                    {selectedService?.imagen ? (
                                        <img src={selectedService.imagen} className="w-full h-full object-cover opacity-70" />
                                    ) : (
                                        <Scissors size={14} className="text-white/40" />
                                    )}
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

            {/* SIDEBAR PERSISTENTE (MODO TICKET) - Aparece desde el Paso 2 */}
            <AnimatePresence>
                {step >= 2 && step <= 4 && (
                    <motion.aside
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed right-0 top-[73px] bottom-0 w-[400px] bg-white border-l border-black/5 z-40 hidden lg:flex flex-col p-8"
                    >
                        <div className="flex-grow">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-neutral-400 mb-2">Tu Selección</h4>
                                    <div className="h-1 w-12 bg-black rounded-full"></div>
                                </div>
                                <div className="bg-black/5 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase text-neutral-400">
                                    Resumen Live
                                </div>
                            </div>

                            <div className="space-y-10">
                                {/* SERVICIO */}
                                <div className="flex items-start gap-5">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-neutral-100">
                                        {selectedService?.imagen ? (
                                            <img src={selectedService.imagen} className="w-full h-full object-cover" alt={selectedService.nombre} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Scissors size={24} className="text-black/10" /></div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-black uppercase text-neutral-400 mb-1">Servicio</span>
                                        <p className="text-xl font-black uppercase tracking-tighter leading-none mb-2">{selectedService?.nombre}</p>
                                        <div className="flex items-center gap-2 text-neutral-400">
                                            <Clock size={10} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">{selectedService?.duracion} MIN</span>
                                        </div>
                                    </div>
                                </div>

                                {/* BARBERO */}
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

                                {/* FECHA Y HORA */}
                                {formData.fecha && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
                                        <div className="p-3 bg-neutral-50 rounded-xl text-black">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <span className="block text-[8px] font-black uppercase text-neutral-400 mb-0.5">Cita Programada</span>
                                            <p className="font-black uppercase text-xs tracking-tight">
                                                {dayjs(formData.fecha).format('DD MMM')} {formData.hora ? `• ${formData.hora}` : ''}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* PRECIO FINAL EN SIDEBAR */}
                        <div className="pt-8 border-t border-black/5">
                            <div className="flex justify-between items-baseline">
                                <span className="font-black uppercase text-sm tracking-tighter">Total</span>
                                <div className="flex items-baseline">
                                    <span className="text-xs font-black mr-1">$</span>
                                    <span className="text-4xl font-black tracking-tighter">{selectedService?.precio}</span>
                                </div>
                            </div>
                            
                            {step < 4 && (
                                <button
                                    onClick={() => formData.hora && setStep(4)}
                                    disabled={!formData.hora}
                                    className={`w-full mt-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all ${formData.hora ? 'bg-black text-white shadow-xl hover:scale-[1.02]' : 'bg-neutral-100 text-neutral-300 pointer-events-none'}`}
                                >
                                    Siguiente Paso →
                                </button>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.section key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* TÍTULO CINEMÁTICO RESPONSIVO */}
                            <div className="mb-8 md:mb-16 text-center mt-4 md:mt-0">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h2 className="text-4xl md:text-9xl font-black tracking-[-0.05em] uppercase leading-[0.85] mb-4 md:mb-6 px-4">
                                        Nuestros<br />
                                        <span className="text-transparent font-outline-2" style={{ WebkitTextStroke: '1.5px #000' }}>Servicios</span>
                                    </h2>
                                    <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8">
                                        <div className="h-px w-8 md:w-12 bg-black/10"></div>
                                        <p className="text-neutral-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em]">
                                            {serviciosFiltrados.length} EXCELENCIAS
                                        </p>
                                        <div className="h-px w-8 md:w-12 bg-black/10"></div>
                                    </div>
                                </motion.div>

                                <div className="max-w-md mx-auto relative group">
                                    <input
                                        type="text"
                                        placeholder="ENCUENTRA TU ESTILO..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white/50 border-b-2 border-black/5 py-4 px-2 text-[10px] font-black tracking-[0.2em] outline-none focus:border-black transition-all text-center group-hover:bg-white transition-all duration-500 rounded-t-xl"
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 group-hover:text-black transition-colors" size={16} />
                                </div>
                            </div>

                            {/* CATEGORÍAS PILLS — M-01 FIX: min-h-[44px] for touch target */}
                            <div className="flex gap-2 md:gap-4 overflow-x-auto pb-8 no-scrollbar">
                                {categorias.map((cat) => (
                                    <button
                                        key={cat.nombre}
                                        onClick={() => setSelectedCategory(cat.nombre)}
                                        className={`flex-shrink-0 px-6 min-h-[44px] rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${selectedCategory === cat.nombre ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'
                                            }`}
                                    >
                                        {cat.nombre} ({cat.count})
                                    </button>
                                ))}
                            </div>

                            {/* GRID OPTIMIZADO */}
                            {/* GRID DE SERVICIOS ESCALABLE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                <AnimatePresence mode='popLayout'>
                                    {serviciosFiltrados.map((s) => (
                                        <ServiceGridCard
                                            key={s._id}
                                            service={s}
                                            onSelect={() => { handleSelect('servicioId', s._id); setStep(2); }}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.section>
                    )}

                    {step === 2 && (
                        <motion.section 
                            key="step2" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`max-w-7xl mx-auto transition-all duration-700 ${step >= 2 ? 'lg:pr-[420px]' : ''}`}
                        >
                            <div className="grid grid-cols-1 gap-12">
                                {/* SELECCIÓN DE MAESTRO */}
                                <div>
                                    <div className="mb-8">
                                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">Paso 2: Maestro</h2>
                                        <p className="text-neutral-400 font-black text-[9px] uppercase tracking-[0.4em]">ELIGE TU ARTISTA O SMART-MATCH</p>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                                        {/* OPCIÓN CUALQUIER PROFESIONAL (SMART MATCH) */}
                                        <button
                                            onClick={() => handleSelect('barberoId', 'any')}
                                            className={`flex-shrink-0 w-32 md:w-40 p-6 rounded-[2rem] border-2 transition-all text-center ${formData.barberoId === 'any' ? 'border-black bg-white shadow-lg' : 'border-black/5 bg-white/40 hover:border-black/20'}`}
                                        >
                                            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-2xl flex items-center justify-center">
                                                <User size={24} />
                                            </div>
                                            <span className="block font-black uppercase text-[10px] tracking-tight">Cualquiera</span>
                                        </button>

                                        {barberos.map(b => (
                                            <button
                                                key={b._id}
                                                onClick={() => handleSelect('barberoId', b._id)}
                                                className={`flex-shrink-0 w-32 md:w-40 p-6 rounded-[2rem] border-2 transition-all text-center ${formData.barberoId === b._id ? 'border-black bg-white shadow-lg' : 'border-black/5 bg-white/40 hover:border-black/20'}`}
                                            >
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden border border-black/5">
                                                    <img src={b.foto || "https://res.cloudinary.com/diz8m6fxi/image/upload/v1710926715/ux-placeholder-barber.png"} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="block font-black uppercase text-[10px] tracking-tight truncate">{b.nombre}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* SELECCIÓN DE FECHA Y HORA (AHORA EN EL MISMO PASO) */}
                                <div className={`${!formData.barberoId ? 'opacity-20 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}>
                                    <div className="mb-8">
                                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">Paso 3: Agenda</h2>
                                        <p className="text-neutral-400 font-black text-[9px] uppercase tracking-[0.4em]">DISPONIBILIDAD EN TIEMPO REAL</p>
                                    </div>
                                    
                                    <DatePicker selectedDate={formData.fecha} onSelect={(d) => handleSelect('fecha', d)} />
                                    
                                    <div className="mt-10">
                                        <TimeGrid turnos={turnosDisponibles} selectedTime={formData.hora} loading={loadingTurnos} onSelect={(t) => handleSelect('hora', t)} />
                                    </div>

                                    {/* AI Suggestions Box */}
                                    <div className="mt-10">
                                        <AISuggestionBox
                                            suggestion={aiSuggestion}
                                            onSelectSlot={handleSelectAISlot}
                                            loading={loadingAI}
                                        />
                                    </div>

                                    {/* No slots available - Fallback */}
                                    {!loadingTurnos && !loadingAI && turnosDisponibles.length === 0 && !aiSuggestion?.slots?.length && formData.fecha && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-black/[0.02] border border-black/5 rounded-[2.5rem] p-10 text-center">
                                            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">No hay horarios disponibles para este barbero</h3>
                                            <button onClick={() => setShowWaitingListModal(true)} className="px-8 py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">
                                                Unirse a Lista de Espera
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Bar Fixed Next Button - MEJORADO */}
                            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                                <button 
                                    disabled={!formData.hora} 
                                    onClick={() => setStep(4)} 
                                    className={`w-full py-6 px-6 md:px-8 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] transition-all duration-500 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${formData.hora ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-400 pointer-events-none opacity-50'}`}
                                >
                                    <span className="truncate mr-2">CONFIRMAR {formData.hora || ''}</span>
                                    <div className="flex items-center flex-shrink-0">
                                        <div className="h-6 w-px bg-white/20 mx-3"></div>
                                        <span className="text-sm font-black tracking-tighter">${selectedService?.precio}</span>
                                    </div>
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {step === 4 && <ConfirmStep formData={formData} service={selectedService} barber={selectedBarber} onConfirm={handleConfirmar} loading={reservando} onChange={handleSelect} errorApi={errorApi} />}
                    {step === 5 && <SuccessScreen formData={formData} service={selectedService} barberia={barberia} />}
                </AnimatePresence>
            </main>

            {/* Waiting List Modal */}
            <JoinWaitingListModal
                isOpen={showWaitingListModal}
                onClose={() => setShowWaitingListModal(false)}
                barberiaId={barberia?._id}
                barberoId={formData.barberoId}
                barberoNombre={selectedBarber?.nombre}
                servicioId={formData.servicioId}
                servicioNombre={selectedService?.nombre}
                clienteData={{
                    nombre: formData.nombreCliente,
                    email: formData.emailCliente,
                    telefono: formData.telefonoCliente
                }}
            />
        </div>
    );
}

// --- SUBCOMPONENTES ---

const ServiceGridCard = ({ service, onSelect }) => (
    <motion.div
        layout
        onClick={onSelect}
        whileHover={{ y: -10, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative bg-white/70 backdrop-blur-sm rounded-[2.5rem] overflow-hidden border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer"
    >
        {/* Imagen de Fondo con Overlay */}
        <div className="relative h-56 md:h-80 bg-neutral-100 overflow-hidden">
            {service.imagen ? (
                <img src={service.imagen} alt={service.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200">
                    <Scissors size={48} className="text-black/5" />
                </div>
            )}
            
            {/* Glass Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white">
                    <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 leading-none mb-1">Precio</span>
                    <span className="block text-xl font-black tracking-tighter">${service.precio}</span>
                </div>
                <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/10 w-fit">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <Clock size={12} className="text-white/50" /> {service.duracion} MIN
                    </span>
                </div>
            </div>

            {/* Premium Indicator */}
            <div className="absolute top-6 right-6">
                 <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                 </div>
            </div>

            {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10 relative">
            <div className="flex justify-between items-start mb-4">
                <div className="max-w-[80%]">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-[0.9] mb-3 group-hover:translate-x-2 transition-transform duration-500">{service.nombre}</h3>
                    <p className="text-neutral-400 text-[10px] md:text-xs font-bold uppercase tracking-wider leading-relaxed line-clamp-2">{service.descripcion || "Experiencia de grooming de alta gama diseñada para el caballero moderno."}</p>
                </div>
            </div>
            
            <div className="pt-8 flex items-center justify-between">
                <div className="h-px flex-1 bg-black/5 mr-6"></div>
                <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.3em] group-hover:text-black transition-colors">
                    RESERVAR <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
            </div>
        </div>

        {/* Squishy Inner Glow - Subtle Visual Detail */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent group-hover:border-white/10 transition-all duration-700 rounded-[2.5rem]"></div>
    </motion.div>
);

const BarberCard = ({ barber, isSelected, onSelect }) => (
    <motion.div 
        onClick={onSelect} 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-8 md:p-12 rounded-[3.5rem] border-2 transition-all duration-700 cursor-pointer text-center group ${
            isSelected 
            ? 'border-black bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]' 
            : 'border-black/5 bg-white/40 backdrop-blur-sm hover:border-black/20 hover:bg-white'
        }`}
    >
        {/* Selection Aura */}
        {isSelected && (
            <motion.div 
                layoutId="aura"
                className="absolute inset-0 rounded-[3.5rem] bg-black/5 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            />
        )}

        <div className="relative z-10">
            {/* Professional Squircle Container */}
            <div className={`w-28 h-28 md:w-40 md:h-40 mx-auto mb-8 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 transform ${
                isSelected ? 'scale-110 -rotate-3 ring-4 ring-black/5' : 'group-hover:rotate-2'
            }`}>
                {barber.foto ? (
                    <img src={barber.foto} className="w-full h-full object-cover" alt={barber.nombre} />
                ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <User className="text-black/10" size={48} />
                    </div>
                )}
            </div>

            <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 mb-2">Senior Barber</span>
            <h3 className="font-black uppercase tracking-tighter text-xl md:text-2xl mb-4 leading-none">{barber.nombre}</h3>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                isSelected ? 'bg-black text-white' : 'bg-black/5 text-black/40 group-hover:bg-black/10'
            }`}>
                {isSelected ? 'Seleccionado' : 'Ver Agenda'}
            </div>
        </div>

        {/* Decorative corner accent */}
        <div className={`absolute top-8 right-8 w-2 h-2 rounded-full transition-all duration-700 ${isSelected ? 'bg-black scale-150' : 'bg-black/10'}`}></div>
    </motion.div>
);

const DatePicker = ({ selectedDate, onSelect }) => {
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i); return d;
    });
    const toLocalISO = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {dates.map((d, i) => {
                    const iso = toLocalISO(d);
                    const active = selectedDate === iso;
                    const isToday = i === 0;
                    return (
                        <motion.button 
                            key={iso} 
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(iso)} 
                            className={`flex-shrink-0 w-20 h-28 md:w-24 md:h-32 rounded-[2rem] flex flex-col items-center justify-center transition-all relative overflow-hidden ${active ? 'bg-black text-white shadow-2xl scale-110 z-10' : 'bg-white border border-black/5 text-neutral-400 hover:border-black/20'}`}
                        >
                            {isToday && !active && (
                                <span className="absolute top-2 text-[7px] font-black uppercase tracking-widest text-neutral-300">Today</span>
                            )}
                            <span className="text-[10px] font-black uppercase mb-1">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                            <span className="text-3xl md:text-4xl font-black tracking-tighter">{d.getDate()}</span>
                            {active && (
                                <motion.div layoutId="date-active" className="absolute bottom-2 w-1.5 h-1.5 bg-white rounded-full" />
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

    // SEGMENTACIÓN POR BLOQUES HORARIOS
    const morning = turnos.filter(t => parseInt(t.split(':')[0]) < 13);
    const afternoon = turnos.filter(t => parseInt(t.split(':')[0]) >= 13 && parseInt(t.split(':')[0]) < 19);
    const evening = turnos.filter(t => parseInt(t.split(':')[0]) >= 19);

    const TimeBlock = ({ title, slots, icon: Icon, theme }) => {
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
                        const isRecommended = i === 1; // Simulación de IA highlight
                        return (
                            <motion.button 
                                key={t} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(t)} 
                                className={`group relative min-h-[64px] rounded-2xl border-2 font-black text-sm transition-all overflow-hidden ${selectedTime === t ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-black/5 hover:border-black/20'}`}
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

    return (
        <div className="relative">
            {/* Efectos de fondo glassmorphism dinámico */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-neutral-100/50 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-1/2 -right-20 w-96 h-96 bg-neutral-50 rounded-full blur-3xl -z-10"></div>

            <TimeBlock 
                title="Mañana" 
                slots={morning} 
                icon={Sun} 
                theme={{ bg: 'bg-orange-50', text: 'text-orange-400', glow: 'from-orange-400/5', dot: 'bg-orange-400' }} 
            />
            <TimeBlock 
                title="Tarde" 
                slots={afternoon} 
                icon={CloudSun} 
                theme={{ bg: 'bg-blue-50', text: 'text-blue-400', glow: 'from-blue-400/5', dot: 'bg-blue-400' }} 
            />
            <TimeBlock 
                title="Noche" 
                slots={evening} 
                icon={Moon} 
                theme={{ bg: 'bg-indigo-50', text: 'text-indigo-400', glow: 'from-indigo-400/5', dot: 'bg-indigo-400' }} 
            />
        </div>
    );
};

const ConfirmStep = ({ formData, service, barber, onConfirm, loading, onChange, errorApi }) => {
    return (
        <motion.section 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start"
        >
            {/* CARD RESUMEN - Estilo Premium Glass */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-black to-neutral-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative bg-white/80 backdrop-blur-2xl p-10 rounded-[2.8rem] border border-black/5 shadow-2xl overflow-hidden">
                    {/* Elementos decorativos de fondo */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-neutral-100 rounded-full blur-3xl opacity-50"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-neutral-400 mb-2">Resumen de Cita</h4>
                                <div className="h-1 w-12 bg-black rounded-full"></div>
                            </div>
                            <div className="bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase">
                                Confirmación
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* SERVICIO */}
                            <div className="flex items-start gap-5">
                                <div className="p-4 bg-neutral-50 rounded-2xl">
                                    <Scissors className="text-black" size={24} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-neutral-400 block mb-1">Servicio seleccionado</label>
                                    <p className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">{service?.nombre || "Corte de Pelo"}</p>
                                    <div className="flex items-center gap-2 mt-2 text-neutral-500">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{service?.duracion || 30} MINUTOS</span>
                                    </div>
                                </div>
                            </div>

                            {/* BARBERO Y FECHA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                                        {barber?.foto ? (
                                            <img src={barber.foto} className="w-full h-full object-cover" alt={barber.nombre} />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">Especialista</label>
                                        <p className="font-black uppercase text-sm tracking-tight">{barber?.nombre}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 bg-neutral-50 rounded-xl text-neutral-400">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">Fecha y Hora</label>
                                        <p className="font-black uppercase text-sm tracking-tight">
                                            {dayjs(formData.fecha).format('DD MMM')} • {formData.hora}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PRECIO FINAL */}
                            <div className="pt-10 border-t border-black/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-black uppercase text-[10px] tracking-widest text-neutral-400">Precio</span>
                                </div>
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

            {/* FORMULARIO - Estilo Clean & High Tech */}
            <div className="flex flex-col h-full py-4">
                <div className="mb-10 text-center lg:text-left">
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Tus Datos</h3>
                    <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-[0.2em]">Necesarios para validar tu espacio</p>
                </div>

                <div className="space-y-5">
                    <div className="group relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-black transition-colors">
                            <User size={18} />
                        </div>
                        <input
                            required
                            placeholder="NOMBRE COMPLETO"
                            className="w-full pl-16 p-6 rounded-[1.5rem] border border-black/5 bg-white font-black text-sm tracking-widest outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                            value={formData.nombreCliente}
                            onChange={(e) => onChange('nombreCliente', e.target.value)}
                            autoComplete="name"
                        />
                    </div>

                    <div className="group relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-black transition-colors">
                            <Clock size={18} className="rotate-45" />
                        </div>
                        <input
                            required
                            placeholder="EMAIL DE CONTACTO"
                            type="email"
                            className="w-full pl-16 p-6 rounded-[1.5rem] border border-black/5 bg-white font-black text-sm tracking-widest outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                            value={formData.emailCliente}
                            onChange={(e) => onChange('emailCliente', e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="group relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-black transition-colors">
                            <CheckCircle2 size={18} />
                        </div>
                        <input
                            placeholder="TELÉFONO (OPCIONAL)"
                            type="tel"
                            className="w-full pl-16 p-6 rounded-[1.5rem] border border-black/5 bg-white font-black text-sm tracking-widest outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                            value={formData.telefonoCliente}
                            onChange={(e) => onChange('telefonoCliente', e.target.value)}
                            autoComplete="tel"
                        />
                    </div>

                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.15em] px-2 text-center lg:text-left">
                        🔒 Tu información está protegida por encriptación de grado militar
                    </p>

                    {errorApi && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border-2 border-red-500/10 rounded-2xl p-5 text-center"
                        >
                            <p className="text-red-600 font-black uppercase text-[10px] tracking-widest leading-relaxed">
                                {errorApi}
                            </p>
                        </motion.div>
                    )}

                    <div className="pt-6">
                        <button 
                            onClick={onConfirm} 
                            disabled={loading || !formData.nombreCliente || !formData.emailCliente} 
                            className="relative w-full overflow-hidden group/btn"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-black translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                            <div className={`relative flex items-center justify-center gap-4 py-7 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] transition-all duration-300 ${loading ? 'bg-neutral-100 text-neutral-400' : 'bg-black text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-none translate-y-0 hover:translate-y-1'}`}>
                                {loading ? (
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.div 
                                                    key={i}
                                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                    className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
                                                />
                                            ))}
                                        </div>
                                        <span>PROCESANDO RESERVA</span>
                                    </div>
                                ) : (
                                    <>
                                        AGENDAR AHORA
                                        <span className="opacity-50 group-hover/btn:translate-x-1 transition-transform">→</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};


const SuccessScreen = ({ formData, service, barberia }) => {
    const generateGoogleUrl = () => {
        const start = dayjs(`${formData.fecha}T${formData.hora}:00`);
        const end = start.add(service?.duracion || 30, 'minute');
        const fmt = (d) => d.format('YYYYMMDDTHHmmss');

        const text = encodeURIComponent(`Cita en ${barberia?.nombre}: ${service?.nombre}`);
        const dates = `${fmt(start)}/${fmt(end)}`;
        const details = encodeURIComponent(`Cita confirmada con ${barberia?.nombre}. Servicio: ${service?.nombre}. Ubicación: ${barberia?.direccion || ''}`);

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
    };

    const generateOutlookUrl = () => {
        const start = dayjs(`${formData.fecha}T${formData.hora}:00`);
        const end = start.add(service?.duracion || 30, 'minute');

        const subject = encodeURIComponent(`Cita en ${barberia?.nombre}: ${service?.nombre}`);
        const startdt = start.format('YYYY-MM-DDTHH:mm:ss');
        const enddt = end.format('YYYY-MM-DDTHH:mm:ss');
        const body = encodeURIComponent(`Cita confirmada con ${barberia?.nombre}. Servicio: ${service?.nombre}.`);

        return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${subject}&startdt=${startdt}&enddt=${enddt}&body=${body}`;
    };

    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="text-center py-20 px-4 max-w-3xl mx-auto"
        >
            <div className="relative w-32 h-32 mx-auto mb-10">
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
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
                <motion.a
                    whileHover={{ y: -5 }}
                    href={generateGoogleUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-4 p-8 bg-white border border-black/5 rounded-[2rem] hover:shadow-xl transition-all group"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-10 h-10 group-hover:scale-110 transition-transform" alt="Google" />
                    <div>
                        <span className="block font-black uppercase text-[10px] tracking-widest text-neutral-400 mb-1">Añadir a</span>
                        <span className="block font-black uppercase text-xs tracking-tighter">Google Calendar</span>
                    </div>
                </motion.a>
                <motion.a
                    whileHover={{ y: -5 }}
                    href={generateOutlookUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-4 p-8 bg-white border border-black/5 rounded-[2rem] hover:shadow-xl transition-all group"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" className="w-10 h-10 group-hover:scale-110 transition-transform" alt="Outlook" />
                    <div>
                        <span className="block font-black uppercase text-[10px] tracking-widest text-neutral-400 mb-1">Añadir a</span>
                        <span className="block font-black uppercase text-xs tracking-tighter">Outlook / Office</span>
                    </div>
                </motion.a>
            </div>

            <button 
                onClick={() => window.location.reload()} 
                className="group relative px-16 py-6 bg-black text-white rounded-full font-black uppercase text-xs tracking-[0.4em] overflow-hidden transition-all hover:pr-20"
            >
                <span className="relative z-10">Finalizar Experiencia</span>
                <span className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span>
            </button>
        </motion.div>
    );
};

const LoadingScreen = () => (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-6" />
        <p className="font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Cargando Experiencia</p>
    </div>
);