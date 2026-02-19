import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../ui/Modal';
import { Button, Input } from '../ui';
import { getBarberos } from '../../services/barberosService';
import { getServicios } from '../../services/serviciosService';
import { crearReserva } from '../../services/reservasService';
import { Calendar, Clock, User, Scissors, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * ModalNuevaReserva - Modal for creating a new reservation
 */
export default function ModalNuevaReserva({
    isOpen,
    onClose,
    fecha,
    hora,
    barberoId = null,
    onSuccess
}) {
    const [formData, setFormData] = useState({
        barberoId: barberoId || '',
        servicioId: '',
        nombreCliente: '',
        emailCliente: '',
        fecha: fecha || '',
        hora: hora || ''
    });

    const [barberos, setBarberos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load barberos and servicios
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    // Update form when props change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            fecha: fecha || prev.fecha,
            hora: hora || prev.hora,
            barberoId: barberoId || prev.barberoId
        }));
    }, [fecha, hora, barberoId]);

    const loadData = async () => {
        try {
            const [barberosData, serviciosData] = await Promise.all([
                getBarberos(),
                getServicios()
            ]);
            setBarberos(barberosData);
            setServicios(serviciosData);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Error cargando datos');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.barberoId || !formData.servicioId || !formData.nombreCliente) {
            setError('Por favor completa todos los campos obligatorios');
            return;
        }

        setLoading(true);
        try {
            await crearReserva(formData.barberoId, {
                servicioId: formData.servicioId,
                nombreCliente: formData.nombreCliente,
                emailCliente: formData.emailCliente,
                fecha: formData.fecha,
                hora: formData.hora
            });

            // Reset form
            setFormData({
                barberoId: '',
                servicioId: '',
                nombreCliente: '',
                emailCliente: '',
                fecha: '',
                hora: ''
            });

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error creating reservation:', err);
            setError(err.response?.data?.message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    const selectedServicio = servicios.find(s => s._id === formData.servicioId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Reserva"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Time Display */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 text-neutral-300">
                        <Calendar size={20} className="text-primary-500" />
                        <div>
                            <div className="text-xs text-neutral-400">Fecha</div>
                            <div className="font-semibold">
                                {formData.fecha ? format(new Date(formData.fecha + 'T00:00:00'), 'PPP', { locale: es }) : '-'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-300">
                        <Clock size={20} className="text-primary-500" />
                        <div>
                            <div className="text-xs text-neutral-400">Hora</div>
                            <div className="font-semibold">{formData.hora || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Barbero Selection */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                        <User size={16} className="text-primary-500" />
                        Barbero *
                    </label>
                    <select
                        name="barberoId"
                        value={formData.barberoId}
                        onChange={handleChange}
                        required
                        className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    >
                        <option value="">Seleccionar barbero</option>
                        {barberos.map(barbero => (
                            <option key={barbero._id} value={barbero._id}>
                                {barbero.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Service Selection */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                        <Scissors size={16} className="text-primary-500" />
                        Servicio *
                    </label>
                    <select
                        name="servicioId"
                        value={formData.servicioId}
                        onChange={handleChange}
                        required
                        className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    >
                        <option value="">Seleccionar servicio</option>
                        {servicios.map(servicio => (
                            <option key={servicio._id} value={servicio._id}>
                                {servicio.nombre} - ${servicio.precio?.toLocaleString('es-CL')}
                            </option>
                        ))}
                    </select>
                    {selectedServicio && (
                        <div className="mt-2 p-3 bg-neutral-800 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-neutral-400">Duración:</span>
                            <span className="text-sm font-semibold text-white">{selectedServicio.duracion} min</span>
                        </div>
                    )}
                </div>

                {/* Client Name */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                        <User size={16} className="text-primary-500" />
                        Nombre del Cliente *
                    </label>
                    <Input
                        type="text"
                        name="nombreCliente"
                        value={formData.nombreCliente}
                        onChange={handleChange}
                        placeholder="Ej: Juan Pérez"
                        required
                    />
                </div>

                {/* Client Email (Optional) */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                        <User size={16} className="text-primary-500" />
                        Email del Cliente (opcional)
                    </label>
                    <Input
                        type="email"
                        name="emailCliente"
                        value={formData.emailCliente}
                        onChange={handleChange}
                        placeholder="cliente@ejemplo.com"
                    />
                </div>

                {/* Price Display */}
                {selectedServicio && (
                    <div className="p-4 bg-primary-500 bg-opacity-10 border border-primary-500 rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-300">Precio Total:</span>
                            <div className="flex items-center gap-2">
                                <DollarSign size={20} className="text-primary-500" />
                                <span className="text-2xl font-bold text-white">
                                    ${selectedServicio.precio?.toLocaleString('es-CL')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-xl text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear Reserva'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

ModalNuevaReserva.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    fecha: PropTypes.string,
    hora: PropTypes.string,
    barberoId: PropTypes.string,
    onSuccess: PropTypes.func
};
