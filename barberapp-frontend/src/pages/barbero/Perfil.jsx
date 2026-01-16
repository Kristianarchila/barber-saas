import { useEffect, useState } from "react";
import { getPerfilBarbero } from "../../services/barberoDashboardService";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const data = await getPerfilBarbero();
      setPerfil(data);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      nombre: perfil.nombre,
      descripcion: perfil.descripcion || "",
      experiencia: perfil.experiencia || 0,
      especialidades: perfil.especialidades || []
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      // Aquí deberías llamar a tu servicio de actualización
      // await updatePerfilBarbero(formData);
      setPerfil({ ...perfil, ...formData });
      setEditMode(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("Error al guardar el perfil");
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addEspecialidad = () => {
    const nueva = prompt("Ingresa una nueva especialidad:");
    if (nueva && nueva.trim()) {
      setFormData({
        ...formData,
        especialidades: [...(formData.especialidades || []), nueva.trim()]
      });
    }
  };

  const removeEspecialidad = (index) => {
    const nuevas = formData.especialidades.filter((_, i) => i !== index);
    setFormData({ ...formData, especialidades: nuevas });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">👤</div>
        </div>
        <p className="text-amber-400 mt-6 font-semibold">Cargando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
        <p className="text-red-400 text-xl">❌ No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-2">
              👤 Mi Perfil
            </h1>
            <p className="text-gray-400">Información personal y profesional</p>
          </div>
          
          {!editMode ? (
            <button
              onClick={handleEdit}
              className="bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-amber-500/50 flex items-center gap-2"
            >
              <span className="text-xl">✏️</span>
              Editar Perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
              >
                <span className="text-xl">💾</span>
                Guardar
              </button>
              <button
                onClick={handleCancel}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Info principal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de foto y datos básicos */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-6xl shadow-2xl">
                  {perfil.foto ? (
                    <img src={perfil.foto} alt={perfil.nombre} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    "👨‍💼"
                  )}
                </div>
                {editMode && (
                  <button className="absolute bottom-0 right-0 bg-amber-600 hover:bg-amber-700 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition">
                    📷
                  </button>
                )}
              </div>

              {/* Nombre y email */}
              <h2 className="text-2xl font-bold text-white mb-1 text-center">
                {perfil.nombre}
              </h2>
              <p className="text-amber-400 font-semibold mb-2">Barbero Profesional</p>
              <p className="text-gray-400 text-sm mb-4">{perfil.usuario?.email}</p>

              {/* Estado */}
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                perfil.activo 
                  ? "bg-green-600/20 border border-green-500/30" 
                  : "bg-red-600/20 border border-red-500/30"
              }`}>
                <span className={`w-2 h-2 rounded-full ${perfil.activo ? "bg-green-400" : "bg-red-400"} animate-pulse`}></span>
                <span className={`text-sm font-semibold ${perfil.activo ? "text-green-400" : "text-red-400"}`}>
                  {perfil.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>

          {/* Card de experiencia */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">⭐</span>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Experiencia</p>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.experiencia}
                      onChange={(e) => handleChange("experiencia", parseInt(e.target.value) || 0)}
                      className="bg-gray-900/50 border border-gray-600 rounded px-3 py-1 w-20 text-center text-2xl font-bold text-white"
                    />
                    <span className="text-white text-xl">años</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {perfil.experiencia} años
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Detalles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📝</span>
              <h3 className="text-xl font-bold text-white">Sobre mí</h3>
            </div>
            {editMode ? (
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[120px]"
                placeholder="Cuéntanos sobre tu experiencia y estilo..."
              />
            ) : (
              <p className="text-gray-300 leading-relaxed">
                {perfil.descripcion || "Sin descripción"}
              </p>
            )}
          </div>

          {/* Especialidades */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✂️</span>
                <h3 className="text-xl font-bold text-white">Especialidades</h3>
              </div>
              {editMode && (
                <button
                  onClick={addEspecialidad}
                  className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                >
                  <span>➕</span>
                  Agregar
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(editMode ? formData.especialidades : perfil.especialidades || []).length === 0 ? (
                <p className="text-gray-500 text-sm">No hay especialidades registradas</p>
              ) : (
                (editMode ? formData.especialidades : perfil.especialidades || []).map((esp, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-amber-600/30 to-yellow-600/30 border border-amber-500/30 px-4 py-2 rounded-full text-sm font-semibold text-amber-300 flex items-center gap-2"
                  >
                    {esp}
                    {editMode && (
                      <button
                        onClick={() => removeEspecialidad(index)}
                        className="hover:text-red-400 transition"
                      >
                        ❌
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Información de cuenta */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔐</span>
              <h3 className="text-xl font-bold text-white">Seguridad de la cuenta</h3>
            </div>
            <div className="space-y-3">
              <InfoRow label="Email" value={perfil.usuario?.email} />
              <InfoRow label="Contraseña" value="••••••••" />
              <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition">
                Cambiar contraseña →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de fila de información
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}