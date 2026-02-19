import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX, Clock, Mail, Calendar, CheckCircle2, XCircle, Loader2, Users } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CuentasPendientes() {
    const [pendingAccounts, setPendingAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => { fetchPendingAccounts(); }, []);

    const fetchPendingAccounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/superadmin/pending-accounts');
            setPendingAccounts(response.data.accounts || []);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar cuentas pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (accountId) => {
        if (!confirm('¿Aprobar esta cuenta? Se creará la barbería automáticamente.')) return;
        try {
            setActionLoading(accountId);
            await api.post(`/superadmin/pending-accounts/${accountId}/approve`);
            toast.success('✅ Cuenta aprobada — barbería creada');
            fetchPendingAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al aprobar cuenta');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (accountId) => {
        if (!confirm('¿Rechazar esta cuenta?')) return;
        try {
            setActionLoading(accountId);
            await api.post(`/superadmin/pending-accounts/${accountId}/reject`);
            toast.success('Cuenta rechazada');
            fetchPendingAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al rechazar cuenta');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SuperAdmin / Cuentas</p>
                    <h1 className="text-3xl font-black text-gray-900">Cuentas Pendientes</h1>
                    <p className="text-gray-500 text-sm mt-1">Revisa y aprueba las solicitudes de registro de nuevas barberías</p>
                </div>
                <button
                    onClick={fetchPendingAccounts}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                    <Clock size={16} /> Actualizar
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-50 rounded-xl"><Clock size={20} className="text-yellow-500" /></div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pendientes</p>
                            <p className="text-3xl font-black text-yellow-600">{pendingAccounts.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-xl"><UserCheck size={20} className="text-green-500" /></div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Acción requerida</p>
                            <p className="text-sm font-bold text-gray-700 mt-1">Revisar solicitudes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl"><Users size={20} className="text-blue-500" /></div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Al aprobar</p>
                            <p className="text-sm font-bold text-gray-700 mt-1">Se crea barbería automáticamente</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* LOADING */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
            ) : pendingAccounts.length === 0 ? (
                /* EMPTY STATE */
                <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">¡Todo al día!</h3>
                    <p className="text-gray-400 text-sm">No hay cuentas pendientes de aprobación</p>
                </div>
            ) : (
                /* LIST */
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {pendingAccounts.length} solicitud{pendingAccounts.length !== 1 ? 'es' : ''} pendiente{pendingAccounts.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {pendingAccounts.map((account, index) => (
                            <motion.div
                                key={account.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                            >
                                {/* Avatar + Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                        {account.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{account.nombre}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail size={12} /> {account.email}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar size={12} />
                                                {formatDistanceToNow(new Date(account.createdAt), { locale: es, addSuffix: true })}
                                            </span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-black rounded-full border border-yellow-200">
                                            <Clock size={10} /> Pendiente de aprobación
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleReject(account.id)}
                                        disabled={actionLoading === account.id}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === account.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                        Rechazar
                                    </button>
                                    <button
                                        onClick={() => handleApprove(account.id)}
                                        disabled={actionLoading === account.id}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === account.id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                                        Aprobar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
