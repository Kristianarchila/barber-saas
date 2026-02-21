import { useState } from "react";
import { crearBarberia } from "../../services/superAdminService";
import { useNavigate } from "react-router-dom";

export default function CrearBarberia() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        // Barbería
        nombre: "",
        slug: "",
        email: "",
        telefono: "",
        direccion: "",
        rut: "",
        plan: "basico",
        diasTrial: 14,
        // Admin
        adminNombre: "",
        adminEmail: "",
        adminPassword: "",
        adminTelefono: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-generar slug desde nombre
            if (name === "nombre") {
                updated.slug = generateSlug(value);
            }

            return updated;
        });
    };

    const generateSlug = (nombre) => {
        return nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-z0-9]+/g, "-")     // Reemplazar espacios y caracteres especiales
            .replace(/^-+|-+$/g, "");        // Quitar guiones al inicio y final
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await crearBarberia(form);
            alert("✅ Barbería creada exitosamente");
            navigate("/superadmin/dashboard/barberias");
        } catch (err) {
            console.error("Error al crear barbería:", err.response?.data);

            // Extraer mensajes detallados si existen
            if (err.response?.data?.errors) {
                const detailedErrors = err.response.data.errors
                    .map(e => `${e.field}: ${e.message}`)
                    .join(" | ");
                setError(`Detalles: ${detailedErrors}`);
            } else {
                setError(err.response?.data?.message || "Error al crear barbería");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Crear Nueva Barbería</h1>
                <button
                    onClick={() => navigate("/superadmin/dashboard/barberias")}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ← Volver
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos de la Barbería */}
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">📋 Datos de la Barbería</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Barbería Central"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Slug (URL) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">/</span>
                                <input
                                    type="text"
                                    name="slug"
                                    value={form.slug}
                                    onChange={handleChange}
                                    required
                                    pattern="[a-z0-9\-]+"
                                    className="w-full bg-gray-700 text-white pl-7 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="barberia-central"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Solo letras minúsculas, números y guiones
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="contacto@barberia.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+56 9 1234 5678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="direccion"
                                value={form.direccion}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Av. Principal 123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                RUT
                            </label>
                            <input
                                type="text"
                                name="rut"
                                value={form.rut}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="12.345.678-9"
                            />
                        </div>
                    </div>
                </div>

                {/* Plan y Trial */}
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">💳 Plan y Período de Prueba</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Plan
                            </label>
                            <select
                                name="plan"
                                value={form.plan}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="trial">Trial</option>
                                <option value="basico">Básico</option>
                                <option value="premium">Premium</option>
                                <option value="pro">Pro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Días de Trial
                            </label>
                            <input
                                type="number"
                                name="diasTrial"
                                value={form.diasTrial}
                                onChange={handleChange}
                                min="0"
                                max="90"
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Período de prueba gratuito (0-90 días)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Datos del Administrador */}
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">👤 Administrador de la Barbería</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="adminNombre"
                                value={form.adminNombre}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                name="adminEmail"
                                value={form.adminEmail}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="admin@barberia.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Contraseña <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                name="adminPassword"
                                value={form.adminPassword}
                                onChange={handleChange}
                                required
                                minLength="8"
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="adminTelefono"
                                value={form.adminTelefono}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+56 9 1234 5678"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/superadmin/barberias")}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creando..." : "Crear Barbería"}
                    </button>
                </div>
            </form>
        </div>
    );
}
