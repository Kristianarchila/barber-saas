import { useEffect, useState } from "react";
import { getBarberos } from "../../services/barberosService";
import {
    crearBloqueo,
    obtenerBloqueos,
    obtenerBloqueosPorRango,
    eliminarBloqueo
} from "../../services/bloqueosService";
import { Card, Button, Badge, Skeleton } from "../../components/ui";
import { Calendar, Clock, X, Plus, AlertTriangle, Umbrella, Zap } from "lucide-react";

const TIPOS_BLOQUEO = [
    { value: "VACACIONES", label: "Vacaciones", icon: Umbrella, color: "blue" },
    { value: "FERIADO", label: "Feriado", icon: Calendar, color: "purple" },
    { value: "EMERGENCIA", label: "Emergencia", icon: AlertTriangle, color: "red" },
    { value: "OTRO", label: "Otro", icon: Zap, color: "yellow" }
];

export default function Bloqueos() {
    const [barberos, setBarberos] = useState([]);
    const [bloqueos, setBloqueos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        barberoId: "",
        tipo: "VACACIONES",
        fechaInicio: "",
        fechaFin: "",
        horaInicio: "",
        horaFin: "",
        motivo: "",
        todoElDia: true
    });

    useEffect(() => {
        fetchBarberos();
        fetchBloqueos();
    }, []);

    async function fetchBarberos() {
        try {
            const data = await getBarberos();
            setBarberos(data);
        } catch (error) {
            console.error("Error cargando barberos:", error);
        }
    }

    async function fetchBloqueos() {
        setLoading(true);
        try {
            const data = await obtenerBloqueos({ activo: true });
            setBloqueos(data);
        } catch (error) {
            console.error("Error cargando bloqueos:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.fechaInicio || !form.fechaFin || !form.motivo) {
            alert("Por favor completa todos los campos obligatorios");
            return;
        }

        if (!form.todoElDia && (!form.horaInicio || !form.horaFin)) {
            alert("Para bloqueos parciales debes especificar hora de inicio y fin");
            return;
        }

        try {
            setSaving(true);
            await crearBloqueo({
                barberoId: form.barberoId || null,
                tipo: form.tipo,
                fechaInicio: form.fechaInicio,
                fechaFin: form.fechaFin,
                horaInicio: form.todoElDia ? null : form.horaInicio,
                horaFin: form.todoElDia ? null : form.horaFin,
                motivo: form.motivo,
                todoElDia: form.todoElDia
            });

            await fetchBloqueos();
            setShowForm(false);
            resetForm();
            alert("Bloqueo creado exitosamente");
        } catch (error) {
            alert("Error al crear bloqueo: " + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("¿Estás seguro de eliminar este bloqueo?")) return;

        try {
            await eliminarBloqueo(id);
            await fetchBloqueos();
            alert("Bloqueo eliminado exitosamente");
        } catch (error) {
            alert("Error al eliminar bloqueo: " + (error.response?.data?.message || error.message));
        }
    }

    function resetForm() {
        setForm({
            barberoId: "",
            tipo: "VACACIONES",
            fechaInicio: "",
            fechaFin: "",
            horaInicio: "",
            horaFin: "",
            motivo: "",
            todoElDia: true
        });
    }

    function getTipoConfig(tipo) {
        return TIPOS_BLOQUEO.find(t => t.value === tipo) || TIPOS_BLOQUEO[3];
    }

    function getBarberoNombre(barberoId) {
        if (!barberoId) return "Toda la barbería";
        const barbero = barberos.find(b => b._id === barberoId);
        return barbero ? barbero.nombre : "Barbero desconocido";
    }

    function formatFecha(fecha) {
        return new Date(fecha).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // Agrupar bloqueos por mes
    const bloqueosPorMes = bloqueos.reduce((acc, bloqueo) => {
        const mes = new Date(bloqueo.fechaInicio).toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric"
        });
        if (!acc[mes]) acc[mes] = [];
        acc[mes].push(bloqueo);
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gradient-primary">
                        🚫 Bloqueo de Fechas
                    </h1>
                    <p className="text-neutral-400 text-lg">
                        Gestiona días cerrados, vacaciones y horarios excepcionales
                    </p>
                </div>

                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? "outline" : "primary"}
                    className="gap-2"
                >
                    {showForm ? (
                        <>
                            <X className="w-5 h-5" />
                            Cancelar
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Nuevo Bloqueo
                        </>
                    )}
                </Button>
            </header>

            {/* FORMULARIO */}
            {showForm && (
                <Card variant="glass" className="animate-slide-in">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-primary-400" />
                            Crear Nuevo Bloqueo
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tipo de Bloqueo */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">
                                    Tipo de Bloqueo *
                                </label>
                                <select
                                    value={form.tipo}
                                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    {TIPOS_BLOQUEO.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Barbero */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">
                                    Barbero (opcional)
                                </label>
                                <select
                                    value={form.barberoId}
                                    onChange={(e) => setForm({ ...form, barberoId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Toda la barbería</option>
                                    {barberos.map(barbero => (
                                        <option key={barbero._id} value={barbero._id}>
                                            {barbero.nombre}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-neutral-500">
                                    Deja vacío para bloquear toda la barbería
                                </p>
                            </div>

                            {/* Fecha Inicio */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">
                                    Fecha Inicio *
                                </label>
                                <input
                                    type="date"
                                    value={form.fechaInicio}
                                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Fecha Fin */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-300">
                                    Fecha Fin *
                                </label>
                                <input
                                    type="date"
                                    value={form.fechaFin}
                                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                                    className="input-field"
                                    min={form.fechaInicio}
                                    required
                                />
                            </div>

                            {/* Todo el día */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.todoElDia}
                                        onChange={(e) => setForm({ ...form, todoElDia: e.target.checked })}
                                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-neutral-300">
                                        Bloquear todo el día
                                    </span>
                                </label>
                            </div>

                            {/* Horas (solo si no es todo el día) */}
                            {!form.todoElDia && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-300">
                                            Hora Inicio *
                                        </label>
                                        <input
                                            type="time"
                                            value={form.horaInicio}
                                            onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                                            className="input-field"
                                            required={!form.todoElDia}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-300">
                                            Hora Fin *
                                        </label>
                                        <input
                                            type="time"
                                            value={form.horaFin}
                                            onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                                            className="input-field"
                                            required={!form.todoElDia}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Motivo */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-neutral-300">
                                    Motivo *
                                </label>
                                <textarea
                                    value={form.motivo}
                                    onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                                    className="input-field min-h-[100px]"
                                    placeholder="Ej: Vacaciones de verano, Feriado nacional, etc."
                                    maxLength={500}
                                    required
                                />
                                <p className="text-xs text-neutral-500">
                                    {form.motivo.length}/500 caracteres
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={saving}
                                className="gap-2"
                            >
                                {saving ? "Guardando..." : "Crear Bloqueo"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* LISTA DE BLOQUEOS */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        Bloqueos Activos ({bloqueos.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                ) : bloqueos.length === 0 ? (
                    <Card variant="glass">
                        <div className="p-12 text-center space-y-4">
                            <Calendar className="w-16 h-16 text-neutral-600 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-neutral-400">
                                    No hay bloqueos activos
                                </h3>
                                <p className="text-neutral-500">
                                    Crea un bloqueo para cerrar días o horarios específicos
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowForm(true)}
                                variant="primary"
                                className="gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Crear Primer Bloqueo
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(bloqueosPorMes).map(([mes, bloqueosDelMes]) => (
                            <div key={mes} className="space-y-4">
                                <h3 className="text-lg font-bold text-neutral-300 capitalize flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary-400" />
                                    {mes}
                                </h3>

                                <div className="grid gap-4">
                                    {bloqueosDelMes.map(bloqueo => {
                                        const tipoConfig = getTipoConfig(bloqueo.tipo);
                                        const Icon = tipoConfig.icon;

                                        return (
                                            <Card key={bloqueo.id} variant="glass" className="hover:border-primary-500/30 transition-all">
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 space-y-3">
                                                            {/* Header */}
                                                            <div className="flex items-start gap-3">
                                                                <div className={`p-2 rounded-lg bg-${tipoConfig.color}-500/10`}>
                                                                    <Icon className={`w-5 h-5 text-${tipoConfig.color}-400`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <Badge variant={tipoConfig.color}>
                                                                            {tipoConfig.label}
                                                                        </Badge>
                                                                        <span className="text-sm text-neutral-400">
                                                                            {getBarberoNombre(bloqueo.barberoId)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-white font-medium mt-1">
                                                                        {bloqueo.motivo}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Detalles */}
                                                            <div className="flex items-center gap-6 text-sm text-neutral-400">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>
                                                                        {formatFecha(bloqueo.fechaInicio)}
                                                                        {bloqueo.fechaInicio !== bloqueo.fechaFin && (
                                                                            <> → {formatFecha(bloqueo.fechaFin)}</>
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {!bloqueo.todoElDia && bloqueo.horaInicio && bloqueo.horaFin && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span>
                                                                            {bloqueo.horaInicio} - {bloqueo.horaFin}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {bloqueo.todoElDia && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Todo el día
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Botón Eliminar */}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(bloqueo.id)}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
