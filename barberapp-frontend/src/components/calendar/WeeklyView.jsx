import { useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Badge, Card } from '../ui';
import { Clock, Users } from 'lucide-react';
import { ensureArray } from '../../utils/validateData';

dayjs.locale('es');

/**
 * WeeklyView Component
 * Displays a 7-day grid with all appointments for the week
 * 
 * @param {Object} props
 * @param {Array} props.reservas - List of reservations
 * @param {string} props.weekStart - Start date of the week (YYYY-MM-DD)
 * @param {Function} props.onReservaClick - Callback when a reservation is clicked
 */
export default function WeeklyView({ reservas, weekStart, onReservaClick }) {
    // Generate 7 days starting from weekStart
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) =>
            dayjs(weekStart).add(i, 'day')
        );
    }, [weekStart]);

    // Group reservas by date
    const reservasByDate = useMemo(() => {
        const grouped = {};
        weekDays.forEach(day => {
            const dateKey = day.format('YYYY-MM-DD');
            grouped[dateKey] = ensureArray(reservas).filter(r =>
                dayjs(r.fecha).format('YYYY-MM-DD') === dateKey
            ).sort((a, b) => a.hora.localeCompare(b.hora));
        });
        return grouped;
    }, [reservas, weekDays]);

    const getBadgeVariant = (estado) => {
        switch (estado) {
            case 'COMPLETADA':
                return 'success';
            case 'CANCELADA':
                return 'destructive';
            case 'RESERVADA':
                return 'primary';
            default:
                return 'default';
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-4">
            {weekDays.map(day => {
                const dateKey = day.format('YYYY-MM-DD');
                const dayReservas = reservasByDate[dateKey] || [];
                const isToday = day.isSame(dayjs(), 'day');

                return (
                    <div key={dateKey} className="min-h-[200px]">
                        {/* Day Header */}
                        <div className={`
              text-center p-3 rounded-t-lg border-b-2
              ${isToday ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200'}
            `}>
                            <div className="text-xs text-gray-500 uppercase font-semibold">
                                {day.format('ddd')}
                            </div>
                            <div className={`text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                {day.format('DD')}
                            </div>
                            <div className="text-xs text-gray-500">
                                {day.format('MMM')}
                            </div>
                        </div>

                        {/* Appointments */}
                        <div className="space-y-2 p-2 bg-white border border-t-0 border-gray-200 rounded-b-lg min-h-[150px]">
                            {dayReservas.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4 italic">Sin citas</p>
                            ) : (
                                dayReservas.map(reserva => (
                                    <Card
                                        key={reserva._id}
                                        onClick={() => onReservaClick?.(reserva)}
                                        className="p-2 cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-500 bg-white"
                                    >
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                            <Clock size={12} />
                                            {reserva.hora}
                                        </div>
                                        <p className="font-semibold text-sm truncate">{reserva.servicioId?.nombre || 'Servicio'}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                            <Users size={12} />
                                            <span className="truncate">{reserva.nombreCliente}</span>
                                        </div>
                                        <Badge
                                            variant={getBadgeVariant(reserva.estado)}
                                            className="mt-1 text-xs"
                                        >
                                            {reserva.estado}
                                        </Badge>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
