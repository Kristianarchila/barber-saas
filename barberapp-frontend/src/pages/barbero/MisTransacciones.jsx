import { useEffect, useState } from "react";
import { Card, Button, Skeleton, Badge } from "../../components/ui";
import ExportButton from "../../components/common/ExportButton";
import { exportTransaccionesToCSV, exportTransaccionesToPDF } from "../../utils/exportUtils";
import {
    Search,
    Filter,
    Download,
    Receipt,
    ChevronLeft,
    Calendar,
    Scissors,
    User,
    Info
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* VOLVER */}
            <Link to={`/${slug}/barbero/finanzas`} className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-semibold text-sm">
                <ChevronLeft size={16} />
                Volver a Mis Finanzas
            </Link>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Historial de Ganancias</h1>
                    <p className="body-large text-gray-600 mt-1">Detalle de cada servicio y su repartición correspondiente</p>
                </div>
                <div className="flex gap-2">
                    <ExportButton
                        onExportCSV={() => exportTransaccionesToCSV(transacciones, `transacciones-${dayjs().format('YYYY-MM-DD')}`)}
                        onExportPDF={() => exportTransaccionesToPDF(transacciones, `transacciones-${dayjs().format('YYYY-MM-DD')}`)}
                    />
                </div>
            </div>

            {/* TABLA / LISTA */}
            <Card className="border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            className="bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-blue-500 transition-colors w-full md:w-64"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-xs font-bold text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            {transacciones.length} Registros
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="caption text-gray-400 border-b border-gray-100">
                                <th className="p-5">Fecha & Servicio</th>
                                <th className="p-5">Cliente</th>
                                <th className="p-5 text-right">Monto Bruto</th>
                                <th className="p-5 text-right text-blue-600">Mi Ganancia</th>
                                <th className="p-5 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt size={32} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-semibold">Aún no tienes registros de ganancias</p>
                                    </td>
                                </tr>
                            ) : (
                                transacciones.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-all text-gray-500 group-hover:text-blue-600">
                                                    <Scissors size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-bold text-sm">{t.reservaId?.servicioId?.nombre || 'Servicio'}</p>
                                                    <p className="text-gray-500 text-xs">{dayjs(t.fecha).format('DD MMM, YYYY - HH:mm')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {t.reservaId?.nombreCliente?.charAt(0) || <User size={12} />}
                                                </div>
                                                <span className="text-gray-700 text-sm">{t.reservaId?.nombreCliente || 'Cliente'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-gray-600 font-mono text-sm">{formatCurrency(t.montoBruto)}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-blue-600 font-black text-sm">{formatCurrency(t.montoBarbero)}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <Badge variant={t.pagado ? 'success' : 'warning'} className="text-xs uppercase font-bold px-2 py-0.5">
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

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                <Info size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                    <strong>Nota sobre el historial:</strong> Los registros aparecen aquí automáticamente cada vez que marcas una cita como "Completada". El monto de "Mi Ganancia" ya descuenta la comisión de la barbería e impuestos (si aplican) según lo acordado con la administración.
                </p>
            </div>
        </div>
    );
}
