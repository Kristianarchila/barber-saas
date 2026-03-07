import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User,
    ArrowLeft,
    Calendar,
    Save,
    Camera,
    FileText,
    Scissors,
    Clock,
    Plus,
    Phone,
    Mail,
    MessageCircle,
    Loader2,
    Edit3,
    X
} from "lucide-react";
import { getFichaTecnica, updateNotasGenerales, agregarRegistroHistorial } from "../../../services/crmService";
import { getClienteById } from "../../../services/clientesService";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

export default function FichaTecnica() {
    const { id } = useParams();
    const navigate = useNavigate();
    const slug = window.location.pathname.split("/")[1];

    const [cliente, setCliente] = useState(null);
    const [ficha, setFicha] = useState(null);
    const [loading, setLoading] = useState(true);

    const [notasGenerales, setNotasGenerales] = useState("");
    const [isEditingNotas, setIsEditingNotas] = useState(false);
    const [savingNotas, setSavingNotas] = useState(false);

    const [showNewEntry, setShowNewEntry] = useState(false);
    const [savingEntry, setSavingEntry] = useState(false);
    const [newEntryData, setNewEntryData] = useState({ notaTecnica: "", fotos: [] });

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clienteData, fichaData] = await Promise.all([
                getClienteById(id),
                getFichaTecnica(id)
            ]);
            setCliente(clienteData);
            setFicha(fichaData);
            setNotasGenerales(fichaData?.notasGenerales || "");
        } catch (error) {
            console.error("Error cargando ficha:", error);
            toast.error("Error al cargar la ficha del cliente");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotas = async () => {
        setSavingNotas(true);
        try {
            await updateNotasGenerales(id, notasGenerales);
            toast.success("Preferencias guardadas");
            setIsEditingNotas(false);
        } catch (error) {
            toast.error("Error al guardar preferencias");
        } finally {
            setSavingNotas(false);
        }
    };

    const handleSaveEntry = async () => {
        if (!newEntryData.notaTecnica.trim()) {
            toast.error("Escribe al menos una nota técnica");
            return;
        }
        setSavingEntry(true);
        try {
            await agregarRegistroHistorial(id, {
                notaTecnica: newEntryData.notaTecnica,
                fotos: newEntryData.fotos
            });
            toast.success("Registro guardado");
            setShowNewEntry(false);
            setNewEntryData({ notaTecnica: "", fotos: [] });
            fetchData();
        } catch (error) {
            toast.error("Error al guardar registro");
        } finally {
            setSavingEntry(false);
        }
    };

    const whatsappUrl = (tel) => `https://wa.me/${tel?.replace(/\D/g, "")}`;

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-24 lg:pb-8 space-y-8 animate-slide-in">

            {/* HEADER */}
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/${slug}/admin/clientes`)}
                    className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all"
                >
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="heading-2 text-gray-900">{cliente?.nombre}</h1>
                    <p className="body text-gray-400">Ficha Técnica & Historial de Cortes</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── COLUMNA IZQUIERDA ── */}
                <div className="space-y-6">

                    {/* INFO CLIENTE */}
                    <div className="card card-padding shadow-sm ring-1 ring-gray-100">
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
                            <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-4 shadow">
                                <span className="text-3xl font-black text-blue-600">
                                    {cliente?.nombre?.charAt(0)}
                                </span>
                            </div>
                            <h2 className="heading-3 text-gray-900">{cliente?.nombre}</h2>

                            {/* Email */}
                            <div className="flex items-center gap-2 mt-2 text-gray-500 body-small">
                                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{cliente?.email}</span>
                            </div>

                            {/* Teléfono / WhatsApp */}
                            {cliente?.telefono ? (
                                <a
                                    href={whatsappUrl(cliente.telefono)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 mt-2 body-small text-green-600 hover:text-green-700 font-semibold transition-colors"
                                >
                                    <Phone size={14} />
                                    {cliente.telefono}
                                </a>
                            ) : (
                                <p className="body-small text-gray-300 mt-2 italic flex items-center gap-2">
                                    <Phone size={14} />
                                    Sin teléfono
                                </p>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-5">
                            <div className="text-center">
                                <p className="caption text-gray-400 font-bold uppercase tracking-widest">Visitas</p>
                                <p className="text-2xl font-black text-gray-900">{ficha?.historialServicios?.length || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="caption text-gray-400 font-bold uppercase tracking-widest">Desde</p>
                                <p className="text-2xl font-black text-gray-900">{dayjs(cliente?.createdAt).format('YYYY')}</p>
                            </div>
                        </div>

                        {/* Botón WhatsApp grande */}
                        {cliente?.telefono && (
                            <a
                                href={whatsappUrl(cliente.telefono)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all shadow-sm"
                            >
                                <MessageCircle size={18} />
                                Contactar por WhatsApp
                            </a>
                        )}
                    </div>

                    {/* PREFERENCIAS / NOTAS GENERALES */}
                    <div className="card card-padding shadow-sm ring-1 ring-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="heading-4 flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" />
                                Preferencias
                            </h3>
                            {!isEditingNotas ? (
                                <button
                                    onClick={() => setIsEditingNotas(true)}
                                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <Edit3 size={14} /> Editar
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingNotas(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button
                                        onClick={handleSaveNotas}
                                        disabled={savingNotas}
                                        className="flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700"
                                    >
                                        {savingNotas ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Guardar
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditingNotas ? (
                            <textarea
                                className="input resize-none min-h-[140px] text-sm"
                                value={notasGenerales}
                                onChange={(e) => setNotasGenerales(e.target.value)}
                                placeholder="Ej: Piel sensible, prefiere navaja 0.5, no gel..."
                            />
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] border border-gray-100">
                                {notasGenerales ? (
                                    <p className="body-small text-gray-700 whitespace-pre-wrap leading-relaxed">{notasGenerales}</p>
                                ) : (
                                    <p className="body-small text-gray-400 italic">Sin preferencias anotadas aún.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── COLUMNA DERECHA: HISTORIAL ── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="heading-3 flex items-center gap-2">
                            <Scissors className="text-blue-600" size={22} />
                            Historial de Cortes
                        </h3>
                        <button
                            onClick={() => setShowNewEntry(!showNewEntry)}
                            className="btn btn-primary"
                        >
                            <Plus size={16} />
                            Nuevo Registro
                        </button>
                    </div>

                    {/* FORMULARIO NUEVA ENTRADA */}
                    {showNewEntry && (
                        <div className="card card-padding ring-2 ring-blue-200 shadow-sm animate-slide-in">
                            <h4 className="heading-4 mb-4">Registrar Servicio de Hoy</h4>
                            <textarea
                                className="input resize-none min-h-[100px] mb-4"
                                placeholder="Detalles técnicos del corte realizado hoy..."
                                value={newEntryData.notaTecnica}
                                onChange={(e) => setNewEntryData({ ...newEntryData, notaTecnica: e.target.value })}
                            />
                            <div className="flex justify-end gap-3">
                                <button className="btn btn-ghost" onClick={() => setShowNewEntry(false)}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveEntry}
                                    disabled={savingEntry}
                                >
                                    {savingEntry ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {savingEntry ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TIMELINE */}
                    <div className="space-y-6">
                        {ficha?.historialServicios?.length > 0 ? (
                            ficha.historialServicios.map((servicio, idx) => (
                                <div key={idx} className="relative pl-8 border-l-2 border-gray-200 hover:border-blue-300 transition-colors pb-8 last:pb-0">
                                    {/* Punto de línea de tiempo */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow" />

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="badge bg-blue-50 text-blue-700 ring-1 ring-blue-200 font-bold">
                                                {dayjs(servicio.fecha).format('DD MMM YYYY')}
                                            </span>
                                            <span className="body-small text-gray-400 flex items-center gap-1">
                                                <Clock size={13} />
                                                {dayjs(servicio.fecha).format('HH:mm')}
                                            </span>
                                        </div>
                                        <span className="caption text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                                            {servicio.servicioId?.nombre || "Corte General"}
                                        </span>
                                    </div>

                                    <div className="card card-padding shadow-sm hover:shadow-md transition-all">
                                        <p className="body text-gray-700 leading-relaxed mb-4">
                                            {servicio.notaTecnica || <span className="italic text-gray-400">Sin notas técnicas.</span>}
                                        </p>

                                        {servicio.fotos?.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                                                {servicio.fotos.map((foto, i) => (
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden group cursor-pointer border border-gray-100">
                                                        <img src={foto} alt="Corte" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-300 caption italic border-t border-gray-100 pt-3 mt-2">
                                                <Camera size={13} />
                                                Sin fotos adjuntas
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 body-small text-gray-400 border-t border-gray-100 pt-3 mt-3">
                                            <User size={13} />
                                            Realizado por <strong className="text-gray-700">{servicio.barberoId?.nombre || "Barbero"}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card card-padding py-20 text-center shadow-sm">
                                <Scissors size={44} className="mx-auto text-gray-200 mb-4" />
                                <h4 className="heading-4 text-gray-600 mb-1">Sin historial aún</h4>
                                <p className="body text-gray-400">Registra el primer corte para empezar el seguimiento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
