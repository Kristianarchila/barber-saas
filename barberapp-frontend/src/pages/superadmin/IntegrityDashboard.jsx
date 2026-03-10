import { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle, Server, Database, Mail, CreditCard, RefreshCw, Clock } from 'lucide-react';
import { getSystemIntegrity } from '../../services/superAdminService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const ServiceIcon = ({ type, status }) => {
    const colorClass = status === 'healthy' ? 'text-green-500' : status === 'degraded' ? 'text-yellow-500' : 'text-danger';
    const BgClass = status === 'healthy' ? 'bg-green-50' : status === 'degraded' ? 'bg-yellow-50' : 'bg-red-50';

    const icons = {
        mongodb: <Database size={18} />,
        email: <Mail size={18} />,
        stripe: <CreditCard size={18} />,
        cloudinary: <Server size={18} />
    };

    return (
        <div className={`p-3 rounded-xl ${BgClass} ${colorClass}`}>
            {icons[type] || <Activity size={18} />}
        </div>
    );
};

export default function IntegrityDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchIntegrity();
        const interval = setInterval(fetchIntegrity, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchIntegrity = async (showToast = false) => {
        try {
            if (showToast) setRefreshing(true);
            const response = await getSystemIntegrity();
            setData(response);
            if (showToast) toast.success('Estado actualizado');
        } catch (error) {
            console.error('Error fetching integrity data:', error);
            toast.error('Error al cargar datos de integridad');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="animate-spin text-primary" />
        </div>
    );

    const health = data.health || {};
    const securityAlerts = data.securityAlerts || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Shield className="text-primary" />
                        Integridad y Seguridad del SaaS
                    </h1>
                    <p className="text-gray-500 text-sm">Monitoreo proactivo y detección de anomalías en tiempo real.</p>
                </div>
                <button
                    onClick={() => fetchIntegrity(true)}
                    disabled={refreshing}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : ''} text-gray-400`} />
                </button>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(health.services || {}).map(([key, service]) => (
                    <div key={key} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <ServiceIcon type={key} status={service.status} />
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${service.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {service.status}
                            </span>
                        </div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{key}</h3>
                        <p className="text-sm font-bold text-gray-700 truncate">{service.message}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Security Alerts */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-black text-gray-900 uppercase">Alertas de Seguridad Recientes</h2>
                            <AlertTriangle size={16} className="text-yellow-600" />
                        </div>
                        <div className="divide-y divide-gray-50">
                            {securityAlerts.length > 0 ? securityAlerts.map((alert, idx) => (
                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-1.5 rounded-lg ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                <Shield size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{alert.action}</p>
                                                <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Clock size={10} /> {format(new Date(alert.createdAt), 'HH:mm:ss d MMM', { locale: es })}
                                                    </span>
                                                    {alert.request?.ip && (
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                                                            IP: {alert.request.ip}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center">
                                    <CheckCircle size={32} className="mx-auto text-green-500 mb-2 opacity-20" />
                                    <p className="text-gray-400 text-sm">No hay alertas de seguridad en los últimos 7 días</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Stats */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-gray-900 uppercase mb-4">Recursos del Servidor</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500 font-bold">Memoria RAM</span>
                                    <span className="text-gray-900 font-black">{health.memory?.used} {health.memory?.unit}</span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{ width: `${Math.min((health.memory?.used / health.memory?.total) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uptime</p>
                                <p className="text-sm font-black text-gray-700">
                                    {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                                </p>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entorno</p>
                                <p className="text-sm font-black text-gray-700 capitalize">{health.environment}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white text-center">
                        <Shield className="mx-auto mb-2 text-primary" size={24} />
                        <h3 className="text-sm font-black">S.I.A.S. Activo</h3>
                        <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest">Protección proactiva</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
