import PropTypes from 'prop-types';
import CeldaReserva from './CeldaReserva';

/**
 * GridDiario - Daily calendar grid component
 * Displays hour-by-hour schedule with one column per barbero
 */
export default function GridDiario({
    date,
    barberos,
    reservations,
    onReservaClick,
    onEmptySlotClick,
    horaInicio = '08:00',
    horaFin = '21:00',
    intervalo = 30
}) {
    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        const [startHour, startMin] = horaInicio.split(':').map(Number);
        const [endHour, endMin] = horaFin.split(':').map(Number);

        let currentHour = startHour;
        let currentMin = startMin;

        while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
            const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
            slots.push(timeStr);

            currentMin += intervalo;
            if (currentMin >= 60) {
                currentHour += Math.floor(currentMin / 60);
                currentMin = currentMin % 60;
            }
        }

        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Get reservations for a specific barbero and time
    const getReservationsForSlot = (barberoId, time) => {
        return reservations.filter(r => {
            const reservaDate = new Date(r.fecha).toISOString().split('T')[0];
            const slotDate = new Date(date).toISOString().split('T')[0];
            const matchesBarbero = r.barberoId?._id === barberoId || r.barberoId === barberoId;
            const matchesTime = r.hora === time || r.timeSlot?.hora === time;

            return reservaDate === slotDate && matchesBarbero && matchesTime;
        });
    };

    // Calculate grid columns (time + barberos)
    const gridCols = `grid-cols-${Math.min(barberos.length + 1, 8)}`;

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header with barbero names */}
                <div className={`grid ${gridCols} gap-2 mb-2 sticky top-0 bg-neutral-900 z-10 pb-2`}>
                    {/* Empty cell for time column */}
                    <div className="p-3 text-center font-bold text-neutral-400 text-sm bg-neutral-800 rounded-lg">
                        Hora
                    </div>

                    {/* Barbero headers */}
                    {barberos.map((barbero) => (
                        <div
                            key={barbero._id}
                            className="p-3 text-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 bg-opacity-20 border border-primary-500 border-opacity-30"
                        >
                            <div className="font-bold text-white text-sm">
                                {barbero.nombre}
                            </div>
                            {barbero.especialidades && barbero.especialidades.length > 0 && (
                                <div className="text-xs text-neutral-400 mt-1">
                                    {barbero.especialidades[0]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Time slots grid */}
                <div className="space-y-1">
                    {timeSlots.map((time) => {
                        // Highlight current hour
                        const now = new Date();
                        const [hour, min] = time.split(':').map(Number);
                        const isCurrentHour =
                            now.getHours() === hour &&
                            now.getMinutes() >= min &&
                            now.getMinutes() < min + intervalo &&
                            new Date(date).toDateString() === now.toDateString();

                        return (
                            <div
                                key={time}
                                className={`grid ${gridCols} gap-2 ${isCurrentHour ? 'bg-primary-500 bg-opacity-5 rounded-lg p-1' : ''}`}
                            >
                                {/* Time label */}
                                <div className={`p-3 text-center text-sm font-semibold rounded-lg ${isCurrentHour
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-neutral-800 text-neutral-400'
                                    }`}>
                                    {time}
                                </div>

                                {/* Barbero cells */}
                                {barberos.map((barbero) => {
                                    const slotReservations = getReservationsForSlot(barbero._id, time);

                                    return (
                                        <div
                                            key={`${barbero._id}-${time}`}
                                            className="min-h-[70px] relative"
                                        >
                                            {slotReservations.length > 0 ? (
                                                // Show reservations
                                                <div className="space-y-1">
                                                    {slotReservations.map((reserva) => (
                                                        <CeldaReserva
                                                            key={reserva._id || reserva.id}
                                                            reserva={reserva}
                                                            onClick={onReservaClick}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                // Empty slot - clickable to create reservation
                                                <button
                                                    onClick={() => onEmptySlotClick(date, time, barbero._id)}
                                                    className="w-full h-full border border-dashed border-neutral-700 rounded-lg hover:border-primary-500 hover:bg-primary-500 hover:bg-opacity-10 transition-all group flex items-center justify-center"
                                                    title={`Crear cita para ${barbero.nombre} a las ${time}`}
                                                >
                                                    <span className="text-neutral-600 group-hover:text-primary-500 text-xl font-light">
                                                        +
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {barberos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-neutral-400">
                            No hay barberos disponibles para esta fecha
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

GridDiario.propTypes = {
    date: PropTypes.string.isRequired, // Date string (YYYY-MM-DD)
    barberos: PropTypes.arrayOf(PropTypes.object).isRequired,
    reservations: PropTypes.arrayOf(PropTypes.object).isRequired,
    onReservaClick: PropTypes.func.isRequired,
    onEmptySlotClick: PropTypes.func.isRequired,
    horaInicio: PropTypes.string,
    horaFin: PropTypes.string,
    intervalo: PropTypes.number
};
