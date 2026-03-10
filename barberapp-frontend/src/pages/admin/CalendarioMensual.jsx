import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ModalNuevaReserva from '../../components/calendario/ModalNuevaReserva';
import ModalDetalleReserva from '../../components/calendario/ModalDetalleReserva';
import { getMonthReservations } from '../../services/calendarioService';
import { getBarberos } from '../../services/barberosService';
import { ChevronLeft, ChevronRight, Users, RefreshCw, Calendar as CalendarIcon, Scissors } from 'lucide-react';
import './CalendarioMensual.css';

// ──────────────────────────────────────────────────────────────
// Custom monthly event component — premium card style
// ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
    RESERVADA:  { from: '#3b82f6', to: '#2563eb' },
    CONFIRMADA: { from: '#22c55e', to: '#16a34a' },
    COMPLETADA: { from: '#6b7280', to: '#4b5563' },
    CANCELADA:  { from: '#ef4444', to: '#dc2626' },
    NO_ASISTIO: { from: '#f97316', to: '#ea580c' },
};

function MonthEvent({ event }) {
    const reserva = event.resource;
    const cfg = STATUS_CFG[reserva?.estado] || STATUS_CFG.RESERVADA;
    const barberoNombre = reserva?.barbero?.nombre || '';
    const barberoFoto   = reserva?.barbero?.foto   || null;
    const initials = barberoNombre
        ? barberoNombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';
    const hora = reserva?.hora || '';
    const servicioNombre = reserva?.servicio?.nombre || '';

    return (
        <div
            style={{
                background: `linear-gradient(135deg, ${cfg.from}28, ${cfg.to}18)`,
                borderLeft: `2.5px solid ${cfg.from}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 6px',
                overflow: 'hidden',
                minWidth: 0,
            }}
        >
            {/* Tiny avatar */}
            <div
                style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    fontWeight: 700,
                    color: '#fff',
                    overflow: 'hidden',
                }}
            >
                {barberoFoto ? (
                    <img src={barberoFoto} alt={barberoNombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
            </div>

            {/* Text */}
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: cfg.from, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {reserva?.nombreCliente || 'Cliente'}
                </div>
                {(servicioNombre || hora) && (
                    <div style={{ fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {hora && <span>{hora} </span>}
                        {servicioNombre && <span>· {servicioNombre}</span>}
                    </div>
                )}
            </div>

            {/* Glow dot */}
            <div style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: cfg.from, boxShadow: `0 0 5px ${cfg.from}` }} />
        </div>
    );
}


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
            // getDetails() returns flat `hora`, `duracion`; timeSlot.* is legacy shape
            const hora = reserva.hora || reserva.timeSlot?.hora || '00:00';
            const duration = reserva.duracion || reserva.timeSlot?.duracion || 30;
            const startDate = new Date(`${reserva.fecha}T${hora}:00`);
            const endDate = new Date(startDate.getTime() + duration * 60000);

            return {
                id: reserva._id || reserva.id,
                title: `${reserva.nombreCliente} - ${reserva.servicio?.nombre || reserva.servicio || 'Servicio'}`,
                start: startDate,
                end: endDate,
                resource: reserva
            };
        });
    }, [reservations]);

    // Custom event style getter — empty styles since MonthEvent handles visuals
    const eventStyleGetter = () => ({
        style: {
            background: 'transparent',
            border: 'none',
            padding: 0,
        }
    });

    // Custom components
    const calendarComponents = useMemo(() => ({ event: MonthEvent }), []);


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
                <div className="flex items-center justify-between gap-2">
                    <button className="btn btn-ghost btn-sm flex-shrink-0" onClick={handlePreviousMonth}>
                        <ChevronLeft size={20} />
                        <span className="hidden md:inline">Mes Anterior</span>
                    </button>

                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg capitalize text-center">
                        <CalendarIcon size={20} className="text-blue-600 flex-shrink-0 hidden sm:block" />
                        <span>{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
                    </div>

                    <button className="btn btn-ghost btn-sm flex-shrink-0" onClick={handleNextMonth}>
                        <span className="hidden md:inline">Mes Siguiente</span>
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
                    <div className="calendar-container" style={{ height: 'clamp(380px, 60vh, 700px)' }}>
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
                            components={calendarComponents}
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
