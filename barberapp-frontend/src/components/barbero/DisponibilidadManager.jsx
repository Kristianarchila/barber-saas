import { useState, useEffect } from "react";
import { getDisponibilidad, updateDisponibilidad } from "../../services/disponibilidadService";
import { Card, Button, Badge, ConfirmModal } from "../ui";
import { Clock, Plus, Trash2, Save, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

const DIAS_SEMANA = [
    { key: "LUNES", label: "Lunes" },
    { key: "MARTES", label: "Martes" },
    { key: "MIERCOLES", label: "Miércoles" },
    { key: "JUEVES", label: "Jueves" },
    { key: "VIERNES", label: "Viernes" },
    { key: "SABADO", label: "Sábado" },
    { key: "DOMINGO", label: "Domingo" }
];

const HORAS = Array.from({ length: 24 }, (_, i) => {
    const hora = i.toString().padStart(2, '0');
    return `${hora}:00`;
});

export default function DisponibilidadManager({ onClose }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [horarios, setHorarios] = useState({});
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, dia: null, index: null });

    useEffect(() => {
        cargarDisponibilidad();
    }, []);

    const cargarDisponibilidad = async () => {
        try {
            setLoading(true);
            const data = await getDisponibilidad();

            // Convertir array a objeto por día
            const horariosObj = {};
            DIAS_SEMANA.forEach(dia => {
                const diaData = data.horarios?.find(h => h.dia === dia.key);
                horariosObj[dia.key] = diaData || {
                    dia: dia.key,
                    bloques: [],
                    activo: false
                };
            });

            setHorarios(horariosObj);
        } catch (err) {
            console.error("Error cargando disponibilidad:", err);
            // Inicializar con estructura vacía
            const horariosObj = {};
            DIAS_SEMANA.forEach(dia => {
                horariosObj[dia.key] = {
                    dia: dia.key,
                    bloques: [],
                    activo: false
                };
            });
            setHorarios(horariosObj);
        } finally {
            setLoading(false);
        }
    };

    const toggleDia = (dia) => {
        setHorarios(prev => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                activo: !prev[dia].activo
            }
        }));
    };

    const agregarBloque = (dia) => {
        setHorarios(prev => ({
            ...prev,
            [dia]: {
                ...prev[dia],
                bloques: [
                    ...prev[dia].bloques,
                    { inicio: "09:00", fin: "18:00" }
                ]
            }
        }));
    };

    const eliminarBloque = (dia, index) => {
        const nuevosHorarios = { ...horarios };
        nuevosHorarios[dia].bloques.splice(index, 1);
        setHorarios(nuevosHorarios);
        setConfirmModal({ isOpen: false, dia: null, index: null });
    };

    const actualizarBloque = (dia, index, campo, valor) => {
        const nuevosHorarios = { ...horarios };
        nuevosHorarios[dia].bloques[index][campo] = valor;
        setHorarios(nuevosHorarios);
    };

    const guardarDisponibilidad = async () => {
        try {
            setSaving(true);

            // Validar que los bloques tengan inicio < fin
            for (const dia of DIAS_SEMANA) {
                const diaData = horarios[dia.key];
                if (diaData.activo) {
                    for (const bloque of diaData.bloques) {
                        if (bloque.inicio >= bloque.fin) {
                            toast.error(`Error en ${dia.label}: La hora de inicio debe ser menor que la de fin`);
                            return;
                        }
                    }
                }
            }

            // Convertir objeto a array
            const horariosArray = DIAS_SEMANA.map(dia => horarios[dia.key]);

            await updateDisponibilidad(horariosArray);
            toast.success("Disponibilidad actualizada correctamente");
            if (onClose) onClose();
        } catch (err) {
            console.error("Error guardando disponibilidad:", err);
            toast.error(err.response?.data?.message || "Error al guardar la disponibilidad");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Calendar className="text-blue-600" size={28} />
                        Gestionar Disponibilidad
                    </h2>
                    <p className="text-gray-600 mt-1">Define tus horarios de trabajo para cada día de la semana</p>
                </div>
            </div>

            {/* DÍAS DE LA SEMANA */}
            <div className="space-y-4">
                {DIAS_SEMANA.map(dia => (
                    <Card key={dia.key} className={`p-6 border-2 transition-all ${horarios[dia.key]?.activo ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                        }`}>
                        <div className="space-y-4">
                            {/* Header del día */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => toggleDia(dia.key)}
                                        className={`w-12 h-6 rounded-full transition-all relative ${horarios[dia.key]?.activo ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${horarios[dia.key]?.activo ? 'left-6' : 'left-0.5'
                                            }`} />
                                    </button>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{dia.label}</h3>
                                        {horarios[dia.key]?.activo && horarios[dia.key]?.bloques.length > 0 && (
                                            <p className="text-sm text-gray-500">
                                                {horarios[dia.key].bloques.length} bloque{horarios[dia.key].bloques.length !== 1 ? 's' : ''} horario{horarios[dia.key].bloques.length !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {horarios[dia.key]?.activo && (
                                    <Button
                                        onClick={() => agregarBloque(dia.key)}
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Plus size={16} className="mr-1" /> Agregar bloque
                                    </Button>
                                )}
                            </div>

                            {/* Bloques horarios */}
                            {horarios[dia.key]?.activo && (
                                <div className="space-y-3 pl-16">
                                    {horarios[dia.key].bloques.length === 0 ? (
                                        <p className="text-gray-400 text-sm italic">No hay bloques horarios configurados</p>
                                    ) : (
                                        horarios[dia.key].bloques.map((bloque, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                                                <Clock size={18} className="text-gray-400" />

                                                <select
                                                    value={bloque.inicio}
                                                    onChange={(e) => actualizarBloque(dia.key, index, 'inicio', e.target.value)}
                                                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:border-blue-500 outline-none"
                                                >
                                                    {HORAS.map(hora => (
                                                        <option key={hora} value={hora}>{hora}</option>
                                                    ))}
                                                </select>

                                                <span className="text-gray-400 font-bold">→</span>

                                                <select
                                                    value={bloque.fin}
                                                    onChange={(e) => actualizarBloque(dia.key, index, 'fin', e.target.value)}
                                                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:border-blue-500 outline-none"
                                                >
                                                    {HORAS.map(hora => (
                                                        <option key={hora} value={hora}>{hora}</option>
                                                    ))}
                                                </select>

                                                <Button
                                                    onClick={() => setConfirmModal({ isOpen: true, dia: dia.key, index })}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-auto text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {onClose && (
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-gray-200 text-gray-700"
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    onClick={guardarDisponibilidad}
                    loading={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Save size={18} className="mr-2" /> Guardar Disponibilidad
                </Button>
            </div>

            {/* CONFIRM MODAL */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, dia: null, index: null })}
                onConfirm={() => eliminarBloque(confirmModal.dia, confirmModal.index)}
                title="¿Eliminar bloque horario?"
                message="Esta acción no se puede deshacer. El bloque horario será eliminado de tu disponibilidad."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
}
