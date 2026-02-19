import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ModalNuevaReserva from '../../components/calendario/ModalNuevaReserva';
import ModalDetalleReserva from '../../components/calendario/ModalDetalleReserva';
import { getMonthReservations } from '../../services/calendarioService';
import { getBarberos } from '../../services/barberosService';
import { ChevronLeft, ChevronRight, Users, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import './CalendarioMensual.css';

// Setup localizer for react-big-calendar
const locales = {
    'es': es
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

export default function CalendarioMensual() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservations, setReservations] = useState([]);
    const [barberos, setBarberos] = useState([]);
    const [selectedBarbero, setSelectedBarbero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal states
    const [showNuevaReserva, setShowNuevaReserva] = useState(false);
    const [showDetalleReserva, setShowDetalleReserva] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [newReservaData, setNewReservaData] = useState({ fecha: '', hora: '' });

    // Load barberos on mount
    useEffect(() => {
        loadBarberos();
    }, []);

    // Load reservations when month or barbero changes
    useEffect(() => {
        loadReservations();
    }, [currentDate, selectedBarbero]);

    const loadBarberos = async () => {
        try {
            const data = await getBarberos();
            setBarberos(data);
        } catch (error) {
            console.error('Error loading barberos:', error);
        }
    };

    const loadReservations = async () => {
        try {
            setLoading(true);
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();
            const data = await getMonthReservations(month, year, selectedBarbero);
            setReservations(data.reservas || []);
        } catch (error) {
            console.error('Error loading reservations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReservations();
        setRefreshing(false);
    };

    const handlePreviousMonth = () => {
        setCurrentDate(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => addMonths(prev, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleSelectEvent = (event) => {
        setSelectedReserva(event.resource);
        setShowDetalleReserva(true);
    };

    const handleSelectSlot = (slotInfo) => {
        const fecha = format(slotInfo.start, 'yyyy-MM-dd');
        const hora = format(slotInfo.start, 'HH:mm');
        setNewReservaData({ fecha, hora });
        setShowNuevaReserva(true);
    };

    const handleModalSuccess = () => {
        loadReservations();
    };

    // Transform reservations to calendar events
    const events = useMemo(() => {
        return reservations.map(reserva => {
            const startDate = new Date(`${reserva.fecha}T${reserva.timeSlot?.hora || '00:00'}:00`);
            const duration = reserva.timeSlot?.duracion || 30;
            const endDate = new Date(startDate.getTime() + duration * 60000);

            return {
                id: reserva._id || reserva.id,
                title: `${reserva.nombreCliente} - ${reserva.servicio?.nombre || 'Servicio'}`,
                start: startDate,
                end: endDate,
                resource: reserva
            };
        });
    }, [reservations]);

    // Custom event style getter
    const eventStyleGetter = (event) => {
        const statusColors = {
            RESERVADA: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
            CONFIRMADA: { backgroundColor: '#22c55e', borderColor: '#16a34a' },
            COMPLETADA: { backgroundColor: '#6b7280', borderColor: '#4b5563' },
            CANCELADA: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
            NO_ASISTIO: { backgroundColor: '#f97316', borderColor: '#ea580c' }
        };

        const colors = statusColors[event.resource.estado] || statusColors.RESERVADA;

        return {
            style: {
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '6px',
                color: 'white',
                fontSize: '0.875rem',
                padding: '2px 6px'
            }
        };
    };

    // Custom messages in Spanish
    const messages = {
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'No hay reservas en este rango',
        showMore: total => `+ Ver más (${total})`
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Calendario Mensual</h1>
                    <p className="body-large text-gray-600 mt-2">
                        Vista mensual de reservas
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost" onClick={handleToday}>
                        Hoy
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* FILTERS */}
            <div className="card card-padding space-y-4">
                {/* Month navigation */}
                <div className="flex items-center justify-between">
                    <button className="btn btn-ghost" onClick={handlePreviousMonth}>
                        <ChevronLeft size={20} />
                        Mes Anterior
                    </button>

                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-xl capitalize">
                        <CalendarIcon size={24} className="text-blue-600" />
                        <span>{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
                    </div>

                    <button className="btn btn-ghost" onClick={handleNextMonth}>
                        Mes Siguiente
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Barbero filter */}
                <div>
                    <label className="label mb-2 flex items-center gap-2">
                        <Users size={16} className="text-blue-600" />
                        Filtrar por Barbero
                    </label>
                    <select
                        className="input w-full md:w-64"
                        value={selectedBarbero || ''}
                        onChange={(e) => setSelectedBarbero(e.target.value || null)}
                    >
                        <option value="">Todos los barberos</option>
                        {barberos.map((barbero) => (
                            <option key={barbero._id} value={barbero._id}>
                                {barbero.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* CALENDAR */}
            <div className="card card-padding">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="calendar-container" style={{ height: '700px' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            popup
                            eventPropGetter={eventStyleGetter}
                            messages={messages}
                            culture="es"
                            date={currentDate}
                            onNavigate={(date) => setCurrentDate(date)}
                            views={['month']}
                            defaultView="month"
                        />
                    </div>
                )}
            </div>

            {/* LEGEND */}
            <div className="card card-padding">
                <h3 className="heading-4 mb-4">Leyenda de Estados</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="body-small text-gray-600">Reservada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="body-small text-gray-600">Confirmada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-500"></div>
                        <span className="body-small text-gray-600">Completada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="body-small text-gray-600">Cancelada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500"></div>
                        <span className="body-small text-gray-600">No asistió</span>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <ModalNuevaReserva
                isOpen={showNuevaReserva}
                onClose={() => setShowNuevaReserva(false)}
                fecha={newReservaData.fecha}
                hora={newReservaData.hora}
                barberoId={selectedBarbero}
                onSuccess={handleModalSuccess}
            />

            <ModalDetalleReserva
                isOpen={showDetalleReserva}
                onClose={() => setShowDetalleReserva(false)}
                reserva={selectedReserva}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}
