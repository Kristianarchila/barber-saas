import { useState, useEffect } from "react";
import { Card, Button, Badge } from "../../components/ui";
import { useParams } from "react-router-dom";
import cuponesService from "../../services/cuponesService";
import { Tag, Plus, Edit, Trash2, Calendar, Percent, DollarSign, Users, TrendingUp } from "lucide-react";

export default function Cupones() {
    const { slug } = useParams();
    const [cupones, setCupones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCupon, setEditingCupon] = useState(null);
    const [formData, setFormData] = useState({
        codigo: "",
        tipo: "porcentaje",
        valor: "",
        fechaInicio: "",
        fechaFin: "",
        usoMaximo: "",
        usosPorUsuario: 1,
        montoMinimo: "",
        aplicableA: "todos",
        activo: true
    });

    useEffect(() => {
        loadCupones();
    }, [slug]);

    const loadCupones = async () => {
        try {
            setLoading(true);
            const data = await cuponesService.getCupones(slug);
            // Ensure data is always an array
            setCupones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando cupones:", error);
            setCupones([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const cuponData = {
                ...formData,
                valor: parseFloat(formData.valor),
                usoMaximo: formData.usoMaximo ? parseInt(formData.usoMaximo) : null,
                usosPorUsuario: parseInt(formData.usosPorUsuario),
                montoMinimo: formData.montoMinimo ? parseFloat(formData.montoMinimo) : 0
            };

            if (editingCupon) {
                await cuponesService.updateCupon(slug, editingCupon._id, cuponData);
            } else {
                await cuponesService.createCupon(slug, cuponData);
            }

            setShowModal(false);
            resetForm();
            loadCupones();
        } catch (error) {
            alert(error.response?.data?.message || "Error al guardar cupón");
        }
    };

    const handleEdit = (cupon) => {
        setEditingCupon(cupon);
        setFormData({
            codigo: cupon.codigo,
            tipo: cupon.tipo,
            valor: cupon.valor.toString(),
            fechaInicio: cupon.fechaInicio?.split('T')[0] || "",
            fechaFin: cupon.fechaFin?.split('T')[0] || "",
            usoMaximo: cupon.usoMaximo?.toString() || "",
            usosPorUsuario: cupon.usosPorUsuario || 1,
            montoMinimo: cupon.montoMinimo?.toString() || "",
            aplicableA: cupon.aplicableA,
            activo: cupon.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este cupón?")) return;
        try {
            await cuponesService.deleteCupon(slug, id);
            loadCupones();
        } catch (error) {
            alert("Error al eliminar cupón");
        }
    };

    const resetForm = () => {
        setEditingCupon(null);
        setFormData({
            codigo: "",
            tipo: "porcentaje",
            valor: "",
            fechaInicio: "",
            fechaFin: "",
            usoMaximo: "",
            usosPorUsuario: 1,
            montoMinimo: "",
            aplicableA: "todos",
            activo: true
        });
    };

    const getEstadoBadge = (cupon) => {
        if (!cupon.activo) return <Badge variant="error">Inactivo</Badge>;

        const ahora = new Date();
        const inicio = cupon.fechaInicio ? new Date(cupon.fechaInicio) : null;
        const fin = cupon.fechaFin ? new Date(cupon.fechaFin) : null;

        if (inicio && ahora < inicio) return <Badge variant="warning">Programado</Badge>;
        if (fin && ahora > fin) return <Badge variant="error">Expirado</Badge>;
        if (cupon.usoMaximo && cupon.vecesUsado >= cupon.usoMaximo) return <Badge variant="error">Agotado</Badge>;
        return <Badge variant="success">Activo</Badge>;
    };

    if (loading) {
        return <div className="text-center p-8">Cargando cupones...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gradient-primary">Cupones & Descuentos</h1>
                    <p className="text-neutral-400 mt-1">Gestiona códigos promocionales para tus clientes</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={20} />
                    Nuevo Cupón
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                            <Tag className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-neutral-400 text-sm">Total Cupones</p>
                            <p className="text-2xl font-black text-white">{cupones.length}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center">
                            <Users className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-neutral-400 text-sm">Activos</p>
                            <p className="text-2xl font-black text-success-500">
                                {cupones.filter(c => c.activo).length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-neutral-400 text-sm">Total Usos</p>
                            <p className="text-2xl font-black text-primary-500">
                                {cupones.reduce((sum, c) => sum + (c.vecesUsado || 0), 0)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center">
                            <Percent className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-neutral-400 text-sm">Descuento Prom.</p>
                            <p className="text-2xl font-black text-warning-500">
                                {cupones.length > 0 ?
                                    Math.round(cupones.reduce((sum, c) => sum + (c.tipo === 'porcentaje' ? c.valor : 0), 0) / cupones.length)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cupones List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cupones.map((cupon) => (
                    <Card key={cupon._id}>
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="text-primary-500" size={20} />
                                        <h3 className="text-xl font-black text-white">{cupon.codigo}</h3>
                                    </div>
                                    <div className="mt-2">{getEstadoBadge(cupon)}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cupon)}>
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cupon._id)}>
                                        <Trash2 size={16} className="text-error-500" />
                                    </Button>
                                </div>
                            </div>

                            {/* Descuento */}
                            <div className="flex items-center gap-2 text-2xl font-black text-gradient-primary">
                                {cupon.tipo === "porcentaje" ? (
                                    <>
                                        <Percent size={24} />
                                        {cupon.valor}% OFF
                                    </>
                                ) : (
                                    <>
                                        <DollarSign size={24} />
                                        ${cupon.valor} OFF
                                    </>
                                )}
                            </div>

                            {/* Detalles */}
                            <div className="space-y-2 text-sm text-neutral-400">
                                {cupon.fechaInicio && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Desde: {new Date(cupon.fechaInicio).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {cupon.fechaFin && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Hasta: {new Date(cupon.fechaFin).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {cupon.montoMinimo > 0 && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} />
                                        <span>Compra mínima: ${cupon.montoMinimo}</span>
                                    </div>
                                )}
                                {cupon.usoMaximo && (
                                    <div className="flex items-center gap-2">
                                        <Users size={16} />
                                        <span>Usos: {cupon.vecesUsado || 0} / {cupon.usoMaximo}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Tag size={16} />
                                    <span>Aplicable a: {cupon.aplicableA === "todos" ? "Todo" : cupon.aplicableA === "servicios" ? "Servicios" : "Productos"}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {cupones.length === 0 && (
                    <div className="col-span-2 text-center p-12">
                        <Tag className="mx-auto text-neutral-600 mb-4" size={48} />
                        <p className="text-neutral-400">No hay cupones creados</p>
                        <Button className="mt-4" onClick={() => { resetForm(); setShowModal(true); }}>
                            Crear Primer Cupón
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black text-gradient-primary mb-6">
                            {editingCupon ? "Editar Cupón" : "Nuevo Cupón"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Código *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                                        className="input-primary"
                                        placeholder="VERANO2024"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Tipo *
                                    </label>
                                    <select
                                        required
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="input-primary"
                                    >
                                        <option value="porcentaje">Porcentaje</option>
                                        <option value="monto">Monto Fijo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Valor *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.valor}
                                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                        className="input-primary"
                                        placeholder={formData.tipo === "porcentaje" ? "10" : "1000"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Aplicable a
                                    </label>
                                    <select
                                        value={formData.aplicableA}
                                        onChange={(e) => setFormData({ ...formData, aplicableA: e.target.value })}
                                        className="input-primary"
                                    >
                                        <option value="todos">Todo</option>
                                        <option value="servicios">Solo Servicios</option>
                                        <option value="productos">Solo Productos</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Fecha Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        className="input-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Fecha Fin
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        className="input-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Usos Máximos
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usoMaximo}
                                        onChange={(e) => setFormData({ ...formData, usoMaximo: e.target.value })}
                                        className="input-primary"
                                        placeholder="Ilimitado"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Usos por Usuario
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usosPorUsuario}
                                        onChange={(e) => setFormData({ ...formData, usosPorUsuario: e.target.value })}
                                        className="input-primary"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-neutral-300 mb-2">
                                        Monto Mínimo de Compra
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.montoMinimo}
                                        onChange={(e) => setFormData({ ...formData, montoMinimo: e.target.value })}
                                        className="input-primary"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-semibold text-neutral-300">Activo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingCupon ? "Guardar Cambios" : "Crear Cupón"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
