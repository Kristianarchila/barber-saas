import { useState } from "react";
import { Button, Input, Badge, ConfirmModal } from "../ui";
import { Plus, X, Scissors } from "lucide-react";

const ESPECIALIDADES_SUGERIDAS = [
    "Corte Masculino",
    "Corte Femenino",
    "Barba",
    "Degradado",
    "Fade",
    "Afeitado Clásico",
    "Diseño de Cejas",
    "Coloración",
    "Permanente",
    "Alisado",
    "Tratamiento Capilar"
];

export default function EspecialidadesModal({ especialidades, onSave, onClose }) {
    const [lista, setLista] = useState([...especialidades]);
    const [nueva, setNueva] = useState("");
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null });

    const agregar = () => {
        const trimmed = nueva.trim();
        if (!trimmed) return;

        if (lista.includes(trimmed)) {
            return; // Ya existe
        }

        setLista([...lista, trimmed]);
        setNueva("");
    };

    const agregarSugerida = (esp) => {
        if (lista.includes(esp)) return;
        setLista([...lista, esp]);
    };

    const eliminar = (index) => {
        const nuevaLista = [...lista];
        nuevaLista.splice(index, 1);
        setLista(nuevaLista);
        setConfirmModal({ isOpen: false, index: null });
    };

    const handleSave = () => {
        onSave(lista);
        onClose();
    };

    const sugerenciasDisponibles = ESPECIALIDADES_SUGERIDAS.filter(
        esp => !lista.includes(esp)
    );

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Scissors className="text-blue-600" size={28} />
                    Especialidades
                </h2>
                <p className="text-gray-600 mt-1">Agrega las especialidades que dominas para que los clientes te conozcan mejor</p>
            </div>

            {/* ESPECIALIDADES ACTUALES */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tus Especialidades</h3>
                {lista.length === 0 ? (
                    <p className="text-gray-400 text-sm italic py-4">No has agregado especialidades aún</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {lista.map((esp, index) => (
                            <Badge
                                key={index}
                                variant="neutral"
                                className="border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 group"
                            >
                                {esp}
                                <button
                                    onClick={() => setConfirmModal({ isOpen: true, index })}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* AGREGAR NUEVA */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Agregar Nueva</h3>
                <div className="flex gap-2">
                    <Input
                        value={nueva}
                        onChange={(e) => setNueva(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && agregar()}
                        placeholder="Ej: Corte Masculino"
                        className="flex-1"
                    />
                    <Button
                        onClick={agregar}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!nueva.trim()}
                    >
                        <Plus size={18} className="mr-1" /> Agregar
                    </Button>
                </div>
            </div>

            {/* SUGERENCIAS */}
            {sugerenciasDisponibles.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Sugerencias</h3>
                    <div className="flex flex-wrap gap-2">
                        {sugerenciasDisponibles.map((esp, index) => (
                            <button
                                key={index}
                                onClick={() => agregarSugerida(esp)}
                                className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm font-medium"
                            >
                                + {esp}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-gray-200 text-gray-700"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Guardar Cambios
                </Button>
            </div>

            {/* CONFIRM MODAL */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, index: null })}
                onConfirm={() => eliminar(confirmModal.index)}
                title="¿Eliminar especialidad?"
                message="Esta especialidad será removida de tu perfil."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                variant="warning"
            />
        </div>
    );
}
