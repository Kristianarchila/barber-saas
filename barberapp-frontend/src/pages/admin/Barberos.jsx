import { useState, useEffect } from 'react';
import { getBarberos, crearBarbero, editarBarbero, eliminarBarbero, toggleEstadoBarbero } from '../../services/barberosService';

export default function Barberos() {
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBarbero, setEditingBarbero] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    foto: '',
    descripcion: '',
    especialidades: '',
    experiencia: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    cargarBarberos();
  }, []);

  const cargarBarberos = async () => {
    try {
      setLoading(true);
      const data = await getBarberos();
      setBarberos(data);
    } catch (error) {
      console.error('Error al cargar barberos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setUploadingImage(true);

    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, foto: base64String }));
      setUploadingImage(false);
    };

    reader.onerror = () => {
      alert('Error al cargar la imagen');
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, foto: '' }));
  };

  const abrirModalNuevo = () => {
    setEditingBarbero(null);
    setImagePreview(null);
    setFormData({
      nombre: '',
      foto: '',
      descripcion: '',
      especialidades: '',
      experiencia: '',
      email: '',
      password: ''
    });
    setShowModal(true);
  };

  const abrirModalEditar = (barbero) => {
    setEditingBarbero(barbero);
    setImagePreview(barbero.foto || null);
    setFormData({
      nombre: barbero.nombre,
      foto: barbero.foto || '',
      descripcion: barbero.descripcion || '',
      especialidades: Array.isArray(barbero.especialidades)
        ? barbero.especialidades.join(', ')
        : '',
      experiencia: barbero.experiencia || ''
      // ❌ NO email
      // ❌ NO password
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        especialidades: formData.especialidades.split(',').map(e => e.trim()).filter(Boolean),
        experiencia: formData.experiencia ? Number(formData.experiencia) : 0
      };

      if (editingBarbero) {
        await editarBarbero(editingBarbero._id, payload);
      } else {
        await crearBarbero(payload);
      }
      
      await cargarBarberos();
      setShowModal(false);
      setImagePreview(null);
      
      setFormData({
        nombre: '',
        foto: '',
        descripcion: '',
        especialidades: '',
        experiencia: '',
        email: '',
        password: ''
      });
    } catch (error) {
      alert('Error al guardar barbero: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este barbero?')) {
      return;
    }

    try {
      await eliminarBarbero(id);
      await cargarBarberos();
    } catch (error) {
      alert('Error al eliminar barbero: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      await toggleEstadoBarbero(id);
      await cargarBarberos();
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-300">⏳ Cargando barberos...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">👨‍💼 Gestión de Barberos</h1>
        <button
          onClick={abrirModalNuevo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Nuevo Barbero
        </button>
      </div>

      {barberos.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-400 text-xl mb-4">No hay barberos registrados</p>
          <button
            onClick={abrirModalNuevo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {barberos.map((barbero) => (
            <div 
              key={barbero._id} 
              className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                {barbero.foto ? (
                  <img 
                    src={barbero.foto} 
                    alt={barbero.nombre}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {barbero.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  barbero.activo 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}>
                  {barbero.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {barbero.nombre}
              </h3>
              
              <div className="space-y-2 text-gray-300 text-sm mb-4">
                <p className="flex items-center gap-2">
                  <span>📋</span> {barbero.descripcion || 'Sin descripción'}
                </p>
                {barbero.especialidades && barbero.especialidades.length > 0 && (
                  <p className="flex items-center gap-2">
                    <span>✂️</span> {barbero.especialidades.join(', ')}
                  </p>
                )}
                {barbero.experiencia && (
                  <p className="flex items-center gap-2">
                    <span>⭐</span> {barbero.experiencia} años de experiencia
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => abrirModalEditar(barbero)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleToggleEstado(barbero._id)}
                  className={`flex-1 ${
                    barbero.activo 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white px-3 py-2 rounded text-sm font-semibold transition`}
                >
                  {barbero.activo ? '🔒' : '✅'}
                </button>
                <button
                  onClick={() => handleEliminar(barbero._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingBarbero ? '✏️ Editar Barbero' : '➕ Nuevo Barbero'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Carlos Soto"
                />
              </div>

              {/* SECCIÓN DE CARGA DE IMAGEN */}
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">
                  📸 Foto del Barbero
                </label>
                
                {imagePreview ? (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Click en la ✕ para cambiar la imagen
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="imageUpload"
                      disabled={uploadingImage}
                    />
                    <label 
                      htmlFor="imageUpload" 
                      className="cursor-pointer block"
                    >
                      {uploadingImage ? (
                        <div className="text-gray-400">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p>Cargando imagen...</p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="font-semibold">Click para subir imagen</p>
                          <p className="text-xs mt-1">PNG, JPG hasta 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Campo alternativo URL */}
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">
                  🔗 O pega una URL de imagen
                </label>
                <input
                  type="text"
                  name="foto"
                  value={formData.foto}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://ejemplo.com/foto.jpg"
                  disabled={!!imagePreview}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Deja vacío si subes una imagen desde tu dispositivo
                </p>
              </div>

              {/* EMAIL SOLO AL CREAR */}
              {!editingBarbero && (
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">
                    Email (login) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="barbero@correo.com"
                  />
                </div>
              )}

              {/* PASSWORD SOLO AL CREAR */}
              {!editingBarbero && (
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-semibold">
                    Contraseña inicial *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Breve descripción del barbero..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">
                  Especialidades (separadas por coma)
                </label>
                <input
                  type="text"
                  name="especialidades"
                  value={formData.especialidades}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Fade, Barba, Corte clásico"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">
                  Años de experiencia
                </label>
                <input
                  type="number"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition"
                  disabled={uploadingImage}
                >
                  {editingBarbero ? '💾 Actualizar' : '➕ Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded font-semibold transition"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}