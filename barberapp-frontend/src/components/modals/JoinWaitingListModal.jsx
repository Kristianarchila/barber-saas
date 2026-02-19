import { useState } from 'react';
import { X, Clock, Calendar, Users } from 'lucide-react';
import waitingListService from '../../services/waitingListService';
import toast from 'react-hot-toast';

const JoinWaitingListModal = ({
    isOpen,
    onClose,
    barberiaId,
    barberoId,
    barberoNombre,
    servicioId,
    servicioNombre,
    clienteData
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fechaPreferida: '',
        rangoInicio: '09:00',
        rangoFin: '18:00',
        diasPreferidos: [],
        notas: ''
    });

    const diasSemana = [
        { value: 'lunes', label: 'Lunes' },
        { value: 'martes', label: 'Martes' },
        { value: 'miercoles', label: 'Miércoles' },
        { value: 'jueves', label: 'Jueves' },
        { value: 'viernes', label: 'Viernes' },
        { value: 'sabado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' }
    ];

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            diasPreferidos: prev.diasPreferidos.includes(day)
                ? prev.diasPreferidos.filter(d => d !== day)
                : [...prev.diasPreferidos, day]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fechaPreferida) {
            toast.error('Por favor selecciona una fecha preferida');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                barberiaId,
                barberoId,
                servicioId,
                clienteId: clienteData?.id,
                clienteEmail: clienteData?.email,
                clienteTelefono: clienteData?.telefono || '',
                clienteNombre: clienteData?.nombre,
                fechaPreferida: formData.fechaPreferida,
                rangoHorario: {
                    inicio: formData.rangoInicio,
                    fin: formData.rangoFin
                },
                diasPreferidos: formData.diasPreferidos,
                notas: formData.notas
            };

            const result = await waitingListService.join(payload);

            toast.success(
                `¡Te has unido a la lista de espera! Posición: #${result.entry.position}`,
                { duration: 5000 }
            );

            onClose();
        } catch (error) {
            console.error('Error joining waiting list:', error);
            toast.error(error.response?.data?.error || 'Error al unirse a la lista de espera');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <Users size={32} />
                        <h2 className="text-2xl font-bold">Unirse a Lista de Espera</h2>
                    </div>
                    <p className="text-purple-100">
                        No hay horarios disponibles ahora, pero te notificaremos cuando se libere uno
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Resumen */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Resumen de tu solicitud</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-purple-600" />
                                <span className="text-gray-600">Barbero:</span>
                                <span className="font-medium">{barberoNombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-purple-600" />
                                <span className="text-gray-600">Servicio:</span>
                                <span className="font-medium">{servicioNombre}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fecha Preferida */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline mr-2" size={16} />
                            Fecha Preferida *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.fechaPreferida}
                            onChange={(e) => setFormData({ ...formData, fechaPreferida: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Buscaremos horarios cercanos a esta fecha (±3 días)
                        </p>
                    </div>

                    {/* Rango Horario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="inline mr-2" size={16} />
                            Rango de Horario Preferido
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Desde</label>
                                <input
                                    type="time"
                                    value={formData.rangoInicio}
                                    onChange={(e) => setFormData({ ...formData, rangoInicio: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Hasta</label>
                                <input
                                    type="time"
                                    value={formData.rangoFin}
                                    onChange={(e) => setFormData({ ...formData, rangoFin: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Días Preferidos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Días de la Semana Preferidos (opcional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {diasSemana.map(dia => (
                                <button
                                    key={dia.value}
                                    type="button"
                                    onClick={() => handleDayToggle(dia.value)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${formData.diasPreferidos.includes(dia.value)
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {dia.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Si no seleccionas ninguno, buscaremos en todos los días
                        </p>
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas Adicionales (opcional)
                        </label>
                        <textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            rows={3}
                            placeholder="Ej: Prefiero horarios de mañana..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">¿Qué sigue?</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✅ Te notificaremos por email cuando haya un horario disponible</li>
                            <li>⏰ Tendrás 48 horas para confirmar la reserva</li>
                            <li>📧 Revisa tu bandeja de entrada y spam</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Uniéndose...' : 'Unirse a Lista de Espera'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinWaitingListModal;
