import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Bell,
    Trash2,
    Calendar,
    Search,
    RefreshCw,
    MoreHorizontal,
    ChevronRight,
    User,
    Scissors,
    ExternalLink
} from 'lucide-react';
import waitingListService from '../../services/waitingListService';
import toast from 'react-hot-toast';

const WaitingListManager = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState('ACTIVA');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        loadWaitingList();
    }, [filter, slug]);

    const loadWaitingList = async () => {
        try {
            setLoading(true);
            const result = await waitingListService.getByBarberia(slug, { estado: filter });
            setData(result);
        } catch (error) {
            console.error('Error loading waiting list:', error);
            toast.error('Error al cargar lista de espera');
        } finally {
            setLoading(false);
        }
    };

    const handleNotify = async (entryId) => {
        if (!confirm('¿Notificar manualmente a este cliente?')) return;

        try {
            toast.loading('Notificando...', { id: 'notify' });
            await waitingListService.manualNotify(slug, entryId);
            toast.success('Cliente notificado exitosamente', { id: 'notify' });
            loadWaitingList();
        } catch (error) {
            console.error('Error notifying:', error);
            toast.error(error.response?.data?.error || 'Error al notificar', { id: 'notify' });
        }
    };

    const handleCancel = async (entryId) => {
        if (!confirm('¿Cancelar esta entrada de la lista de espera?')) return;

        try {
            toast.loading('Cancelando...', { id: 'cancel' });
            await waitingListService.cancel(slug, entryId);
            toast.success('Entrada cancelada', { id: 'cancel' });
            loadWaitingList();
        } catch (error) {
            console.error('Error cancelling:', error);
            toast.error('Error al cancelar', { id: 'cancel' });
        }
    };

    const getStatusConfig = (estado) => {
        const configs = {
            ACTIVA: {
                color: 'emerald',
                icon: Clock,
                label: 'Activa',
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-400',
                border: 'border-emerald-500/20'
            },
            NOTIFICADA: {
                color: 'blue',
                icon: Bell,
                label: 'Notificada',
                bg: 'bg-blue-500/10',
                text: 'text-blue-400',
                border: 'border-blue-500/20'
            },
            CONVERTIDA: {
                color: 'violet',
                icon: CheckCircle,
                label: 'Convertida',
                bg: 'bg-violet-500/10',
                text: 'text-violet-400',
                border: 'border-violet-500/20'
            },
            EXPIRADA: {
                color: 'amber',
                icon: AlertCircle,
                label: 'Expirada',
                bg: 'bg-amber-500/10',
                text: 'text-amber-400',
                border: 'border-amber-500/20'
            },
            CANCELADA: {
                color: 'red',
                icon: XCircle,
                label: 'Cancelada',
                bg: 'bg-red-500/10',
                text: 'text-red-400',
                border: 'border-red-500/20'
            }
        };

        return configs[estado] || configs.ACTIVA;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredEntries = data?.entries?.filter(entry =>
        entry.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        entry.clienteEmail?.toLowerCase().includes(busqueda.toLowerCase())
    ) || [];

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-neutral-500 animate-pulse text-sm font-medium">Cargando lista de espera...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200">
            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* ── HEADER ── */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Optimización de Agenda</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight italic">LISTA DE ESPERA</h1>
                        <p className="text-neutral-500 mt-1">Gestiona turnos prioritarios para cancelaciones o huecos libres</p>
                    </div>

                    <button
                        onClick={loadWaitingList}
                        className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl text-sm font-medium transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </button>
                </div>

                {/* ── STATS CARDS ── */}
                {data?.stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total', value: data.stats.total, icon: Users, color: 'blue' },
                            { label: 'Activas', value: data.stats.activas, icon: Clock, color: 'emerald' },
                            { label: 'Notificadas', value: data.stats.notificadas, icon: Bell, color: 'blue' },
                            { label: 'Conversión', value: `${data.stats.conversionRate}%`, icon: CheckCircle, color: 'violet' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-${stat.color}-500/10 transition-all`} />
                                <div className="flex items-start justify-between mb-2">
                                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{stat.label}</p>
                                    <stat.icon className={`w-4 h-4 text-neutral-700`} />
                                </div>
                                <p className="text-2xl font-black text-white tabular-nums">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── CONTROLES Y FILTROS ── */}
                <div className="mb-6 flex flex-col lg:flex-row gap-4">
                    {/* Buscador */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input
                            type="text"
                            placeholder="Buscar cliente por nombre o email..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-neutral-700"
                        />
                    </div>

                    {/* Filtros de estado */}
                    <div className="flex bg-neutral-900 border border-neutral-800 rounded-2xl p-1 p-1.5 overflow-x-auto no-scrollbar">
                        {['ACTIVA', 'NOTIFICADA', 'CONVERTIDA', 'EXPIRADA', 'CANCELADA'].map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFilter(estado)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === estado
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                                    : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                            >
                                {estado}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── TABLA DE ENTRADAS ── */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-800 bg-neutral-900/50">
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-widest">Posición</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-wider">Barbero / Servicio</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-wider">Preferencia Temporal</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-neutral-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-neutral-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {filteredEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-neutral-800 rounded-3xl flex items-center justify-center mb-4 text-neutral-600">
                                                    <Users size={32} />
                                                </div>
                                                <p className="text-white font-bold text-lg">Sin resultados</p>
                                                <p className="text-neutral-600 text-sm max-w-xs mx-auto mt-1">
                                                    No hay entradas en la lista de espera que coincidan con los criterios.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntries.map((entry, index) => {
                                        const status = getStatusConfig(entry.estado);
                                        const StatusIcon = status.icon;

                                        return (
                                            <tr key={entry._id} className="hover:bg-neutral-800/30 transition-all group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-black text-neutral-400 group-hover:border-violet-500/30 group-hover:text-violet-400 transition-all">
                                                            #{entry._posicion || index + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center text-neutral-400 font-bold text-xs uppercase shadow-inner">
                                                            {entry.clienteNombre?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm">{entry.clienteNombre}</div>
                                                            <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                                                                <User size={10} /> {entry.clienteEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded bg-neutral-800 flex items-center justify-center">
                                                                <Scissors size={10} className="text-neutral-500" />
                                                            </div>
                                                            <span className="text-xs text-neutral-300 truncate max-w-[120px]">
                                                                {entry.barberoId?.nombre || 'Cualquiera'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded bg-neutral-800 flex items-center justify-center">
                                                                <CheckCircle size={10} className="text-neutral-500" />
                                                            </div>
                                                            <span className="text-xs text-neutral-500 italic">
                                                                {entry.servicioId?.nombre || 'Servicio'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-neutral-600" />
                                                            {formatDate(entry.fechaPreferida)}
                                                        </div>
                                                        <div className="text-[10px] font-black text-neutral-600 flex items-center gap-1.5">
                                                            <Clock size={12} />
                                                            {entry.rangoHorario?.inicio} - {entry.rangoHorario?.fin}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${status.bg} ${status.text} ${status.border} text-[10px] font-black uppercase tracking-widest`}>
                                                        <StatusIcon size={12} />
                                                        {status.label}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-2 md:group-hover:translate-x-0">
                                                        {entry.estado === 'ACTIVA' && (
                                                            <button
                                                                onClick={() => handleNotify(entry._id)}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                                                                title="Notificar disponibilidad"
                                                            >
                                                                <Bell size={16} />
                                                            </button>
                                                        )}
                                                        {(entry.estado === 'ACTIVA' || entry.estado === 'NOTIFICADA') && (
                                                            <button
                                                                onClick={() => handleCancel(entry._id)}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-800 text-red-500 hover:bg-red-500/10 border border-neutral-700 hover:border-red-500/30 active:scale-95 transition-all"
                                                                title="Cancelar entrada"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 transition-all font-bold text-xs">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── FOOTER INFO ── */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Turnos Prioritarios
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                            Alta Tasa de Conversión
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hover:text-neutral-400 cursor-help transition-colors flex items-center gap-1">
                            Documentación API <ExternalLink size={10} />
                        </span>
                        <span>v2.4.0 Stable</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WaitingListManager;
