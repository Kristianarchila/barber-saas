import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Clock, CheckCircle2, ArrowRight,
    Star, AlertCircle, Calendar, User, Scissors
} from "lucide-react";
import { useBarberia } from "../../context/BarberiaContext";
import {
    getDisponibilidadBySlug,
    crearReservaBySlug
} from "../../services/publicService";
import ListaResenas from "../../components/ListaResenas";
import { motion, AnimatePresence } from "framer-motion";

// Componente Interno para Pantalla de Carga
const LoadingScreen = () => (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative mb-4">
            <div className="w-16 h-16 border border-gold/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-t-2 border-gold rounded-full animate-spin" />
        </div>
        <p className="text-gold tracking-[0.3em] text-[10px] uppercase font-black animate-pulse">
            {window.location.pathname.includes('reagendar') ? "Preparando Reagendamiento" : "Preparando Experiencia"}
        </p>
    </div>
);

export default function BookBySlug() {
    const { slug, rescheduleToken } = useParams(); // Soporta ambas rutas
    const location = useLocation();
    const navigate = useNavigate();

    // Traemos datos del contexto con valores por defecto para evitar errores de undefined
    const {
        barberia,
        barberos = [],
        servicios = [],
        loading: loadingContext
    } = useBarberia();

    // --- ESTADOS DE FLUJO ---
    const [step, setStep] = useState(1);
    const [turnosDisponibles, setTurnosDisponibles] = useState([]);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [reservando, setReservando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    // --- FORMULARIO ---
    const [formData, setFormData] = useState({
        barberoId: location.state?.barberoId || "",
        servicioId: "",
        fecha: "",
        hora: "",
        nombreCliente: "",
        emailCliente: ""
    });

    const isRescheduling = !!rescheduleToken;

    // --- LÓGICA DE PRECARGA PARA REAGENDAR ---
    useEffect(() => {
        if (isRescheduling) {
            const fetchOriginal = async () => {
                try {
                    const { prefill, nombreCliente, emailCliente } = await getReservaByToken(rescheduleToken);
                    setFormData(prev => ({
                        ...prev,
                        barberoId: prefill.barberoId,
                        servicioId: prefill.servicioId,
                        nombreCliente,
                        emailCliente
                    }));
                    setStep(3); // Directo a elegir fecha/hora
                } catch (err) {
                    setErrorApi("El enlace de reagendamiento no es válido o ha expirado.");
                }
            };
            fetchOriginal();
        }
    }, [rescheduleToken, isRescheduling]);

    // --- LÓGICA DE CARGA DE TURNOS ---
    const cargarDisponibilidad = useCallback(async () => {
        // Solo disparamos si tenemos los 3 datos clave
        if (!formData.barberoId || !formData.fecha || !formData.servicioId) return;

        setLoadingTurnos(true);
        setErrorApi(null);
        try {
            const data = await getDisponibilidadBySlug(
                slug,
                formData.barberoId,
                formData.fecha,
                formData.servicioId
            );
            setTurnosDisponibles(data.turnosDisponibles || []);
        } catch (error) {
            console.error("Error cargando turnos:", error);
            setErrorApi("No hay turnos disponibles para esta selección.");
            setTurnosDisponibles([]);
        } finally {
            setLoadingTurnos(false);
        }
    }, [slug, formData.barberoId, formData.fecha, formData.servicioId]);

    useEffect(() => {
        cargarDisponibilidad();
    }, [cargarDisponibilidad]);

    // --- MANEJADORES ---
    const handleSelect = (name, value) => {
        setFormData(prev => {
            // Si cambia fecha, barbero o servicio, la hora seleccionada anteriormente ya no es válida
            const resetHora = ['fecha', 'barberoId', 'servicioId'].includes(name);
            return {
                ...prev,
                [name]: value,
                ...(resetHora && { hora: "" })
            };
        });
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleConfirmarReserva = async () => {
        setReservando(true);
        setErrorApi(null);
        try {
            if (isRescheduling) {
                await reagendarReservaByToken(rescheduleToken, formData);
            } else {
                await crearReservaBySlug(slug, formData.barberoId, formData);
            }
            setStep(5); // Paso de éxito
        } catch (e) {
            setErrorApi(e.response?.data?.message || 'Error al procesar la reserva. Intente nuevamente.');
        } finally {
            setReservando(false);
        }
    };

    // --- VALORES CALCULADOS ---
    const selectedService = useMemo(() => servicios.find(s => s._id === formData.servicioId), [formData.servicioId, servicios]);
    const selectedBarber = useMemo(() => barberos.find(b => b._id === formData.barberoId), [formData.barberoId, barberos]);

    const turnosFiltrados = useMemo(() => {
        if (!formData.fecha || turnosDisponibles.length === 0) return [];

        const hoy = new Date();
        const fechaSeleccionada = formData.fecha;
        const hoyISO = hoy.toISOString().split('T')[0];

        // Si el día seleccionado es hoy, filtramos las horas pasadas
        if (fechaSeleccionada === hoyISO) {
            const horaActual = hoy.getHours();
            const minActual = hoy.getMinutes();

            return turnosDisponibles.filter(t => {
                const [h, m] = t.split(':').map(Number);
                if (h > horaActual) return true;
                if (h === horaActual && m > minActual) return true;
                return false;
            });
        }

        return turnosDisponibles;
    }, [formData.fecha, turnosDisponibles]);

    if (loadingContext) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-gold/30">
            {/* Header Cinemático */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => step > 1 && step < 5 ? prevStep() : navigate(-1)}
                            className="h-10 w-10 border border-black/10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                            <ChevronLeft size={20} className="text-neutral-500" />
                        </motion.button>

                        <div className="text-center">
                            <h1 className="text-gold text-lg font-serif italic tracking-tighter">
                                {barberia?.nombre || "Cargando..."}
                            </h1>
                            <p className="text-[9px] text-neutral-400 font-black uppercase tracking-[0.4em] mt-1">
                                {step < 5 ? (isRescheduling ? `Reagendar Cita • ${step}/4` : `Experiencia de Reserva • ${step}/4`) : "Acción Completada"}
                            </p>
                        </div>
                        <div className="w-10 h-10" /> {/* Spacer */}
                    </div>

                    {/* Barra de Progreso */}
                    <div className="flex gap-4 px-12">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s}
                                className={`h-[3px] flex-1 rounded-full transition-all duration-700 ${s <= step ? 'bg-neutral-900 shadow-sm' : 'bg-neutral-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">

                    {/* PASO 1: SERVICIOS */}
                    {step === 1 && (
                        <motion.section key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                            <div className="text-center space-y-4">
                                <span className="text-gold tracking-[0.5em] text-[10px] uppercase font-black">Paso 01</span>
                                <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter">¿Cuál es tu elección?</h2>
                            </div>
                            <div className="grid gap-6 max-w-2xl mx-auto">
                                {servicios.map(s => (
                                    <motion.div
                                        key={s._id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => { handleSelect('servicioId', s._id); nextStep(); }}
                                        className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer ${formData.servicioId === s._id ? "border-gold bg-white shadow-xl" : "border-black/5 bg-white/50 hover:bg-white"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-serif italic text-2xl">{s.nombre}</h3>
                                                <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-black uppercase mt-2">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {s.duracion} MIN</span>
                                                </div>
                                            </div>
                                            <span className="text-3xl font-serif">${s.precio}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* PASO 2: BARBERO */}
                    {step === 2 && (
                        <motion.section key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            <div className="text-center space-y-4">
                                <span className="text-gold tracking-[0.5em] text-[10px] uppercase font-black">Paso 02</span>
                                <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter">El Maestro</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                                {barberos.map(b => (
                                    <div
                                        key={b._id}
                                        onClick={() => { handleSelect('barberoId', b._id); nextStep(); }}
                                        className={`p-6 rounded-[3rem] text-center border cursor-pointer transition-all ${formData.barberoId === b._id ? "border-gold bg-white shadow-lg" : "border-black/5 bg-white/50"
                                            }`}
                                    >
                                        <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-neutral-100 overflow-hidden border border-black/5 flex items-center justify-center">
                                            {b.foto ? <img src={b.foto} className="object-cover w-full h-full" alt={b.nombre} /> : <User className="text-neutral-300" />}
                                        </div>
                                        <h3 className="font-serif italic text-lg">{b.nombre}</h3>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* PASO 3: FECHA Y HORA */}
                    {step === 3 && (
                        <motion.section key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                            <div className="text-center space-y-4">
                                <span className="text-gold tracking-[0.5em] text-[10px] uppercase font-black">Paso 03</span>
                                <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter">Tu Tiempo</h2>
                            </div>

                            <div className="max-w-xl mx-auto space-y-8">
                                {/* Selector de Fecha Minimalista */}
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                    {[0, 1, 2, 3, 4, 5, 6].map(i => {
                                        const d = new Date(); d.setDate(d.getDate() + i);
                                        const iso = d.toISOString().split('T')[0];
                                        const isSelected = formData.fecha === iso;
                                        return (
                                            <button key={i} onClick={() => handleSelect('fecha', iso)}
                                                className={`flex-shrink-0 w-16 h-24 rounded-full flex flex-col items-center justify-center border transition-all ${isSelected ? "bg-neutral-900 text-white border-neutral-900 scale-105" : "bg-white text-neutral-400 border-black/5"
                                                    }`}
                                            >
                                                <span className="text-[10px] uppercase font-bold">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                                <span className="text-2xl font-serif italic">{d.getDate()}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Grid de Horas */}
                                {formData.fecha && (
                                    <div className="space-y-6">
                                        {errorApi && <p className="text-red-500 text-center text-xs font-bold uppercase">{errorApi}</p>}
                                        <div className="grid grid-cols-3 gap-3">
                                            {loadingTurnos ? (
                                                [1, 2, 3].map(i => <div key={i} className="h-14 bg-neutral-200 animate-pulse rounded-xl" />)
                                            ) : turnosFiltrados.length > 0 ? (
                                                turnosFiltrados.map(t => (
                                                    <button key={t} onClick={() => handleSelect('hora', t)}
                                                        className={`py-4 rounded-xl font-serif italic border transition-all ${formData.hora === t ? "bg-neutral-900 text-white" : "bg-white hover:border-gold"
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="col-span-3 py-10 text-center border border-dashed border-black/10 rounded-2xl">
                                                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest italic">
                                                        No hay más turnos hoy
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    disabled={!formData.hora}
                                    onClick={nextStep}
                                    className="w-full bg-neutral-900 text-white h-16 rounded-full font-black text-[10px] uppercase tracking-widest disabled:opacity-20 transition-all shadow-lg"
                                >
                                    Siguiente Paso
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {/* PASO 4: CONFIRMACIÓN FINAL */}
                    {step === 4 && (
                        <motion.section key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                            <div className="text-center">
                                <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter">Detalles</h2>
                            </div>
                            <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-8">
                                <div className="p-8 rounded-[2rem] bg-white border border-black/5 space-y-4">
                                    <p className="text-[10px] font-black text-gold uppercase tracking-widest">Resumen</p>
                                    <div className="text-xl font-serif italic">
                                        <p>{selectedService?.nombre}</p>
                                        <p className="text-neutral-400 text-sm">{selectedBarber?.nombre}</p>
                                        <p className="mt-4 text-2xl text-neutral-900">{formData.fecha} • {formData.hora}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <input
                                        className="p-4 rounded-xl border border-black/10 focus:border-gold outline-none"
                                        placeholder="Nombre Completo"
                                        value={formData.nombreCliente}
                                        onChange={(e) => handleSelect('nombreCliente', e.target.value)}
                                    />
                                    <input
                                        className="p-4 rounded-xl border border-black/10 focus:border-gold outline-none"
                                        placeholder="Email"
                                        type="email"
                                        value={formData.emailCliente}
                                        onChange={(e) => handleSelect('emailCliente', e.target.value)}
                                    />
                                    <button
                                        onClick={handleConfirmarReserva}
                                        disabled={reservando || !formData.nombreCliente || !formData.emailCliente}
                                        className="bg-neutral-900 text-white h-16 rounded-full font-bold uppercase text-[10px] tracking-widest disabled:opacity-50"
                                    >
                                        {reservando ? "Procesando..." : (isRescheduling ? "Confirmar Cambio" : "Confirmar Cita")}
                                    </button>
                                    {errorApi && <p className="text-red-500 text-[10px] text-center font-bold">{errorApi}</p>}
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* PASO 5: ÉXITO */}
                    {step === 5 && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 space-y-6">
                            <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 size={48} className="text-gold" />
                            </div>
                            <h2 className="text-5xl font-serif italic">Consagrado</h2>
                            <p className="text-neutral-500 max-w-sm mx-auto">Tu cita ha sido registrada. Revisa tu correo para más detalles.</p>
                            <button onClick={() => navigate(`/${slug}`)} className="text-gold uppercase font-black text-[10px] tracking-widest mt-10">
                                Volver al inicio
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}