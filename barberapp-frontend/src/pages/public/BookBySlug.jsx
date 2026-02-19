import { useEffect, useState, useMemo, useCallback } from "react";
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

    // --- AI SUGGESTIONS LOGIC ---
    useEffect(() => {
        const fetchAISuggestions = async () => {
            if (!loadingTurnos && turnosDisponibles.length === 0 && formData.fecha && formData.barberoId && formData.servicioId) {
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

                            {/* CATEGORÍAS PILLS */}
                            <div className="flex gap-2 md:gap-4 overflow-x-auto pb-8 no-scrollbar">
                                {categorias.map((cat) => (
                                    <button
                                        key={cat.nombre}
                                        onClick={() => setSelectedCategory(cat.nombre)}
                                        className={`px-6 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${selectedCategory === cat.nombre ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'
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
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {dates.map(d => {
                const iso = d.toISOString().split('T')[0];
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

const TimeGrid = ({ turnos, selectedTime, onSelect, loading }) => (
    <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-4">
        {loading ? Array(8).fill(0).map((_, i) => <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-xl" />)
            : turnos.map(t => (
                <button key={t} onClick={() => onSelect(t)} className={`py-3 md:py-5 rounded-xl md:rounded-2xl border-2 font-black text-xs md:text-sm transition-all ${selectedTime === t ? 'bg-black text-white border-black' : 'bg-white border-black/5 hover:border-black'}`}>
                    {t}
                </button>
            ))}
    </div>
);

const ConfirmStep = ({ formData, service, barber, onConfirm, loading, onChange, errorApi }) => {
    return (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-xl">
                <h4 className="font-black uppercase text-[10px] tracking-widest text-neutral-400 mb-8">Resumen de Cita</h4>
                <div className="space-y-6">
                    <div>
                        <label className="text-[9px] font-black uppercase text-neutral-400 block mb-1">Servicio</label>
                        <p className="text-2xl font-black uppercase tracking-tighter">{service?.nombre}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[9px] font-black uppercase text-neutral-400 block mb-1">Especialista</label>
                            <p className="font-black uppercase text-sm">{barber?.nombre}</p>
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-neutral-400 block mb-1">Fecha</label>
                            <p className="font-black uppercase text-sm">{formData.fecha} - {formData.hora}</p>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-black/5 flex justify-between items-end">
                        <span className="font-black uppercase text-xs">Total</span>
                        <span className="text-4xl font-black tracking-tighter">${service?.precio}</span>
                    </div>
                </div>
            </div>
            <div className="space-y-4 flex flex-col justify-center">
                <input placeholder="NOMBRE COMPLETO" className="w-full p-6 rounded-2xl border border-black/10 font-black text-xs tracking-widest outline-none focus:border-black transition-all" value={formData.nombreCliente} onChange={(e) => onChange('nombreCliente', e.target.value)} />
                <input placeholder="CORREO ELECTRÓNICO" type="email" className="w-full p-6 rounded-2xl border border-black/10 font-black text-xs tracking-widest outline-none focus:border-black transition-all" value={formData.emailCliente} onChange={(e) => onChange('emailCliente', e.target.value)} />
                <input placeholder="TELÉFONO (OPCIONAL)" type="tel" className="w-full p-6 rounded-2xl border border-black/10 font-black text-xs tracking-widest outline-none focus:border-black transition-all" value={formData.telefonoCliente} onChange={(e) => onChange('telefonoCliente', e.target.value)} />

                {errorApi && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center animate-in fade-in duration-300">
                        <p className="text-red-600 font-bold text-sm">{errorApi}</p>
                    </div>
                )}

                <button onClick={onConfirm} disabled={loading || !formData.nombreCliente || !formData.emailCliente} className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-neutral-900 transition-all disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" /> : "AGENDAR AHORA"}
                </button>
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
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12 px-4 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <CheckCircle2 size={48} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">¡Confirmado!</h2>
            <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-12">Recibirás un email con los detalles de tu cita.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                <a
                    href={generateGoogleUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-4 bg-white border border-black/10 rounded-2xl hover:bg-neutral-50 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-5 h-5" alt="Google" />
                    Google Calendar
                </a>
                <a
                    href={generateOutlookUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-4 bg-white border border-black/10 rounded-2xl hover:bg-neutral-50 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" className="w-5 h-5" alt="Outlook" />
                    Outlook / Hotmail
                </a>
            </div>

            <button onClick={() => window.location.reload()} className="w-full md:w-auto px-12 py-5 bg-black text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-neutral-900 transition-all">
                Finalizar
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