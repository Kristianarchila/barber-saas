import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Filter, Edit, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { obtenerProductos, eliminarProducto, CATEGORIAS } from '../../../services/productosService';

export default function Productos() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [paginacion, setPaginacion] = useState({ pagina: 1, totalPaginas: 1 });

    useEffect(() => {
        cargarProductos();
    }, [slug, categoriaFiltro, paginacion.pagina]);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const data = await obtenerProductos(slug, {
                categoria: categoriaFiltro,
                busqueda,
                pagina: paginacion.pagina,
                limite: 20
            });

            setProductos(data.productos);
            setPaginacion(data.paginacion);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        cargarProductos();
    };

    const handleEliminar = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await eliminarProducto(slug, id);
            cargarProductos();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al eliminar producto');
        }
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(precio);
    };

    if (loading && productos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Package className="text-gold" size={32} />
                            Inventario / Stock
                        </h1>
                        <p className="text-gray-400 mt-1">Gestiona el catálogo de productos y existencias de tu barbería</p>
                    </div>

                    <button
                        onClick={() => navigate(`/${slug}/admin/productos/nuevo`)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-100 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                </div>

                {/* Filtros y búsqueda */}
                <div className="flex flex-col md:flex-row gap-4 bg-neutral-900 p-4 rounded-lg">
                    <form onSubmit={handleBuscar} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar productos..."
                                className="w-full pl-10 pr-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                        >
                            Buscar
                        </button>
                    </form>

                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            className="px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                        >
                            <option value="">Todas las categorías</option>
                            {CATEGORIAS.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Lista de productos */}
            {productos.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900 rounded-lg">
                    <Package size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay productos</h3>
                    <p className="text-gray-500 mb-6">Comienza agregando tu primer producto al catálogo</p>
                    <button
                        onClick={() => navigate(`/${slug}/admin/productos/nuevo`)}
                        className="px-6 py-3 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-100 transition-all shadow-lg active:scale-95"
                    >
                        Crear Producto
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {productos.map(producto => (
                            <div
                                key={producto._id}
                                className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:border-gold/50 transition-all group"
                            >
                                {/* Imagen */}
                                <div className="relative h-48 bg-neutral-800">
                                    {producto.imagenes && producto.imagenes[0] ? (
                                        <img
                                            src={producto.imagenes[0]}
                                            alt={producto.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={48} className="text-gray-600" />
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                                        {producto.destacado && (
                                            <span className="px-2 py-1 bg-gold text-black text-xs font-bold rounded">
                                                Destacado
                                            </span>
                                        )}
                                        {!producto.activo && (
                                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                                Inactivo
                                            </span>
                                        )}
                                        {producto.stock === 0 && (
                                            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                                                Sin Stock
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-4">
                                    <div className="mb-3">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                                            {CATEGORIAS.find(c => c.value === producto.categoria)?.label || producto.categoria}
                                        </span>
                                        <h3 className="text-lg font-semibold text-white mt-1 line-clamp-2">
                                            {producto.nombre}
                                        </h3>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-2xl font-bold text-gold">
                                            {formatearPrecio(producto.precioEfectivo)}
                                        </span>
                                        {producto.precioDescuento && (
                                            <span className="text-sm text-gray-500 line-through">
                                                {formatearPrecio(producto.precio)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm mb-4">
                                        <span className="text-gray-400">
                                            Stock: <span className={producto.stock > 10 ? 'text-green-400' : 'text-orange-400'}>
                                                {producto.stock}
                                            </span>
                                        </span>
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <TrendingUp size={14} />
                                            {producto.metadata?.ventas || 0} vendidos
                                        </span>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/${slug}/admin/productos/${producto._id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            <Edit size={16} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(producto._id)}
                                            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paginación */}
                    {paginacion.totalPaginas > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <button
                                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                                disabled={paginacion.pagina === 1}
                                className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>

                            <span className="text-gray-400">
                                Página {paginacion.pagina} de {paginacion.totalPaginas}
                            </span>

                            <button
                                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                                disabled={paginacion.pagina === paginacion.totalPaginas}
                                className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
