import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Save, X, Upload, Trash2, Star } from 'lucide-react';
import { obtenerProducto, crearProducto, actualizarProducto, CATEGORIAS } from '../../../services/productosService';

export default function ProductoForm() {
    const { slug, id } = useParams();
    const navigate = useNavigate();
    const esEdicion = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: 'pomada',
        precio: '',
        precioDescuento: '',
        stock: '',
        imagenes: [],
        destacado: false,
        activo: true,
        especificaciones: {
            marca: '',
            tamaño: '',
            ingredientes: '',
            modoUso: ''
        }
    });

    const [nuevaImagen, setNuevaImagen] = useState('');

    useEffect(() => {
        if (esEdicion) {
            cargarProducto();
        }
    }, [id]);

    const cargarProducto = async () => {
        try {
            setLoading(true);
            const producto = await obtenerProducto(slug, id);
            setFormData({
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                categoria: producto.categoria,
                precio: producto.precio,
                precioDescuento: producto.precioDescuento || '',
                stock: producto.stock,
                imagenes: producto.imagenes || [],
                destacado: producto.destacado,
                activo: producto.activo,
                especificaciones: producto.especificaciones || {
                    marca: '',
                    tamaño: '',
                    ingredientes: '',
                    modoUso: ''
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar producto');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('especificaciones.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                especificaciones: {
                    ...prev.especificaciones,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const agregarImagen = () => {
        if (!nuevaImagen.trim()) return;

        setFormData(prev => ({
            ...prev,
            imagenes: [...prev.imagenes, nuevaImagen.trim()]
        }));
        setNuevaImagen('');
    };

    const removerImagen = (index) => {
        setFormData(prev => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, i) => i !== index)
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (max 500KB para evitar sobrecarga en base64)
        if (file.size > 500 * 1024) {
            setError("La imagen es muy pesada. Máximo 500KB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                imagenes: [...prev.imagenes, reader.result]
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        if (!formData.precio || formData.precio <= 0) {
            setError('El precio debe ser mayor a 0');
            return;
        }

        if (formData.precioDescuento && formData.precioDescuento >= formData.precio) {
            setError('El precio de descuento debe ser menor al precio regular');
            return;
        }

        try {
            setGuardando(true);
            setError(null);

            const data = {
                ...formData,
                precio: parseFloat(formData.precio),
                precioDescuento: formData.precioDescuento ? parseFloat(formData.precioDescuento) : undefined,
                stock: parseInt(formData.stock) || 0
            };

            if (esEdicion) {
                await actualizarProducto(slug, id, data);
            } else {
                await crearProducto(slug, data);
            }

            navigate(`/${slug}/admin/productos`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar producto');
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Package className="text-gold" size={32} />
                    {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
                </h1>
                <p className="text-gray-400 mt-1">
                    {esEdicion ? 'Actualiza la información del producto' : 'Agrega un nuevo producto al catálogo'}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Información Básica</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                placeholder="Ej: Pomada Mate Premium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none resize-none"
                                placeholder="Describe el producto, sus beneficios y características..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Categoría *
                                </label>
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                >
                                    {CATEGORIAS.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Stock *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Precios */}
                <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Precios</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Precio Regular *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Precio con Descuento
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    name="precioDescuento"
                                    value={formData.precioDescuento}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Opcional. Debe ser menor al precio regular</p>
                        </div>
                    </div>
                </div>

                {/* Imágenes */}
                <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Imágenes</h2>

                    <div className="space-y-4">
                        <div className="flex gap-2 flex-col md:flex-row">
                            <input
                                type="url"
                                value={nuevaImagen}
                                onChange={(e) => setNuevaImagen(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        agregarImagen();
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                placeholder="URL de la imagen (https://...)"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        agregarImagen();
                                    }}
                                    className="px-4 py-2 bg-neutral-700 text-white font-bold rounded-xl hover:bg-neutral-600 transition-all flex items-center gap-2"
                                >
                                    <Upload size={18} />
                                    URL
                                </button>

                                <label className="cursor-pointer px-4 py-2 bg-white text-neutral-900 font-bold rounded-xl hover:bg-neutral-100 transition-all shadow-md flex items-center gap-2">
                                    <Upload size={18} />
                                    Subir Foto
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        {formData.imagenes.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.imagenes.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img}
                                            alt={`Imagen ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-neutral-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removerImagen(index)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Especificaciones */}
                <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Especificaciones</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Marca</label>
                            <input
                                type="text"
                                name="especificaciones.marca"
                                value={formData.especificaciones.marca}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                placeholder="Ej: Premium Barber"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tamaño</label>
                            <input
                                type="text"
                                name="especificaciones.tamaño"
                                value={formData.especificaciones.tamaño}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none"
                                placeholder="Ej: 100ml"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ingredientes</label>
                            <textarea
                                name="especificaciones.ingredientes"
                                value={formData.especificaciones.ingredientes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none resize-none"
                                placeholder="Lista de ingredientes principales..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Modo de Uso</label>
                            <textarea
                                name="especificaciones.modoUso"
                                value={formData.especificaciones.modoUso}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-gold focus:outline-none resize-none"
                                placeholder="Instrucciones de uso..."
                            />
                        </div>
                    </div>
                </div>

                {/* Opciones */}
                <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                    <h2 className="text-xl font-semibold text-white mb-4">Opciones</h2>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="destacado"
                                checked={formData.destacado}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-neutral-700 text-gold focus:ring-gold focus:ring-offset-0"
                            />
                            <div>
                                <span className="text-white font-medium flex items-center gap-2">
                                    <Star size={18} className="text-gold" />
                                    Producto Destacado
                                </span>
                                <p className="text-sm text-gray-400">Aparecerá en la sección de productos destacados</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="activo"
                                checked={formData.activo}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-neutral-700 text-gold focus:ring-gold focus:ring-offset-0"
                            />
                            <div>
                                <span className="text-white font-medium">Producto Activo</span>
                                <p className="text-sm text-gray-400">Los productos inactivos no se mostrarán en la tienda</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={guardando}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-neutral-900 font-black rounded-xl hover:bg-neutral-100 transition-all shadow-glow-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg"
                    >
                        {guardando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-900"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={22} />
                                {esEdicion ? 'Actualizar Producto' : 'Crear Producto'}
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(`/${slug}/admin/productos`)}
                        className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                        <X size={20} />
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
