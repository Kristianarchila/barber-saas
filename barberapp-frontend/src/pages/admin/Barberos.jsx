import { useState, useEffect } from 'react';
import { getBarberos, crearBarbero, editarBarbero, eliminarBarbero, toggleEstadoBarbero } from '../../services/barberosService';
import { Card, Button, Badge, Skeleton, Avatar } from '../../components/ui';
import { Users, Plus, Edit2, Trash2, Power, Upload, X, Save, Mail, Lock, Scissors, Star, FileText } from 'lucide-react';
import { useApiCall } from '../../hooks/useApiCall';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { toast } from 'react-hot-toast';

export default function Barberos() {
  const [barberos, setBarberos] = useState([]);
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

  // Hook para cargar barberos con manejo de errores
  const { execute: cargarBarberos, loading, error } = useApiCall(
    getBarberos,
    {
      errorMessage: 'Error al cargar barberos',
      onSuccess: (data) => setBarberos(data)
    }
  );

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
    });
    setShowModal(true);
  };

  // Hook para guardar barbero (crear/editar) con protección
  const { execute: handleSubmit, loading: saving } = useAsyncAction(
    async (e) => {
      e.preventDefault();

      const payload = {
        ...formData,
        especialidades: formData.especialidades.split(',').map(e => e.trim()).filter(Boolean),
        experiencia: formData.experiencia ? Number(formData.experiencia) : 0
      };

      return editingBarbero
        ? await editarBarbero(editingBarbero._id, payload)
        : await crearBarbero(payload);
    },
    {
      successMessage: editingBarbero ? 'Barbero actualizado exitosamente' : 'Barbero creado exitosamente',
      errorMessage: 'Error al guardar barbero',
      onSuccess: () => {
        cargarBarberos();
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
      }
    }
  );

  // Hook para eliminar barbero con confirmación
  const { execute: handleEliminar } = useAsyncAction(
    eliminarBarbero,
    {
      successMessage: 'Barbero eliminado exitosamente',
      errorMessage: 'Error al eliminar barbero',
      confirmMessage: '¿Estás seguro de eliminar este barbero?',
      onSuccess: () => cargarBarberos()
    }
  );

  // Hook para cambiar estado del barbero
  const { execute: handleToggleEstado } = useAsyncAction(
    toggleEstadoBarbero,
    {
      successMessage: 'Estado del barbero actualizado',
      errorMessage: 'Error al cambiar estado',
      onSuccess: () => cargarBarberos()
    }
  );

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1 font-extrabold">Gestión de Barberos</h1>
          <p className="body-large text-gray-600 mt-2">
            Administra tu equipo de profesionales
          </p>
        </div>
        <button onClick={abrirModalNuevo} className="btn btn-primary self-start md:self-center">
          <Plus size={20} />
          Nuevo Barbero
        </button>
      </header>

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rectangular" height="h-64" />
          ))}
        </div>
      ) : barberos.length === 0 ? (
        /* EMPTY STATE */
        <div className="card card-padding text-center py-20">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="text-blue-600" size={32} />
          </div>
          <h3 className="heading-3 mb-2">
            No hay barberos registrados
          </h3>
          <p className="body text-gray-500 mb-8">
            Crea el primer barbero para comenzar
          </p>
          <button onClick={abrirModalNuevo} className="btn btn-primary px-8">
            <Plus size={18} />
            Crear el primero
          </button>
        </div>
      ) : (
        /* GRID DE BARBEROS */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {barberos.map((barbero) => (
            <div key={barbero._id} className="card hover:shadow-lg transition-all border border-gray-100 group">
              <div className="p-6 space-y-5">
                {/* Header con foto y estado */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={barbero.nombre}
                      src={barbero.foto}
                      size="lg"
                    />
                    <div>
                      <h3 className="heading-4 font-bold text-gray-900">
                        {barbero.nombre}
                      </h3>
                      {barbero.experiencia > 0 && (
                        <p className="caption text-gray-500 flex items-center gap-1.5 mt-1">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          {barbero.experiencia} años de experiencia
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${barbero.activo ? 'badge-success' : 'badge-error'}`}>
                    {barbero.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Descripción */}
                {barbero.descripcion && (
                  <p className="body-small text-gray-600 line-clamp-2 italic">
                    "{barbero.descripcion}"
                  </p>
                )}

                {/* Especialidades */}
                {barbero.especialidades && barbero.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {barbero.especialidades.map((esp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t border-gray-50 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => abrirModalEditar(barbero)}
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-xs"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleEstado(barbero._id)}
                    className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all font-semibold text-xs ${barbero.activo
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    title={barbero.activo ? "Desactivar" : "Activar"}
                  >
                    <Power size={16} />
                    {barbero.activo ? "Pausar" : "Activar"}
                  </button>
                  <button
                    onClick={() => handleEliminar(barbero._id)}
                    className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card card-padding w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setImagePreview(null);
              }}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Header del modal */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  {editingBarbero ? <Edit2 className="text-blue-600" size={24} /> : <Plus className="text-blue-600" size={24} />}
                </div>
                <div>
                  <h3 className="heading-3">
                    {editingBarbero ? 'Editar Barbero' : 'Nuevo Barbero'}
                  </h3>
                  <p className="body text-gray-500">
                    {editingBarbero ? 'Actualiza la información' : 'Completa los datos del barbero'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2 space-y-2">
                  <label className="label flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Ej: Carlos Soto"
                  />
                </div>

                {/* Email (solo crear) */}
                {!editingBarbero && (
                  <>
                    <div className="space-y-2">
                      <label className="label flex items-center gap-2">
                        <Mail size={16} className="text-blue-600" />
                        Email (usuario) *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="barbero@correo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="label flex items-center gap-2">
                        <Lock size={16} className="text-blue-600" />
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                  </>
                )}

                {/* Foto - Upload */}
                <div className="md:col-span-2 space-y-3">
                  <label className="label flex items-center gap-2">
                    <Upload size={16} className="text-blue-600" />
                    Foto del Perfil
                  </label>

                  {imagePreview ? (
                    <div className="relative inline-block group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-2xl border-2 border-blue-100 group-hover:border-blue-300 transition-all"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-3 -right-3 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="imageUpload" className="cursor-pointer block">
                        {uploadingImage ? (
                          <div className="text-gray-400 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-3"></div>
                            <p className="font-semibold text-sm">Cargando imagen...</p>
                          </div>
                        ) : (
                          <div className="text-gray-400 group-hover:text-blue-500 flex flex-col items-center">
                            <Upload className="h-10 w-10 mb-3" />
                            <p className="font-bold text-sm text-gray-600 group-hover:text-blue-600">Subir una imagen</p>
                            <p className="caption mt-1">PNG, JPG hasta 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* URL alternativa */}
                <div className="md:col-span-2 space-y-2">
                  <label className="label flex items-center gap-2">
                    🔗 O URL de imagen
                  </label>
                  <input
                    type="text"
                    name="foto"
                    value={formData.foto}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="https://ejemplo.com/foto.jpg"
                    disabled={!!imagePreview}
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2 space-y-2">
                  <label className="label flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="input resize-none"
                    placeholder="Breve descripción del barbero..."
                  />
                </div>

                {/* Especialidades */}
                <div className="space-y-2">
                  <label className="label flex items-center gap-2">
                    <Scissors size={16} className="text-blue-600" />
                    Especialidades
                  </label>
                  <input
                    type="text"
                    name="especialidades"
                    value={formData.especialidades}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Fade, Barba, Corte clásico"
                  />
                  <p className="caption text-gray-500">Separadas por coma</p>
                </div>

                {/* Experiencia */}
                <div className="space-y-2">
                  <label className="label flex items-center gap-2">
                    <Star size={16} className="text-blue-600" />
                    Experiencia (años)
                  </label>
                  <input
                    type="number"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleInputChange}
                    min="0"
                    className="input"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6 border-t border-gray-100 mt-8">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-[2]"
                  disabled={uploadingImage || saving}
                >
                  <Save size={18} />
                  {saving ? 'Guardando...' : (editingBarbero ? 'Actualizar Perfil' : 'Crear Barbero')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}