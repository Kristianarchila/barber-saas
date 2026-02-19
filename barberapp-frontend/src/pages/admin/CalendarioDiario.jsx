import { useState, useEffect } from 'react';
import { Skeleton } from '../../components/ui';
import GridDiario from '../../components/calendario/GridDiario';
import ModalNuevaReserva from '../../components/calendario/ModalNuevaReserva';
import ModalDetalleReserva from '../../components/calendario/ModalDetalleReserva';
import { getDayReservations } from '../../services/calendarioService';
import { getBarberos } from '../../services/barberosService';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    RefreshCw,
    Clock,
    Users
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CalendarioDiario() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservations, setReservations] = useState([]);
    const [barberos, setBarberos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal states
    const [showNuevaReserva, setShowNuevaReserva] = useState(false);
    const [showDetalleReserva, setShowDetalleReserva] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [newReservaData, setNewReservaData] = useState({ fecha: '', hora: '', barberoId: null });

    // Format date for display
    const dateStr = format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: es });
    const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    // Load barberos on mount
    useEffect(() => {
        loadBarberos();
    }, []);

    // Load reservations when date changes
    useEffect(() => {
        loadReservations();
    }, [currentDate]);

    const loadBarberos = async () => {
        try {
            const data = await getBarberos();
            // Filter only active barberos
            setBarberos(data.filter(b => b.activo));
        } catch (error) {
            console.error('Error loading barberos:', error);
        }
    };

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await getDayReservations(currentDate);
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

    const handlePreviousDay = () => {
        setCurrentDate(prev => subDays(prev, 1));
    };

    const handleNextDay = () => {
        setCurrentDate(prev => addDays(prev, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleReservaClick = (reserva) => {
        setSelectedReserva(reserva);
        setShowDetalleReserva(true);
    };

    const handleEmptySlotClick = (date, time, barberoId) => {
        setNewReservaData({ fecha: date, hora: time, barberoId });
        setShowNuevaReserva(true);
    };

    const handleModalSuccess = () => {
        loadReservations();
    };

    // Calculate stats for the day
    const stats = {
        total: reservations.length,
        completadas: reservations.filter(r => r.estado === 'COMPLETADA').length,
        reservadas: reservations.filter(r => r.estado === 'RESERVADA').length,
        canceladas: reservations.filter(r => r.estado === 'CANCELADA').length
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Calendario Diario</h1>
                    <p className="body-large text-gray-600 mt-2 capitalize">
                        {dateStr}
                        {isToday && <span className="ml-2 text-blue-600 font-semibold">• HOY</span>}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        className="btn btn-ghost"
                        onClick={handleToday}
                        disabled={isToday}
                    >
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

            {/* NAVIGATION & STATS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date navigation */}
                <div className="card card-padding">
                    <div className="flex items-center justify-between">
                        <button className="btn btn-ghost" onClick={handlePreviousDay}>
                            <ChevronLeft size={20} />
                            Día Anterior
                        </button>

                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <CalendarIcon size={20} className="text-blue-600" />
                            <span>{format(currentDate, 'd MMM yyyy', { locale: es })}</span>
                        </div>

                        <button className="btn btn-ghost" onClick={handleNextDay}>
                            Día Siguiente
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Day stats */}
                <div className="card card-padding">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="caption text-gray-500 mt-1">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.reservadas}</div>
                            <div className="caption text-gray-500 mt-1">Reservadas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.completadas}</div>
                            <div className="caption text-gray-500 mt-1">Completadas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.canceladas}</div>
                            <div className="caption text-gray-500 mt-1">Canceladas</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CALENDAR GRID */}
            <div className="card card-padding">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Clock className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h3 className="heading-3">
                            Agenda del Día
                        </h3>
                        <p className="body-small text-gray-500 flex items-center gap-2">
                            <Users size={14} />
                            {barberos.length} {barberos.length === 1 ? 'barbero' : 'barberos'} activos
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} variant="rectangular" height="h-16" />
                        ))}
                    </div>
                ) : (
                    <GridDiario
                        date={format(currentDate, 'yyyy-MM-dd')}
                        barberos={barberos}
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
                barberoId={newReservaData.barberoId}
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
