import { useEffect, useState } from "react";
import { Card, Button, Skeleton, Badge } from "../../components/ui";
import {
    Search,
    Filter,
    Download,
    Receipt,
    ChevronLeft,
    Calendar,
    Scissors,
    User
} from "lucide-react";
import { getMisTransacciones } from "../../services/transactionService";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";

export default function MisTransacciones() {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [transacciones, setTransacciones] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const data = await getMisTransacciones();
            setTransacciones(data.transactions || []);
            setStats(data.resumen || null);
        } catch (error) {
            console.error("Error cargando transacciones:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6 animate-slide-in">
            {/* VOLVER */}
            <Link to={`/${slug}/barbero/finanzas`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors font-bold text-sm">
                <ChevronLeft size={16} />
                Volver a Mis Finanzas
            </Link>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Historial de Ganancias</h1>
                    <p className="text-slate-500 mt-1">Detalle de cada servicio y su repartición correspondiente</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-800">
                        <Download size={18} className="mr-2" /> Exportar
                    </Button>
                </div>
            </div>

            {/* TABLA / LISTA */}
            <Card className="border-slate-800 bg-slate-900/30 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            className="bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-indigo-500 transition-colors w-full md:w-64"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            {transacciones.length} Registros
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-800">
                                <th className="p-5">Fecha & Servicio</th>
                                <th className="p-5">Cliente</th>
                                <th className="p-5 text-right">Monto Bruto</th>
                                <th className="p-5 text-right text-indigo-400">Mi Ganancia</th>
                                <th className="p-5 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan="5" className="p-4">
                                            <Skeleton variant="rectangular" height="h-12" />
                                        </td>
                                    </tr>
                                ))
                            ) : transacciones.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt size={32} className="text-slate-600" />
                                        </div>
                                        <p className="text-slate-500 font-bold">Aún no tienes registros de ganancias</p>
                                    </td>
                                </tr>
                            ) : (
                                transacciones.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500/20 transition-all text-slate-500 group-hover:text-indigo-400">
                                                    <Scissors size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{t.reservaId?.servicioId?.nombre || 'Servicio'}</p>
                                                    <p className="text-slate-500 text-xs">{dayjs(t.fecha).format('DD MMM, YYYY - HH:mm')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                    {t.reservaId?.nombreCliente?.charAt(0) || <User size={12} />}
                                                </div>
                                                <span className="text-slate-300 text-sm">{t.reservaId?.nombreCliente || 'Cliente'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-slate-400 font-mono text-sm">{formatCurrency(t.montoBruto)}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-indigo-400 font-black text-sm">{formatCurrency(t.montoBarbero)}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <Badge variant={t.pagado ? 'success' : 'warning'} className="text-[10px] uppercase font-black px-2 py-0.5">
                                                {t.pagado ? 'Pagado' : 'Pendiente'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
                <Info size={20} className="text-indigo-400 mt-1 flex-shrink-0" />
                <p className="text-xs text-indigo-300/80 leading-relaxed">
                    <strong>Nota sobre el historial:</strong> Los registros aparecen aquí automáticamente cada vez que marcas una cita como "Completada". El monto de "Mi Ganancia" ya descuenta la comisión de la barbería e impuestos (si aplican) según lo acordado con la administración.
                </p>
            </div>
        </div>
    );
}

function Info(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}
