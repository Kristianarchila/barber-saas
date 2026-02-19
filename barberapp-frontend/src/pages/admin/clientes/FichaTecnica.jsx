import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User,
    ArrowLeft,
    Calendar,
    Save,
    Camera,
    Trash2,
    FileText,
    Scissors,
    Clock,
    Plus
} from "lucide-react";
import { Card, Button, Input, Badge } from "../../../components/ui";
import { getFichaTecnica, updateNotasGenerales, agregarRegistroHistorial } from "../../../services/crmService";
import { getClienteById } from "../../../services/clientesService";
import dayjs from "dayjs";

export default function FichaTecnica() {
    const { id } = useParams();
    const navigate = useNavigate();
    const slug = window.location.pathname.split("/")[1];

    const [cliente, setCliente] = useState(null);
    const [ficha, setFicha] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados para formularios
    const [notasGenerales, setNotasGenerales] = useState("");
    const [isEditingNotas, setIsEditingNotas] = useState(false);

    // Estado para nueva entrada historial
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [newEntryData, setNewEntryData] = useState({
        notaTecnica: "",
        fotos: []
    });

    useEffect(() => {
        fetchData();
    }, [id]);

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
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotas = async () => {
        try {
            await updateNotasGenerales(id, notasGenerales);
            setIsEditingNotas(false);
            fetchData(); // Recargar para asegurar consistencia
        } catch (error) {
            console.error("Error guardando notas:", error);
        }
    };

    const handleSaveEntry = async () => {
        try {
            // Simulamos datos de servicio/barbero por ahora
            await agregarRegistroHistorial(id, {
                notaTecnica: newEntryData.notaTecnica,
                fotos: newEntryData.fotos
            });
            setShowNewEntry(false);
            setNewEntryData({ notaTecnica: "", fotos: [] });
            fetchData();
        } catch (error) {
            console.error("Error agregando entrada:", error);
        }
    };

    if (loading) return <div className="p-8 text-white text-center">Cargando perfil...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-24 lg:pb-8 space-y-8">
            {/* HEADER CON BOTÓN VOLVER */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/${slug}/admin/clientes`)}
                    className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-white">{cliente?.nombre}</h1>
                    <p className="text-neutral-500">Ficha Técnica & Historial</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUMNA IZQUIERDA: RESUMEN Y NOTAS GENERALES */}
                <div className="space-y-8">
                    {/* INFO CLIENTE */}
                    <Card className="bg-neutral-900 border-neutral-800 p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-black border-2 border-neutral-700 flex items-center justify-center mb-4 shadow-xl">
                                <span className="text-4xl font-black text-primary-500">
                                    {cliente?.nombre?.charAt(0)}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{cliente?.nombre}</h2>
                            <p className="text-neutral-500 text-sm mb-4">{cliente?.email}</p>

                            <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-neutral-800">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-neutral-600">Visitas</p>
                                    <p className="text-lg font-bold text-white">{ficha?.historialServicios?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-neutral-600">Miembro desde</p>
                                    <p className="text-lg font-bold text-white">{dayjs(cliente?.createdAt).format('YYYY')}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* PREFERENCIAS / NOTAS GENERALES */}
                    <Card className="bg-neutral-900 border-neutral-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText size={18} className="text-primary-500" />
                                Preferencias
                            </h3>
                            {!isEditingNotas ? (
                                <button
                                    onClick={() => setIsEditingNotas(true)}
                                    className="text-xs font-bold text-primary-500 hover:underline"
                                >
                                    EDITAR
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveNotas}
                                    className="text-xs font-bold text-success-500 hover:underline flex items-center gap-1"
                                >
                                    <Save size={12} /> GUARDAR
                                </button>
                            )}
                        </div>

                        {isEditingNotas ? (
                            <textarea
                                className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-white text-sm min-h-[150px] focus:border-primary-500 outline-none"
                                value={notasGenerales}
                                onChange={(e) => setNotasGenerales(e.target.value)}
                                placeholder="Ej: Piel sensible, prefiere navaja 0.5, café sin azúcar..."
                            />
                        ) : (
                            <div className="bg-black/30 rounded-xl p-4 min-h-[100px] border border-neutral-800/50">
                                {notasGenerales ? (
                                    <p className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed">
                                        {notasGenerales}
                                    </p>
                                ) : (
                                    <p className="text-neutral-600 text-sm italic">
                                        No hay notas generales registradas.
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* COLUMNA DERECHA: HISTORIAL TÉCNICO VIRTUAL */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Scissors className="text-primary-500" />
                            Historial de Cortes
                        </h3>
                        <Button
                            onClick={() => setShowNewEntry(!showNewEntry)}
                            variant="primary"
                            className="rounded-xl shadow-glow-primary text-xs"
                        >
                            <Plus size={16} className="mr-2" />
                            Nuevo Registro
                        </Button>
                    </div>

                    {/* FORMULARIO NUEVA ENTRADA */}
                    {showNewEntry && (
                        <Card className="bg-neutral-900 border border-primary-500/30 p-6 animate-in fade-in slide-in-from-top-4">
                            <h4 className="font-bold text-white mb-4">Registrar Servicio de Hoy</h4>
                            <textarea
                                className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-white text-sm min-h-[100px] mb-4"
                                placeholder="Detalles técnicos del corte realizado hoy..."
                                value={newEntryData.notaTecnica}
                                onChange={(e) => setNewEntryData({ ...newEntryData, notaTecnica: e.target.value })}
                            />

                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowNewEntry(false)} className="text-neutral-400">
                                    Cancelar
                                </Button>
                                <Button variant="primary" onClick={handleSaveEntry}>
                                    Guardar Historial
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* TIMELINE */}
                    <div className="space-y-6">
                        {ficha?.historialServicios?.length > 0 ? (
                            ficha.historialServicios.map((servicio, idx) => (
                                <div key={idx} className="relative pl-8 border-l-2 border-neutral-800 hover:border-primary-500/50 transition-colors pb-8 last:pb-0">
                                    {/* PUNTO DE TIEMPO */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-neutral-900 border-2 border-primary-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>

                                    {/* HEADER DEL EVENTO */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="bg-neutral-800 border-neutral-700 text-white font-bold">
                                                {dayjs(servicio.fecha).format('DD MMM YYYY')}
                                            </Badge>
                                            <span className="text-neutral-500 text-sm flex items-center gap-1">
                                                <Clock size={14} />
                                                {dayjs(servicio.fecha).format('HH:mm')}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-primary-500 mt-2 sm:mt-0 uppercase tracking-widest bg-primary-500/10 px-2 py-1 rounded-lg">
                                            {servicio.servicioId?.nombre || "Corte General"}
                                        </div>
                                    </div>

                                    {/* CARD DE DETALLES */}
                                    <Card className="bg-neutral-900 border-neutral-800 p-5 hover:border-neutral-700 transition-all">
                                        <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                                            {servicio.notaTecnica || "Sin notas técnicas registradas."}
                                        </p>

                                        {/* GALERÍA DE FOTOS (Placeholder hasta integrar Cloudinary) */}
                                        {servicio.fotos && servicio.fotos.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                                                {servicio.fotos.map((foto, i) => (
                                                    <div key={i} className="aspect-square rounded-lg bg-neutral-800 overflow-hidden relative group cursor-pointer">
                                                        <img src={foto} alt="Corte" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-2 text-neutral-600 text-xs italic">
                                                <Camera size={14} />
                                                Sin fotos adjuntas
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between items-center">
                                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                <User size={12} />
                                                Realizado por <strong className="text-white">{servicio.barberoId?.nombre || "Barbero"}</strong>
                                            </span>
                                        </div>
                                    </Card>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800 border-dashed">
                                <Scissors size={48} className="mx-auto text-neutral-800 mb-4" />
                                <p className="text-neutral-500 font-bold">No hay historial registrado</p>
                                <p className="text-neutral-600 text-sm mt-1">Registra el primer corte para empezar el seguimiento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
