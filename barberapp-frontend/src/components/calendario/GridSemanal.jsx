import PropTypes from 'prop-types';
import CeldaReserva from './CeldaReserva';

/**
 * GridSemanal - Weekly calendar grid component
 * Displays a 7-day grid with time slots and reservations
 */
export default function GridSemanal({
    weekDays,
    reservations,
    onReservaClick,
    onEmptySlotClick,
    horaInicio = '08:00',
    horaFin = '20:00',
    intervalo = 30
}) {
    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        const [startHour, startMin] = horaInicio.split(':').map(Number);
        const [endHour, endMin] = horaFin.split(':').map(Number);

        let currentHour = startHour;
        let currentMin = startMin;

        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
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

    // Get reservations for a specific day and time
    const getReservationsForSlot = (date, time) => {
        return reservations.filter(r => {
            const reservaDate = new Date(r.fecha).toISOString().split('T')[0];
            const slotDate = new Date(date).toISOString().split('T')[0];
            return reservaDate === slotDate && r.timeSlot?.hora === time;
        });
    };

    // Day names in Spanish
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header with days */}
                <div className="grid grid-cols-8 gap-2 mb-2">
                    {/* Empty cell for time column */}
                    <div className="p-2 text-center font-bold text-neutral-400 text-sm">
                        Hora
                    </div>

                    {/* Day headers */}
                    {weekDays.map((day, idx) => {
                        const date = new Date(day);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={idx}
                                className={`p-2 text-center rounded-lg ${isToday
                                        ? 'bg-primary-500 bg-opacity-20 border border-primary-500'
                                        : 'bg-neutral-800'
                                    }`}
                            >
                                <div className="font-bold text-white">
                                    {dayNames[date.getDay()]}
                                </div>
                                <div className={`text-sm ${isToday ? 'text-primary-500' : 'text-neutral-400'}`}>
                                    {date.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time slots grid */}
                <div className="space-y-1">
                    {timeSlots.map((time) => (
                        <div key={time} className="grid grid-cols-8 gap-2">
                            {/* Time label */}
                            <div className="p-2 text-center text-sm font-semibold text-neutral-400">
                                {time}
                            </div>

                            {/* Day cells */}
                            {weekDays.map((day, dayIdx) => {
                                const slotReservations = getReservationsForSlot(day, time);

                                return (
                                    <div
                                        key={`${day}-${time}`}
                                        className="min-h-[60px] relative"
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
                                                onClick={() => onEmptySlotClick(day, time)}
                                                className="w-full h-full border border-dashed border-neutral-700 rounded-lg hover:border-primary-500 hover:bg-primary-500 hover:bg-opacity-10 transition-all group"
                                            >
                                                <span className="text-neutral-600 group-hover:text-primary-500 text-xs">
                                                    +
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

GridSemanal.propTypes = {
    weekDays: PropTypes.arrayOf(PropTypes.string).isRequired, // Array of date strings (YYYY-MM-DD)
    reservations: PropTypes.arrayOf(PropTypes.object).isRequired,
    onReservaClick: PropTypes.func.isRequired,
    onEmptySlotClick: PropTypes.func.isRequired,
    horaInicio: PropTypes.string,
    horaFin: PropTypes.string,
    intervalo: PropTypes.number
};
