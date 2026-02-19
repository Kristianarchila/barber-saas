import { useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Card } from '../ui';
import { ensureArray } from '../../utils/validateData';

dayjs.locale('es');

/**
 * MonthlyView Component
 * Displays a full month calendar grid (6 weeks x 7 days)
 * 
 * @param {Object} props
 * @param {Array} props.reservas - List of reservations
 * @param {string} props.monthStart - Start date of the month (YYYY-MM-DD)
 * @param {Function} props.onDateClick - Callback when a date is clicked
 */
export default function MonthlyView({ reservas, monthStart, onDateClick }) {
    // Generate calendar grid (6 weeks x 7 days = 42 days)
    const calendarDays = useMemo(() => {
        const firstDay = dayjs(monthStart).startOf('month');
        const startOfCalendar = firstDay.startOf('week');

        return Array.from({ length: 42 }, (_, i) =>
            startOfCalendar.add(i, 'day')
        );
    }, [monthStart]);

    // Group reservas by date
    const reservasByDate = useMemo(() => {
        const grouped = {};
        ensureArray(reservas).forEach(r => {
            const dateKey = dayjs(r.fecha).format('YYYY-MM-DD');
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(r);
        });
        return grouped;
    }, [reservas]);

    const currentMonth = dayjs(monthStart).month();

    return (
        <div>
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => {
                    const dateKey = day.format('YYYY-MM-DD');
                    const dayReservas = reservasByDate[dateKey] || [];
                    const isToday = day.isSame(dayjs(), 'day');
                    const isCurrentMonth = day.month() === currentMonth;

                    return (
                        <Card
                            key={dateKey}
                            onClick={() => onDateClick?.(dateKey)}
                            className={`
                min-h-[100px] p-2 cursor-pointer hover:shadow-lg transition-all
                ${!isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
              `}
                        >
                            <div className={`
                text-sm font-bold mb-2
                ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                                {day.format('D')}
                            </div>

                            <div className="space-y-1">
                                {dayReservas.slice(0, 3).map(r => (
                                    <div
                                        key={r._id}
                                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded truncate"
                                        title={`${r.hora} - ${r.servicioId?.nombre} - ${r.nombreCliente}`}
                                    >
                                        {r.hora} {r.servicioId?.nombre}
                                    </div>
                                ))}
                                {dayReservas.length > 3 && (
                                    <div className="text-xs text-gray-500 font-semibold">
                                        +{dayReservas.length - 3} más
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
