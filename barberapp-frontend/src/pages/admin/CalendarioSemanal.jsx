import { useState, useEffect } from 'react';
import { Skeleton } from '../../components/ui';
import GridSemanal from '../../components/calendario/GridSemanal';
import ModalNuevaReserva from '../../components/calendario/ModalNuevaReserva';
import ModalDetalleReserva from '../../components/calendario/ModalDetalleReserva';
import { getWeekReservations } from '../../services/calendarioService';
import { getBarberos } from '../../services/barberosService';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Users,
    RefreshCw
} from 'lucide-react';
import {
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    format,
    eachDayOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';

export default function CalendarioSemanal() {
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

    // Calculate week days
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Format week range for display
    const weekRange = `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`;

    // Load barberos on mount
    useEffect(() => {
        loadBarberos();
    }, []);

    // Load reservations when week or barbero changes
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
            const data = await getWeekReservations(currentDate, selectedBarbero);
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

    const handlePreviousWeek = () => {
        setCurrentDate(prev => subWeeks(prev, 1));
    };

    const handleNextWeek = () => {
        setCurrentDate(prev => addWeeks(prev, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleReservaClick = (reserva) => {
        setSelectedReserva(reserva);
        setShowDetalleReserva(true);
    };

    const handleEmptySlotClick = (date, time) => {
        setNewReservaData({ fecha: date, hora: time });
        setShowNuevaReserva(true);
    };

    const handleModalSuccess = () => {
        loadReservations();
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Calendario Semanal</h1>
                    <p className="body-large text-gray-600 mt-2">
                        Vista semanal de reservas
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
                {/* Week navigation */}
                <div className="flex items-center justify-between">
                    <button className="btn btn-ghost" onClick={handlePreviousWeek}>
                        <ChevronLeft size={20} />
                        Semana Anterior
                    </button>

                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <CalendarIcon size={20} className="text-blue-600" />
                        <span>{weekRange}</span>
                    </div>

                    <button className="btn btn-ghost" onClick={handleNextWeek}>
                        Semana Siguiente
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

            {/* CALENDAR GRID */}
            <div className="card card-padding">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} variant="rectangular" height="h-16" />
                        ))}
                    </div>
                ) : (
                    <GridSemanal
                        weekDays={weekDays.map(d => format(d, 'yyyy-MM-dd'))}
                        reservations={reservations}
                        onReservaClick={handleReservaClick}
                        onEmptySlotClick={handleEmptySlotClick}
                    />
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
