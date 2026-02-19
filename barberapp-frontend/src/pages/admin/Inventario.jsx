import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import inventarioService from "../../services/inventarioService";
import { obtenerProductos } from "../../services/productosService";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ErrorAlert } from "../../components/ErrorComponents";

export default function Inventario() {
    const { slug } = useParams();
    const [inventario, setInventario] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showMovimientoModal, setShowMovimientoModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filtro, setFiltro] = useState("todos"); // todos, bajoStock

    // Hook para cargar datos iniciales
    const { execute: loadData, loading, error } = useApiCall(
        async () => {
            const [invData, alertasData, prodsData] = await Promise.all([
                inventarioService.getInventario(slug),
                inventarioService.getAlertasStock(slug),
                obtenerProductos(slug),
            ]);
            return { invData, alertasData, prodsData };
        },
        {
            errorMessage: 'Error al cargar los datos del inventario. Por favor, intenta de nuevo.',
            onSuccess: ({ invData, alertasData, prodsData }) => {
                setInventario(invData.inventario);
                setAlertas(alertasData.alertas);
                setProductos(prodsData.productos);
            }
        }
    );

    useEffect(() => {
        loadData();
    }, [slug]);

    const handleRegistrarMovimiento = async (data) => {
        // This will be handled by the modal or as an async action
    };

    const inventarioFiltrado = filtro === "bajoStock"
        ? inventario.filter(item => item.bajoPuntoReorden)
        : inventario;

    if (loading) {
        return <div className="p-12 text-center body-large text-gray-600">Cargando inventario de productos...</div>;
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <ErrorAlert
                    title="Error de Inventario"
                    message={error}
                    onRetry={loadData}
                    variant="error"
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1">Inventario</h1>
                    <p className="body-large text-gray-600 mt-2">
                        Control de existencias y reposición de productos
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                >
                    + Nuevo Producto
                </button>
            </header>

            {/* Alertas de Stock Bajo */}
            {alertas.length > 0 && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="body font-bold text-amber-900">Atención: Reposición Necesaria</p>
                        <p className="body-small text-amber-700">Tienes <strong>{alertas.length}</strong> productos por debajo del punto de reorden.</p>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex gap-3 border-b border-gray-100 pb-4">
                <button
                    onClick={() => setFiltro("todos")}
                    className={`btn px-6 ${filtro === "todos" ? "btn-primary" : "btn-ghost"}`}
                >
                    Todos ({inventario.length})
                </button>
                <button
                    onClick={() => setFiltro("bajoStock")}
                    className={`btn px-6 ${filtro === "bajoStock" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "btn-ghost"}`}
                >
                    Bajo Stock ({alertas.length})
                </button>
            </div>

            {/* Lista de Inventario */}
            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Stock Actual</th>
                            <th>Mín / Máx</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                            <th className="text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventarioFiltrado.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center text-gray-400">
                                    No hay productos en inventario con este filtro
                                </td>
                            </tr>
                        ) : (
                            inventarioFiltrado.map((item) => (
                                <tr key={item._id} className={item.bajoPuntoReorden ? "bg-amber-50/30" : ""}>
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                                                {item.producto?.imagen ? (
                                                    <img
                                                        src={item.producto.imagen}
                                                        alt={item.producto.nombre}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="body font-bold text-gray-900">{item.producto?.nombre}</p>
                                                <p className="caption text-gray-500">{item.producto?.categoria}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="body font-bold text-gray-900">
                                            {item.cantidadActual} {item.unidadMedida}
                                        </p>
                                    </td>
                                    <td>
                                        <p className="caption text-gray-500 font-bold">
                                            Min: {item.stockMinimo} · Max: {item.stockMaximo}
                                        </p>
                                    </td>
                                    <td>
                                        <span className="caption text-gray-600 font-medium">
                                            {item.ubicacion || "Sin ubicación"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.bajoPuntoReorden ? 'badge-error' : 'badge-success'}`}>
                                            {item.bajoPuntoReorden ? 'REPOSICIÓN' : 'STOCK OK'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowMovimientoModal(true);
                                            }}
                                            className="btn btn-ghost btn-sm text-blue-600"
                                        >
                                            Movimiento
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Registrar Movimiento */}
            {showMovimientoModal && (
                <ModalMovimiento
                    item={selectedItem}
                    slug={slug}
                    onClose={() => {
                        setShowMovimientoModal(false);
                        setSelectedItem(null);
                    }}
                    onReload={loadData}
                />
            )}
        </div>
    );
}

// Modal para registrar movimientos
function ModalMovimiento({ item, onClose, onSubmit, slug, onReload }) {
    const [formData, setFormData] = useState({
        tipo: "entrada",
        cantidad: "",
        motivo: "",
        observaciones: "",
    });

    const { execute: handleConfirm, loading: procesando } = useAsyncAction(
        async (e) => {
            e.preventDefault();
            if (!formData.cantidad || !formData.motivo) {
                throw new Error("Cantidad y motivo son requeridos");
            }
            return await inventarioService.registrarMovimiento(slug, item._id, formData);
        },
        {
            successMessage: '✅ Movimiento registrado exitosamente',
            errorMessage: 'Error registrando movimiento',
            onSuccess: () => {
                onReload();
                onClose();
            }
        }
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
            <div className="card card-padding max-w-md w-full animate-in zoom-in-95">
                <h3 className="heading-3 mb-6">
                    Mover Stock: {item.producto?.nombre}
                </h3>
                <form onSubmit={handleConfirm} className="space-y-5">
                    <div className="space-y-2">
                        <label className="label">Tipo de Movimiento</label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="input"
                        >
                            <option value="entrada">Entrada (+)</option>
                            <option value="salida">Salida (-)</option>
                            <option value="ajuste">Ajuste Manual</option>
                            <option value="devolucion">Devolución</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="label">
                            Cantidad {formData.tipo === "ajuste" ? "(Nuevo Total)" : ""}
                        </label>
                        <input
                            type="number"
                            value={formData.cantidad}
                            onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                            className="input"
                            min="0"
                            required
                        />
                        <p className="caption text-gray-500">
                            Stock actual registrado: {item.cantidadActual} {item.unidadMedida}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="label">Motivo o Referencia</label>
                        <input
                            type="text"
                            value={formData.motivo}
                            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                            className="input"
                            placeholder="Ej: Compra a distribuidor"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="label">Observaciones Adicionales</label>
                        <textarea
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            className="input min-h-[100px]"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost flex-1"
                            disabled={procesando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={procesando}
                        >
                            {procesando ? "Procesando..." : "Confirmar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
