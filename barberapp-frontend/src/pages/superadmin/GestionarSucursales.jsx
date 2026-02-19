import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getSucursales,
    crearSucursal,
    actualizarSucursal,
    eliminarSucursal,
    toggleMatriz,
    getBarberia
} from "../../services/superAdminService";
import { MapPin, Phone, Mail, Edit2, Trash2, Plus, X, Building2, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import { Card, Button, Badge } from "../../components/ui";
import { motion, AnimatePresence } from "framer-motion";

export default function GestionarSucursales() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [barberia, setBarberia] = useState(null);
    const [sucursales, setSucursales] = useState([]);
    const [esMatriz, setEsMatriz] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSucursal, setEditingSucursal] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        slug: "",
        direccion: "",
        telefono: "",
        email: "",
        activa: true
    });

    const cargarDatos = async () => {
        try {
            const [barberiaData, sucursalesData] = await Promise.all([
                getBarberia(id),
                getSucursales(id)
            ]);
            setBarberia(barberiaData);
            setEsMatriz(sucursalesData.esMatriz);
            setSucursales(sucursalesData.sucursales);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const handleToggleMatriz = async () => {
        const msg = esMatriz
            ? "¿Desactivar modo multi-sede? No podrás agregar más sucursales."
            : "¿Activar modo multi-sede para esta barbería?";

        if (confirm(msg)) {
            try {
                await toggleMatriz(id, !esMatriz);
                setEsMatriz(!esMatriz);
            } catch (error) {
                alert("Error al cambiar modo multi-sede");
            }
        }
    };

    const handleOpenModal = (sucursal = null) => {
        if (sucursal) {
            setEditingSucursal(sucursal);
            setFormData({
                nombre: sucursal.nombre,
                slug: sucursal.slug,
                direccion: sucursal.direccion || "",
                telefono: sucursal.telefono || "",
                email: sucursal.email || "",
                activa: sucursal.activa
            });
        } else {
            setEditingSucursal(null);
            setFormData({
                nombre: "",
                slug: "",
                direccion: "",
                telefono: "",
                email: "",
                activa: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSucursal(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSucursal) {
                await actualizarSucursal(id, editingSucursal._id, formData);
            } else {
                await crearSucursal(id, formData);
            }
            handleCloseModal();
            cargarDatos();
        } catch (error) {
            alert(error.response?.data?.message || "Error al guardar sucursal");
        }
    };

    const handleEliminar = async (sucursalId, nombre) => {
        if (confirm(`¿Eliminar la sucursal "${nombre}"? Esta acción es irreversible.`)) {
            try {
                await eliminarSucursal(id, sucursalId);
                cargarDatos();
            } catch (error) {
                alert("Error al eliminar sucursal");
            }
        }
    };

    if (loading) return (
        <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="body-large text-gray-500 font-bold uppercase tracking-widest text-[10px]">Cargando infraestructura...</p>
        </div>
    );

    if (!barberia) return (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 m-6">
            <Building2 className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="heading-4 text-gray-900">Barbería no encontrada</p>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Volver</Button>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 p-8">
            {/* Header Corporativo */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate(`/superadmin/dashboard/barberias/${id}`)}
                        className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-4 transition-colors font-black uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Volver a {barberia.nombre}
                    </button>
                    <h1 className="heading-1 flex items-center gap-4">
                        <Building2 className="text-blue-600" size={40} />
                        Gestión de Sedes Multi-Entorno
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Control centralizado de sucursales para <span className="text-gray-900 font-black">{barberia.nombre}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleToggleMatriz}
                        variant={esMatriz ? "success" : "ghost"}
                        className={`rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[10px] shadow-sm relative overflow-hidden ${!esMatriz && "ring-1 ring-gray-100 bg-white"}`}
                    >
                        <div className="flex items-center gap-3">
                            {esMatriz ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            Modo Multi-Sede: {esMatriz ? "ACTIVO" : "INACTIVO"}
                        </div>
                    </Button>

                    {esMatriz && (
                        <Button
                            onClick={() => handleOpenModal()}
                            className="rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={20} />
                            Añadir Sede
                        </Button>
                    )}
                </div>
            </header>

            {/* Warning Section */}
            {!esMatriz && (
                <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex items-center gap-6 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-amber-600">
                        <X size={24} />
                    </div>
                    <div>
                        <h4 className="body font-black text-amber-900 uppercase tracking-widest text-xs">Modo Multi-Sede Desactivado</h4>
                        <p className="body-small text-amber-700/80 font-medium">Esta barbería opera como entidad única. Activa el modo multi-sede para expandir la infraestructura.</p>
                    </div>
                </div>
            )}

            {/* Main Grid */}
            {sucursales.length === 0 ? (
                <Card className="bg-gray-50/50 border-2 border-dashed border-gray-100 p-24 text-center rounded-[40px]">
                    <Building2 size={64} className="mx-auto mb-8 text-gray-200" />
                    <h3 className="heading-3 text-gray-900 mb-2">No se han registrado sucursales</h3>
                    <p className="body-large text-gray-400 max-w-md mx-auto">
                        Al habilitar el modo multi-sede, podrás segmentar la facturación y el staff por ubicaciones geográficas.
                    </p>
                    {esMatriz && (
                        <Button onClick={() => handleOpenModal()} className="mt-8 px-10">
                            Crear Primera Sucursal
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sucursales.map((sucursal) => (
                        <Card
                            key={sucursal._id}
                            className="group hover:-translate-y-2 transition-all duration-500 border-none ring-1 ring-gray-100 hover:ring-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 p-8"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${sucursal.activa ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{sucursal.nombre}</h3>
                                    </div>
                                    <p className="caption font-black text-blue-600 uppercase tracking-widest text-[9px]">ID Entorno: {sucursal.slug}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(sucursal)}
                                        className="p-3 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                                        title="Editar Configuración"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(sucursal._id, sucursal.nombre)}
                                        className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                                        title="Eliminar Sede"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                {sucursal.direccion && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="caption text-gray-400 font-bold uppercase tracking-widest text-[8px] mb-0.5">Ubicación</p>
                                            <p className="body-small text-gray-600 font-bold leading-tight">{sucursal.direccion}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    {sucursal.telefono && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                                                <Phone size={14} />
                                            </div>
                                            <div>
                                                <p className="caption text-gray-400 font-bold uppercase tracking-widest text-[8px] mb-0.5">Fono</p>
                                                <p className="body-tiny text-gray-600 font-black">{sucursal.telefono}</p>
                                            </div>
                                        </div>
                                    )}
                                    {sucursal.email && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                                                <Mail size={14} />
                                            </div>
                                            <div>
                                                <p className="caption text-gray-400 font-bold uppercase tracking-widest text-[8px] mb-0.5">Email</p>
                                                <p className="body-tiny text-gray-600 font-black truncate max-w-[80px]">{sucursal.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between items-center">
                                <Badge variant={sucursal.activa ? "success" : "error"} className="px-4 py-1.5 font-black uppercase text-[9px] tracking-[0.2em]">
                                    {sucursal.activa ? "OPERATIVA" : "INACTIVA"}
                                </Badge>
                                <Button variant="ghost" size="sm" className="font-black text-[9px] opacity-0 group-hover:opacity-100 transition-all">
                                    Ver Expediente
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODAL CORPORATIVO */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[48px] w-full max-w-2xl shadow-2xl relative overflow-hidden ring-1 ring-gray-100"
                        >
                            <div className="p-12">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-blue-50 rounded-[24px] text-blue-600">
                                            <Building2 size={28} />
                                        </div>
                                        <div>
                                            <h2 className="heading-3 text-gray-900 leading-none">
                                                {editingSucursal ? "Editar Sede" : "Nueva Sede"}
                                            </h2>
                                            <p className="caption font-black text-gray-400 uppercase tracking-widest mt-2">Parámetros corporativos</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        className="p-4 hover:bg-gray-100 rounded-full transition-all text-gray-300 hover:text-gray-900"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="caption font-black text-gray-400 uppercase tracking-widest">Nombre Comercial</label>
                                            <input
                                                type="text"
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all"
                                                placeholder="Ej: Sede Corporate Centro"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="caption font-black text-gray-400 uppercase tracking-widest">Identificador (Slug)</label>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all"
                                                placeholder="Ej: sede-centro"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="caption font-black text-gray-400 uppercase tracking-widest">Dirección Operativa</label>
                                        <input
                                            type="text"
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all"
                                            placeholder="Ej: Av. Principal 1234, Oficina 501"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="caption font-black text-gray-400 uppercase tracking-widest">Teléfono Directo</label>
                                            <input
                                                type="tel"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all"
                                                placeholder="+56 9 XXXX XXXX"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="caption font-black text-gray-400 uppercase tracking-widest">Email Corporativo</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 body-small font-black focus:ring-4 focus:ring-blue-100 transition-all"
                                                placeholder="sede@barberapp.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id="activa"
                                                checked={formData.activa}
                                                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                                                className="w-6 h-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="activa" className="body-small font-black text-gray-900 cursor-pointer">Sede Activa y Operativa</label>
                                            <p className="caption text-gray-400 mt-1 font-bold">Si se desactiva, los clientes no podrán agendar en este entorno.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-8 py-5 rounded-[24px] font-black transition-all"
                                        >
                                            Cerrar
                                        </button>
                                        <Button
                                            type="submit"
                                            className="flex-[2] py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
                                        >
                                            {editingSucursal ? "Actualizar Sede" : "Inaugurar Sede"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
