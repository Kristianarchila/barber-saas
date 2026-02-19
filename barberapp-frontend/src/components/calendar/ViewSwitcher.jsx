import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

/**
 * ViewSwitcher Component
 * Allows users to switch between Day, Week, and Month calendar views
 * 
 * @param {Object} props
 * @param {string} props.currentView - Current active view ('day', 'week', 'month')
 * @param {Function} props.onViewChange - Callback when view changes
 */
export default function ViewSwitcher({ currentView, onViewChange }) {
    const views = [
        { id: 'day', label: 'Día', icon: Calendar },
        { id: 'week', label: 'Semana', icon: CalendarDays },
        { id: 'month', label: 'Mes', icon: CalendarRange }
    ];

    return (
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {views.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onViewChange(id)}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all
            ${currentView === id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'}
          `}
                    aria-label={`Vista ${label}`}
                    aria-pressed={currentView === id}
                >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
