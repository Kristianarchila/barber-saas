import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import proveedoresService from "../../services/proveedoresService";
import { ErrorAlert } from "../../components/ErrorComponents";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";

export default function Proveedores() {
    const { slug } = useParams();
    const [proveedores, setProveedores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    // Hook para cargar proveedores
    const { execute: loadProveedores, loading, error } = useApiCall(
        () => proveedoresService.getProveedores(slug),
        {
            errorMessage: 'Error al cargar los proveedores.',
            onSuccess: (data) => setProveedores(data.proveedores)
        }
    );

    useEffect(() => {
        loadProveedores();
    }, [slug]);

    // Hook para eliminar (desactivar) proveedor
    const { execute: confirmDelete } = useAsyncAction(
        async (id) => await proveedoresService.deleteProveedor(slug, id),
        {
            successMessage: '✅ Proveedor desactivado correctamente',
            errorMessage: 'Error al desactivar el proveedor',
            confirmMessage: '¿Deseas desactivar este proveedor? No podrá ser seleccionado para nuevos pedidos.',
            onSuccess: loadProveedores
        }
    );

    if (loading && proveedores.length === 0) {
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
                    title="Error de Proveedores"
                    message={error}
                    onRetry={loadProveedores}
                />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-medium">Proveedores</h1>
                <button
                    onClick={() => {
                        setEditing(null);
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    + Nuevo Proveedor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proveedores.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No hay proveedores registrados
                    </div>
                ) : (
                    proveedores.map((proveedor) => (
                        <div key={proveedor._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-medium">{proveedor.nombre}</h3>
                                    {proveedor.rut && (
                                        <p className="text-sm text-gray-500">RUT: {proveedor.rut}</p>
                                    )}
                                </div>
                                {!proveedor.activo && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                        Inactivo
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                {proveedor.telefono && (
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {proveedor.telefono}
                                    </div>
                                )}
                                {proveedor.email && (
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {proveedor.email}
                                    </div>
                                )}
                                {proveedor.contacto?.nombre && (
                                    <div className="text-gray-600">
                                        <span className="font-medium">Contacto:</span> {proveedor.contacto.nombre}
                                        {proveedor.contacto.cargo && ` (${proveedor.contacto.cargo})`}
                                    </div>
                                )}
                            </div>

                            {proveedor.notas && (
                                <p className="mt-3 text-sm text-gray-500 italic">
                                    {proveedor.notas}
                                </p>
                            )}

                            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setEditing(proveedor);
                                        setShowModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Editar
                                </button>
                                {proveedor.activo && (
                                    <button
                                        onClick={() => confirmDelete(proveedor._id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Desactivar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <ModalProveedor
                    proveedor={editing}
                    onClose={() => {
                        setShowModal(false);
                        setEditing(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setEditing(null);
                        loadProveedores();
                    }}
                    barberia={{ slug }}
                />
            )}
        </div>
    );
}

// Modal para crear/editar proveedor
function ModalProveedor({ proveedor, onClose, onSuccess, barberia }) {
    const [formData, setFormData] = useState(
        proveedor || {
            nombre: "",
            telefono: "",
            email: "",
            rut: "",
            contacto: { nombre: "", cargo: "" },
            direccion: { calle: "", ciudad: "", estado: "", codigoPostal: "" },
            notas: "",
            diasPago: 30,
        }
    );

    const { execute: handleSubmit, loading: guardando } = useAsyncAction(
        async (e) => {
            e.preventDefault();
            if (proveedor) {
                return await proveedoresService.updateProveedor(barberia.slug, proveedor._id, formData);
            } else {
                return await proveedoresService.createProveedor(barberia.slug, formData);
            }
        },
        {
            successMessage: proveedor ? '✅ Proveedor actualizado' : '✅ Proveedor creado exitosamente',
            errorMessage: 'Error al completar la operación',
            onSuccess
        }
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-medium mb-4">
                    {proveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                            <input
                                type="text"
                                value={formData.rut}
                                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Persona de Contacto</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.contacto.nombre}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            contacto: { ...formData.contacto, nombre: e.target.value },
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                                <input
                                    type="text"
                                    value={formData.contacto.cargo}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            contacto: { ...formData.contacto, cargo: e.target.value },
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                            rows="3"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {guardando ? "Guardando..." : (proveedor ? "Actualizar" : "Crear")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
