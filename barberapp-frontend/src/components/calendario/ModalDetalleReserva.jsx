import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../ui/Modal';
import { Button, Badge } from '../ui';
import { completarReserva, cancelarReserva } from '../../services/reservasService';
import {
    Calendar,
    Clock,
    User,
    Scissors,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * ModalDetalleReserva - Modal for viewing and managing reservation details
 */
export default function ModalDetalleReserva({
    isOpen,
    onClose,
    reserva,
    onSuccess
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!reserva) return null;

    const handleCompletar = async () => {
        if (!window.confirm('¿Marcar esta reserva como completada?')) return;

        setLoading(true);
        setError('');
        try {
            await completarReserva(reserva._id || reserva.id);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error completing reservation:', err);
            setError(err.response?.data?.message || 'Error al completar la reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async () => {
        if (!window.confirm('¿Cancelar esta reserva?')) return;

        setLoading(true);
        setError('');
        try {
            await cancelarReserva(reserva._id || reserva.id);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error canceling reservation:', err);
            setError(err.response?.data?.message || 'Error al cancelar la reserva');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (estado) => {
        const statusMap = {
            RESERVADA: { variant: 'info', label: 'Reservada', icon: AlertCircle },
            CONFIRMADA: { variant: 'success', label: 'Confirmada', icon: CheckCircle },
            COMPLETADA: { variant: 'success', label: 'Completada', icon: CheckCircle },
            CANCELADA: { variant: 'error', label: 'Cancelada', icon: XCircle },
            NO_ASISTIO: { variant: 'warning', label: 'No asistió', icon: AlertCircle }
        };
        return statusMap[estado] || statusMap.RESERVADA;
    };

    const status = getStatusBadge(reserva.estado);
    const StatusIcon = status.icon;

    const canComplete = ['RESERVADA', 'CONFIRMADA'].includes(reserva.estado);
    const canCancel = ['RESERVADA', 'CONFIRMADA'].includes(reserva.estado);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalle de Reserva"
            size="md"
        >
            <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-xl">
                    <span className="text-neutral-400">Estado:</span>
                    <div className="flex items-center gap-2">
                        <StatusIcon size={20} />
                        <Badge variant={status.variant} size="lg">
                            {status.label}
                        </Badge>
                    </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-800 rounded-xl">
                        <div className="flex items-center gap-2 text-neutral-400 mb-2">
                            <Calendar size={16} />
                            <span className="text-xs">Fecha</span>
                        </div>
                        <div className="text-white font-semibold">
                            {format(new Date(reserva.fecha + 'T00:00:00'), 'PPP', { locale: es })}
                        </div>
                    </div>
                    <div className="p-4 bg-neutral-800 rounded-xl">
                        <div className="flex items-center gap-2 text-neutral-400 mb-2">
                            <Clock size={16} />
                            <span className="text-xs">Hora</span>
                        </div>
                        <div className="text-white font-semibold">
                            {reserva.timeSlot?.hora || 'N/A'}
                            {reserva.timeSlot?.duracion && ` (${reserva.timeSlot.duracion} min)`}
                        </div>
                    </div>
                </div>

                {/* Client Information */}
                <div className="p-4 bg-neutral-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-primary-500 font-bold">
                        <User size={20} />
                        <span>Información del Cliente</span>
                    </div>
                    <div>
                        <div className="text-xs text-neutral-400">Nombre</div>
                        <div className="text-white font-semibold">{reserva.nombreCliente || 'N/A'}</div>
                    </div>
                    {reserva.emailCliente && (
                        <div>
                            <div className="text-xs text-neutral-400">Email</div>
                            <div className="text-white">{reserva.emailCliente}</div>
                        </div>
                    )}
                    {reserva.telefonoCliente && (
                        <div>
                            <div className="text-xs text-neutral-400">Teléfono</div>
                            <div className="text-white">{reserva.telefonoCliente}</div>
                        </div>
                    )}
                </div>

                {/* Service Information */}
                <div className="p-4 bg-neutral-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-primary-500 font-bold">
                        <Scissors size={20} />
                        <span>Servicio</span>
                    </div>
                    <div>
                        <div className="text-white font-semibold text-lg">
                            {reserva.servicio?.nombre || 'N/A'}
                        </div>
                        {reserva.servicio?.descripcion && (
                            <div className="text-sm text-neutral-400 mt-1">
                                {reserva.servicio.descripcion}
                            </div>
                        )}
                    </div>
                </div>

                {/* Barbero Information */}
                {reserva.barbero && (
                    <div className="p-4 bg-neutral-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-primary-500 font-bold">
                            <User size={20} />
                            <span>Barbero</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {reserva.barbero.foto && (
                                <img
                                    src={reserva.barbero.foto}
                                    alt={reserva.barbero.nombre}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <div className="text-white font-semibold">{reserva.barbero.nombre}</div>
                                {reserva.barbero.especialidad && (
                                    <div className="text-sm text-neutral-400">{reserva.barbero.especialidad}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Price */}
                {reserva.precio && (
                    <div className="p-4 bg-primary-500 bg-opacity-10 border border-primary-500 rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-300">Precio Total:</span>
                            <div className="flex items-center gap-2">
                                <DollarSign size={24} className="text-primary-500" />
                                <span className="text-3xl font-bold text-white">
                                    ${reserva.precio.toLocaleString('es-CL')}
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
                    {canCancel && (
                        <Button
                            variant="error"
                            onClick={handleCancelar}
                            disabled={loading}
                            className="flex-1"
                        >
                            <XCircle size={16} />
                            Cancelar Reserva
                        </Button>
                    )}
                    {canComplete && (
                        <Button
                            variant="success"
                            onClick={handleCompletar}
                            disabled={loading}
                            className="flex-1"
                        >
                            <CheckCircle size={16} />
                            Completar
                        </Button>
                    )}
                    {!canComplete && !canCancel && (
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cerrar
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

ModalDetalleReserva.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    reserva: PropTypes.object,
    onSuccess: PropTypes.func
};
