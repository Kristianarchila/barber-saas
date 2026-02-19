import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Badge } from '../ui';
import { Clock, User, Scissors } from 'lucide-react';

/**
 * CeldaReserva - Individual reservation cell for calendar grid
 * Displays compact reservation info with color coding by status
 */
export default function CeldaReserva({ reserva, onClick }) {
    const [showTooltip, setShowTooltip] = useState(false);

    // Color mapping by status
    const statusColors = {
        RESERVADA: 'bg-blue-500 bg-opacity-20 border-blue-500 text-blue-500',
        CONFIRMADA: 'bg-green-500 bg-opacity-20 border-green-500 text-green-500',
        COMPLETADA: 'bg-gray-500 bg-opacity-20 border-gray-500 text-gray-500',
        CANCELADA: 'bg-red-500 bg-opacity-20 border-red-500 text-red-500',
        NO_ASISTIO: 'bg-orange-500 bg-opacity-20 border-orange-500 text-orange-500'
    };

    const statusLabels = {
        RESERVADA: 'Reservada',
        CONFIRMADA: 'Confirmada',
        COMPLETADA: 'Completada',
        CANCELADA: 'Cancelada',
        NO_ASISTIO: 'No asistió'
    };

    const colorClass = statusColors[reserva.estado] || statusColors.RESERVADA;

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                onClick={() => onClick(reserva)}
                className={`w-full p-2 rounded-lg border-l-4 text-left transition-all hover:shadow-md ${colorClass}`}
            >
                {/* Time */}
                <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                    <Clock size={12} />
                    <span>{reserva.timeSlot?.hora || '00:00'}</span>
                </div>

                {/* Client name */}
                <div className="flex items-center gap-1 text-xs mb-1">
                    <User size={12} />
                    <span className="truncate">{reserva.nombreCliente || 'Cliente'}</span>
                </div>

                {/* Service */}
                <div className="flex items-center gap-1 text-xs">
                    <Scissors size={12} />
                    <span className="truncate">{reserva.servicio?.nombre || 'Servicio'}</span>
                </div>
            </button>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute z-50 left-full ml-2 top-0 w-64 p-3 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl">
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{reserva.nombreCliente}</span>
                            <Badge variant={reserva.estado === 'COMPLETADA' ? 'success' : 'primary'} size="sm">
                                {statusLabels[reserva.estado]}
                            </Badge>
                        </div>

                        <div className="text-neutral-300">
                            <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>{reserva.timeSlot?.hora} ({reserva.timeSlot?.duracion || 30} min)</span>
                            </div>
                        </div>

                        <div className="text-neutral-300">
                            <div className="flex items-center gap-2">
                                <Scissors size={14} />
                                <span>{reserva.servicio?.nombre}</span>
                            </div>
                        </div>

                        {reserva.barbero && (
                            <div className="text-neutral-300">
                                <div className="flex items-center gap-2">
                                    <User size={14} />
                                    <span>{reserva.barbero.nombre}</span>
                                </div>
                            </div>
                        )}

                        {reserva.precio && (
                            <div className="text-primary-500 font-semibold">
                                ${reserva.precio.toLocaleString('es-CL')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

CeldaReserva.propTypes = {
    reserva: PropTypes.shape({
        _id: PropTypes.string,
        nombreCliente: PropTypes.string,
        estado: PropTypes.string.isRequired,
        timeSlot: PropTypes.shape({
            hora: PropTypes.string,
            duracion: PropTypes.number
        }),
        servicio: PropTypes.shape({
            nombre: PropTypes.string
        }),
        barbero: PropTypes.shape({
            nombre: PropTypes.string
        }),
        precio: PropTypes.number
    }).isRequired,
    onClick: PropTypes.func.isRequired
};
