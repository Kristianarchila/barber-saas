import { useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Clock, Search, Scissors, Loader2, User, CheckCircle2
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
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(['fecha', 'barberoId', 'servicioId'].includes(name) && { hora: "" })
        }));
    };

    // --- FETCH AVAILABLE TURNOS ---
    useEffect(() => {
        // F-02 FIX: AbortController prevents stale fetch results from appearing
        // if the user selects date/barber/service rapidly
        const abortController = new AbortController();

        const fetchTurnos = async () => {
            if (!formData.fecha || !formData.barberoId || !formData.servicioId || !slug) return;
            setLoadingTurnos(true);
            setTurnosDisponibles([]);
            try {
                const data = await getDisponibilidadBySlug(slug, formData.barberoId, formData.fecha, formData.servicioId);
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

        // Debounce: 300ms before triggering the fetch
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
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900">
            {/* HEADER COMPACTO */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
                <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 flex items-center justify-between gap-2">
                    <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0">
                        <ChevronLeft size={22} />
                    </button>
                    <h1 className="font-black uppercase tracking-tighter text-base md:text-2xl truncate text-center">{barberia?.nombre}</h1>
                    {/* Indicador de paso */}
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex-shrink-0">{step}/4</span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.section key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* TÍTULO */}
                            <div className="mb-6 md:mb-10">
                                <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-2">
                                    Servicios<span className="text-transparent" style={{ WebkitTextStroke: '1px #000' }}>.</span>
                                </h2>
                                <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                                    {serviciosFiltrados.length} servicios disponibles
                                </p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="BUSCAR..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-black/10 py-2.5 text-xs font-black tracking-widest outline-none focus:border-black transition-all"
                                    />
                                    <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-black/20" size={15} />
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                        <motion.section key="step2" className="max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-8">Elige tu barbero</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                                {barberos.map(b => (
                                    <BarberCard key={b._id} barber={b} isSelected={formData.barberoId === b._id} onSelect={() => { handleSelect('barberoId', b._id); setStep(3); }} />
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {step === 3 && (
                        <motion.section key="step3" className="max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-6 md:mb-10">Horario</h2>
                            <DatePicker selectedDate={formData.fecha} onSelect={(d) => handleSelect('fecha', d)} />
                            <div className="mt-10">
                                <TimeGrid turnos={turnosDisponibles} selectedTime={formData.hora} loading={loadingTurnos} onSelect={(t) => handleSelect('hora', t)} />
                            </div>

                            {/* AI Suggestions Box */}
                            <AISuggestionBox
                                suggestion={aiSuggestion}
                                onSelectSlot={handleSelectAISlot}
                                loading={loadingAI}
                            />

                            {/* No slots available - Show waiting list option as fallback */}
                            {!loadingTurnos && !loadingAI && turnosDisponibles.length === 0 && !aiSuggestion?.slots?.length && formData.fecha && (
                                <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">No hay horarios disponibles</h3>
                                    <p className="text-neutral-600 mb-6">¿Quieres que te notifiquemos cuando se libere un horario?</p>
                                    <button
                                        onClick={() => setShowWaitingListModal(true)}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:from-purple-700 hover:to-indigo-700 transition-all"
                                    >
                                        Unirse a Lista de Espera
                                    </button>
                                </div>
                            )}

                            <button disabled={!formData.hora} onClick={() => setStep(4)} className="w-full mt-10 bg-black text-white py-6 rounded-2xl font-black uppercase tracking-widest disabled:opacity-10 transition-all">
                                Confirmar Datos
                            </button>
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
        className="group bg-white rounded-[1.8rem] overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-500 cursor-pointer"
    >
        <div className="relative h-40 sm:h-48 md:h-64 bg-neutral-100 overflow-hidden">
            {service.imagen ? (
                <img src={service.imagen} alt={service.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
                <div className="w-full h-full flex items-center justify-center"><Scissors size={32} className="text-black/5" /></div>
            )}
            <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full">
                <span className="text-sm md:text-lg font-black tracking-tighter">${service.precio}</span>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Premium</span>
            </div>
        </div>

        <div className="p-4 md:p-8">
            <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter mb-1.5 leading-none">{service.nombre}</h3>
            <p className="text-neutral-400 text-xs font-medium mb-4 line-clamp-2">{service.descripcion || "Servicio especializado de alta gama."}</p>
            <div className="flex items-center justify-between pt-5 border-t border-black/5">
                <div className="flex items-center gap-2 text-black/30">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{service.duracion} MIN</span>
                </div>
                <div className="font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                    Reservar <span>→</span>
                </div>
            </div>
        </div>
    </motion.div>
);

const BarberCard = ({ barber, isSelected, onSelect }) => (
    <div onClick={onSelect} className={`p-6 md:p-8 rounded-[2rem] border-2 transition-all cursor-pointer text-center ${isSelected ? 'border-black bg-white' : 'border-black/5 bg-white/50 hover:border-black/20'}`}>
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-neutral-100 overflow-hidden shadow-inner">
            {barber.foto ? <img src={barber.foto} className="w-full h-full object-cover" /> : <User className="m-auto mt-4 text-black/10" size={32} />}
        </div>
        <h3 className="font-black uppercase tracking-tighter text-sm md:text-base">{barber.nombre}</h3>
    </div>
);

const DatePicker = ({ selectedDate, onSelect }) => {
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i); return d;
    });
    // Format date as YYYY-MM-DD using LOCAL timezone (not UTC)
    const toLocalISO = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {dates.map(d => {
                const iso = toLocalISO(d);
                const active = selectedDate === iso;
                return (
                    <button key={iso} onClick={() => onSelect(iso)} className={`flex-shrink-0 w-16 h-24 md:w-20 md:h-28 rounded-3xl flex flex-col items-center justify-center transition-all ${active ? 'bg-black text-white scale-105' : 'bg-white border border-black/5 text-neutral-400 hover:border-black/20'}`}>
                        <span className="text-[9px] font-black uppercase mb-1">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                        <span className="text-2xl md:text-3xl font-black">{d.getDate()}</span>
                    </button>
                );
            })}
        </div>
    );
};

// M-02 FIX: grid-cols-3 on mobile (was 4 → <72px wide), min-h-[48px] for touch target
const TimeGrid = ({ turnos, selectedTime, onSelect, loading }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-4">
        {loading ? Array(8).fill(0).map((_, i) => <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-xl" />)
            : turnos.map(t => (
                <button key={t} onClick={() => onSelect(t)} className={`min-h-[48px] py-2 md:py-5 rounded-xl md:rounded-2xl border-2 font-black text-xs md:text-sm transition-all ${selectedTime === t ? 'bg-black text-white border-black' : 'bg-white border-black/5 hover:border-black'}`}>
                    {t}
                </button>
            ))}
    </div>
);

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
                                    <span className="font-black uppercase text-[10px] tracking-widest text-neutral-400">Inversión</span>
                                    <span className="text-neutral-400 text-xs">Pago en establecimiento</span>
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