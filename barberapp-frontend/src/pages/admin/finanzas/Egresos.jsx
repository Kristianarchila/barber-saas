import { useState, useEffect } from "react";
import { DollarSign, Plus, Edit2, Trash2, Filter, TrendingDown, Package, Users, Briefcase, Zap, Tag, MoreHorizontal, Calendar, CreditCard } from "lucide-react";
import {
    obtenerEgresos,
    obtenerResumenEgresos,
    registrarEgreso,
    eliminarEgreso,
    CATEGORIAS_EGRESOS
} from "../../../services/egresosService";
import { Card, Button, Badge } from "../../../components/ui";
import { ErrorAlert } from "../../../components/ErrorComponents";
import { useApiCall } from "../../../hooks/useApiCall";
import { useAsyncAction } from "../../../hooks/useAsyncAction";
import { motion } from "framer-motion";

export default function Egresos() {
    const [egresos, setEgresos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [filtros, setFiltros] = useState({
        fechaInicio: new Date().toISOString().slice(0, 7) + "-01",
        fechaFin: new Date().toISOString().slice(0, 10),
        categoria: ""
    });

    // Hook para cargar datos
    const { execute: cargarDatos, loading, error } = useApiCall(
        async () => {
            const [egresosData, resumenData] = await Promise.all([
                obtenerEgresos(filtros),
                obtenerResumenEgresos(filtros.fechaInicio.slice(0, 7))
            ]);
            return { egresosData, resumenData };
        },
        {
            errorMessage: 'Error al cargar los egresos e informes mensules.',
            onSuccess: ({ egresosData, resumenData }) => {
                setEgresos(egresosData);
                setResumen(resumenData);
            }
        }
    );

    useEffect(() => {
        cargarDatos();
    }, [filtros]);

    // Hook para eliminar egreso
    const { execute: confirmEliminar } = useAsyncAction(
        eliminarEgreso,
        {
            successMessage: '✅ Gasto eliminado del registro',
            errorMessage: 'Error al eliminar el registro de gasto',
            confirmMessage: '¿Estás seguro de eliminar este registro de gasto? Esta acción puede afectar los balances mensuales.',
            onSuccess: cargarDatos
        }
    );

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP"
        }).format(monto);
    };

    const getCategoriaConfig = (categoria) => {
        const configs = {
            ARRIENDO: { color: "bg-purple-50 text-purple-600 border-purple-100", icon: <Briefcase size={14} /> },
            SERVICIOS_BASICOS: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: <Zap size={14} /> },
            SUELDOS: { color: "bg-green-50 text-green-600 border-green-100", icon: <Users size={14} /> },
            COMISIONES: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: <TrendingDown size={14} /> },
            PRODUCTOS: { color: "bg-pink-50 text-pink-600 border-pink-100", icon: <Package size={14} /> },
            EQUIPAMIENTO: { color: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: <Package size={14} /> },
            MARKETING: { color: "bg-orange-50 text-orange-600 border-orange-100", icon: <Zap size={14} /> },
            IMPUESTOS: { color: "bg-red-50 text-red-600 border-red-100", icon: <Briefcase size={14} /> },
            MANTENIMIENTO: { color: "bg-cyan-50 text-cyan-600 border-cyan-100", icon: <Zap size={14} /> },
            OTROS: { color: "bg-gray-50 text-gray-600 border-gray-100", icon: <Tag size={14} /> }
        };
        return configs[categoria] || configs.OTROS;
    };

    if (loading && egresos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <ErrorAlert
                    title="Error al conectar con el servidor de finanzas"
                    message={error}
                    onRetry={cargarDatos}
                    variant="error"
                />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <TrendingDown className="text-red-500" size={32} />
                        Gestión de Egresos
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Control de gastos operativos y pagos a proveedores
                    </p>
                </div>
                <Button
                    onClick={() => setModalAbierto(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg transition-all transform hover:scale-[1.02]"
                >
                    <Plus size={20} />
                    Nuevo Egreso
                </Button>
            </header>

            {/* Resumen Cards */}
            {resumen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white group hover:ring-red-100 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 rounded-xl text-red-600">
                                <TrendingDown size={20} />
                            </div>
                            <span className="badge badge-error">Gasto Total</span>
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Egresos del Mes</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">
                            {formatearMonto(resumen.totalEgresos)}
                        </h3>
                        <p className="caption text-gray-400 mt-2 font-bold">{resumen.cantidadEgresos} registros encontrados</p>
                    </Card>

                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white group hover:ring-blue-100 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <CreditCard size={20} />
                            </div>
                            <span className="badge badge-info">IVA Crédito</span>
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Crédito Fiscal Est.</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">
                            {formatearMonto(resumen.totalIvaCredito)}
                        </h3>
                        <p className="caption text-gray-400 mt-2 font-bold italic">Recuperable del SII</p>
                    </Card>

                    <Card className="p-8 shadow-sm border-none ring-1 ring-gray-100 bg-white group hover:ring-indigo-100 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <Calendar size={20} />
                            </div>
                            <span className="badge badge-secondary">Hoy</span>
                        </div>
                        <p className="caption text-gray-500 font-bold uppercase tracking-widest">Gasto Diario</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">
                            {formatearMonto(resumen.egresosHoy)}
                        </h3>
                        <p className="caption text-gray-400 mt-2 font-bold italic">Actualizado en tiempo real</p>
                    </Card>
                </div>
            )}

            {/* Resumen por Categoría */}
            {resumen && resumen.porCategoria && resumen.porCategoria.length > 0 && (
                <div className="space-y-6">
                    <h2 className="heading-4 text-gray-900">Distribución por Categoría</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {resumen.porCategoria.map((cat) => {
                            const config = getCategoriaConfig(cat.categoria);
                            return (
                                <div key={cat.categoria} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg ${config.color.split(' ')[0]} ${config.color.split(' ')[1]}`}>
                                            {config.icon}
                                        </div>
                                        <span className="font-black text-gray-900 uppercase text-[10px] tracking-widest">
                                            {CATEGORIAS_EGRESOS.find(c => c.value === cat.categoria)?.label || cat.categoria}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{formatearMonto(cat.total)}</p>
                                    <div className="w-full h-1 bg-gray-50 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className={`h-full ${config.color.split(' ')[1].replace('text-', 'bg-')}`}
                                            style={{ width: `${cat.porcentaje}%` }}
                                        />
                                    </div>
                                    <p className="caption text-gray-400 font-bold mt-2">
                                        {cat.cantidad} registros • {cat.porcentaje}%
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filtros */}
            <Card className="flex flex-col md:flex-row items-center gap-8 p-6 shadow-sm border-none ring-1 ring-gray-100">
                <div className="flex items-center gap-4 border-r border-gray-100 pr-8">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                        <Filter size={20} />
                    </div>
                    <p className="caption text-gray-500 font-bold uppercase tracking-widest">Filtrar Egresos</p>
                </div>
                <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-3">
                        <span className="caption font-black text-gray-400">Desde:</span>
                        <input
                            type="date"
                            value={filtros.fechaInicio}
                            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                            className="input font-bold"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="caption font-black text-gray-400">Hasta:</span>
                        <input
                            type="date"
                            value={filtros.fechaFin}
                            onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                            className="input font-bold"
                        />
                    </div>
                </div>
            </Card>

            {/* Tabla de Egresos */}
            <Card className="overflow-hidden border-none ring-1 ring-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-left caption text-gray-500 font-black uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-5 text-left caption text-gray-500 font-black uppercase tracking-widest">Categoría</th>
                                <th className="px-6 py-5 text-left caption text-gray-500 font-black uppercase tracking-widest">Descripción / Proveedor</th>
                                <th className="px-6 py-5 text-right caption text-gray-500 font-black uppercase tracking-widest">Monto Total</th>
                                <th className="px-6 py-5 text-right caption text-gray-500 font-black uppercase tracking-widest">IVA Estimado</th>
                                <th className="px-6 py-5 text-center caption text-gray-500 font-black uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {egresos.map((egreso) => {
                                const config = getCategoriaConfig(egreso.categoria);
                                return (
                                    <tr key={egreso._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 body-small font-bold text-gray-900 border-l-4 border-transparent hover:border-blue-500 transition-all">
                                            {new Date(egreso.fecha).toLocaleDateString("es-CL")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${config.color}`}>
                                                {CATEGORIAS_EGRESOS.find(c => c.value === egreso.categoria)?.label || egreso.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="body-small font-black text-gray-900">{egreso.descripcion}</p>
                                            {egreso.nombreProveedor && (
                                                <p className="caption text-gray-400 font-bold mt-0.5">{egreso.nombreProveedor}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right body-small font-black text-red-600">
                                            {formatearMonto(egreso.montoTotal)}
                                        </td>
                                        <td className="px-6 py-4 text-right body-small font-bold text-blue-600 italic">
                                            {formatearMonto(egreso.iva)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => confirmEliminar(egreso._id)}
                                                    className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {egresos.length === 0 && (
                    <div className="text-center py-24 bg-white">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100">
                            <TrendingDown size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Historial de Egresos Vacío</h3>
                        <p className="body-small text-gray-400 max-w-xs mx-auto">No se registraron movimientos en este periodo corporativo.</p>
                    </div>
                )}
            </Card>

            {/* Modal Nuevo Egreso */}
            {modalAbierto && (
                <ModalNuevoEgreso
                    onClose={() => setModalAbierto(false)}
                    onSuccess={() => {
                        setModalAbierto(false);
                        cargarDatos();
                    }}
                />
            )}
        </div>
    );
}

// Modal Nuevo Egreso
function ModalNuevoEgreso({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().slice(0, 10),
        categoria: "",
        descripcion: "",
        monto: "",
        incluyeIva: true,
        tipoDocumento: "BOLETA",
        numeroDocumento: "",
        nombreProveedor: "",
        metodoPago: "TRANSFERENCIA"
    });

    const { execute: handleSubmit, loading: loadingSubmit } = useAsyncAction(
        async (e) => {
            e.preventDefault();
            return await registrarEgreso({
                ...formData,
                monto: parseFloat(formData.monto)
            });
        },
        {
            successMessage: '✅ Gasto registrado exitosamente',
            errorMessage: 'Error al registrar el egreso',
            onSuccess
        }
    );

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl relative border-none"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="heading-2 text-gray-900">Registrar Egreso</h2>
                        <p className="body-large text-gray-500 mt-1">Ingresa los detalles del gasto corporativo</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-all">
                        <Plus size={24} className="rotate-45 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="caption font-black text-gray-500 uppercase tracking-widest">Fecha de Gasto</label>
                            <input
                                type="date"
                                value={formData.fecha}
                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                className="input font-bold w-full"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="caption font-black text-gray-500 uppercase tracking-widest">Categoría Operativa</label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="input font-bold w-full"
                                required
                            >
                                <option value="">Seleccionar Categoría...</option>
                                {CATEGORIAS_EGRESOS.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="caption font-black text-gray-500 uppercase tracking-widest">Descripción del Movimiento</label>
                        <input
                            type="text"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="input font-bold w-full"
                            placeholder="Ej: Insumos de barbería, Pago de arriendo..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="caption font-black text-gray-500 uppercase tracking-widest">Monto Total</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    value={formData.monto}
                                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                    className="input font-bold w-full pl-12"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="caption font-black text-gray-500 uppercase tracking-widest">Impuesto (IVA)</label>
                            <select
                                value={formData.incluyeIva}
                                onChange={(e) => setFormData({ ...formData, incluyeIva: e.target.value === 'true' })}
                                className="input font-bold w-full"
                            >
                                <option value="true">Sí (Monto incluye IVA 19%)</option>
                                <option value="false">No (Monto Exento/Neto)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="caption font-black text-gray-500 uppercase tracking-widest">Documento Tributario</label>
                            <select
                                value={formData.tipoDocumento}
                                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                                className="input font-bold w-full"
                            >
                                <option value="BOLETA">Boleta Comercial</option>
                                <option value="FACTURA">Factura de Compra</option>
                                <option value="RECIBO">Recibo Interno</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="caption font-black text-gray-500 uppercase tracking-widest">N° de Documento</label>
                            <input
                                type="text"
                                value={formData.numeroDocumento}
                                onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                                className="input font-bold w-full"
                                placeholder="Folio o número (opcional)"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-8 py-4 rounded-2xl font-black transition-all"
                        >
                            Cancelar
                        </button>
                        <Button
                            type="submit"
                            disabled={loadingSubmit}
                            className={`flex-1 ${loadingSubmit ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-4 rounded-2xl font-black shadow-lg transition-all`}
                        >
                            {loadingSubmit ? "Procesando..." : "Registrar Gasto"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
