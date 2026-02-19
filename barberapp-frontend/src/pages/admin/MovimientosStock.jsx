import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import inventarioService from "../../services/inventarioService";
import { ErrorAlert } from "../../components/ErrorComponents";
import { useApiCall } from "../../hooks/useApiCall";

export default function MovimientosStock() {
    const { slug } = useParams();
    const [movimientos, setMovimientos] = useState([]);
    const [filtros, setFiltros] = useState({
        tipo: "",
        page: 1,
    });
    const [pagination, setPagination] = useState({});

    // Hook para cargar movimientos
    const { execute: loadMovimientos, loading, error } = useApiCall(
        () => inventarioService.getMovimientos(slug, filtros),
        {
            errorMessage: 'Error al cargar el historial de movimientos de stock.',
            onSuccess: (data) => {
                setMovimientos(data.movimientos);
                setPagination({
                    currentPage: data.currentPage,
                    totalPages: data.totalPages,
                    total: data.total,
                });
            }
        }
    );

    useEffect(() => {
        loadMovimientos();
    }, [slug, filtros]);

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case "entrada":
                return "bg-green-100 text-green-800";
            case "salida":
                return "bg-red-100 text-red-800";
            case "ajuste":
                return "bg-blue-100 text-blue-800";
            case "venta":
                return "bg-purple-100 text-purple-800";
            case "devolucion":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case "entrada":
                return "📥";
            case "salida":
                return "📤";
            case "ajuste":
                return "⚙️";
            case "venta":
                return "💰";
            case "devolucion":
                return "↩️";
            default:
                return "📦";
        }
    };

    if (loading && movimientos.length === 0) {
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
                    title="Error al cargar movimientos"
                    message={error}
                    onRetry={loadMovimientos}
                />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-medium mb-6">Historial de Movimientos</h1>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de  Movimiento
                        </label>
                        <select
                            value={filtros.tipo}
                            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value, page: 1 })}
                            className="border rounded-lg px-3 py-2"
                        >
                            <option value="">Todos</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                            <option value="ajuste">Ajuste</option>
                            <option value="venta">Venta</option>
                            <option value="devolucion">Devolución</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Movimientos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cantidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Anterior → Nuevo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Motivo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {movimientos.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No hay movimientos registrados
                                </td>
                            </tr>
                        ) : (
                            movimientos.map((mov) => (
                                <tr key={mov._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(mov.createdAt).toLocaleString("es-ES", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoColor(
                                                mov.tipo
                                            )}`}
                                        >
                                            {getTipoIcon(mov.tipo)} {mov.tipo.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {mov.producto?.imagen && (
                                                <img
                                                    src={mov.producto.imagen}
                                                    alt={mov.producto.nombre}
                                                    className="h-8 w-8 rounded object-cover mr-2"
                                                />
                                            )}
                                            <div className="text-sm font-medium text-gray-900">
                                                {mov.producto?.nombre}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {["salida", "venta"].includes(mov.tipo) ? "-" : "+"}
                                        {mov.cantidad}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {mov.cantidadAnterior} → {mov.cantidadNueva}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div>{mov.motivo}</div>
                                        {mov.observaciones && (
                                            <div className="text-xs text-gray-500 mt-1">{mov.observaciones}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {mov.usuario?.nombre || "Sistema"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
                        disabled={filtros.page === 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Anterior
                    </button>
                    <div className="px-4 py-2 border rounded-lg bg-blue-50 text-blue-700">
                        Página {pagination.currentPage} de {pagination.totalPages}
                    </div>
                    <button
                        onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
                        disabled={filtros.page === pagination.totalPages}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {pagination.total > 0 && (
                <div className="text-center mt-4 text-sm text-gray-600">
                    Mostrando {movimientos.length} de {pagination.total} movimientos
                </div>
            )}
        </div>
    );
}
