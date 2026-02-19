import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, Bell, Trash2 } from 'lucide-react';
import waitingListService from '../../services/waitingListService';
import toast from 'react-hot-toast';

const WaitingListManager = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState('ACTIVA');

    useEffect(() => {
        loadWaitingList();
    }, [filter]);

    const loadWaitingList = async () => {
        try {
            setLoading(true);
            const barberiaId = localStorage.getItem('barberiaId');
            const result = await waitingListService.getByBarberia(barberiaId, { estado: filter });
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
            await waitingListService.manualNotify(entryId);
            toast.success('Cliente notificado exitosamente');
            loadWaitingList();
        } catch (error) {
            console.error('Error notifying:', error);
            toast.error(error.response?.data?.error || 'Error al notificar');
        }
    };

    const handleCancel = async (entryId) => {
        if (!confirm('¿Cancelar esta entrada de la lista de espera?')) return;

        try {
            await waitingListService.cancel(entryId);
            toast.success('Entrada cancelada');
            loadWaitingList();
        } catch (error) {
            console.error('Error cancelling:', error);
            toast.error('Error al cancelar');
        }
    };

    const getStatusBadge = (estado) => {
        const badges = {
            ACTIVA: { bg: 'bg-green-100', text: 'text-green-800', icon: Clock, label: 'Activa' },
            NOTIFICADA: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Bell, label: 'Notificada' },
            CONVERTIDA: { bg: 'bg-purple-100', text: 'text-purple-800', icon: CheckCircle, label: 'Convertida' },
            EXPIRADA: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: 'Expirada' },
            CANCELADA: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelada' }
        };

        const badge = badges[estado] || badges.ACTIVA;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={14} />
                {badge.label}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="text-purple-600" size={36} />
                    Lista de Espera
                </h1>
                <p className="text-gray-600 mt-2">
                    Gestiona los clientes en lista de espera para horarios no disponibles
                </p>
            </div>

            {/* Stats Cards */}
            {data?.stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-3xl font-bold text-gray-900">{data.stats.total}</p>
                            </div>
                            <Users className="text-gray-400" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Activas</p>
                                <p className="text-3xl font-bold text-green-600">{data.stats.activas}</p>
                            </div>
                            <Clock className="text-green-400" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Notificadas</p>
                                <p className="text-3xl font-bold text-blue-600">{data.stats.notificadas}</p>
                            </div>
                            <Bell className="text-blue-400" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tasa Conversión</p>
                                <p className="text-3xl font-bold text-purple-600">{data.stats.conversionRate}%</p>
                            </div>
                            <CheckCircle className="text-purple-400" size={32} />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-2">
                    {['ACTIVA', 'NOTIFICADA', 'CONVERTIDA', 'EXPIRADA', 'CANCELADA'].map(estado => (
                        <button
                            key={estado}
                            onClick={() => setFilter(estado)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === estado
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {estado.charAt(0) + estado.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Posición
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Barbero
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Servicio
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Preferida
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Horario
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.entries?.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No hay entradas en esta categoría
                                    </td>
                                </tr>
                            ) : (
                                data?.entries?.map((entry, index) => (
                                    <tr key={entry._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
                                                #{entry._posicion || index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{entry.clienteNombre}</div>
                                                <div className="text-sm text-gray-500">{entry.clienteEmail}</div>
                                                {entry.clienteTelefono && (
                                                    <div className="text-sm text-gray-500">{entry.clienteTelefono}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{entry.barberoId?.nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{entry.servicioId?.nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(entry.fechaPreferida)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {entry.rangoHorario?.inicio} - {entry.rangoHorario?.fin}
                                            </div>
                                            {entry.diasPreferidos?.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {entry.diasPreferidos.join(', ')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(entry.estado)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {entry.estado === 'ACTIVA' && (
                                                    <button
                                                        onClick={() => handleNotify(entry._id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Notificar manualmente"
                                                    >
                                                        <Bell size={18} />
                                                    </button>
                                                )}
                                                {(entry.estado === 'ACTIVA' || entry.estado === 'NOTIFICADA') && (
                                                    <button
                                                        onClick={() => handleCancel(entry._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Cancelar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WaitingListManager;
