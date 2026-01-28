import { useState, useEffect } from 'react';
import { getBarberos, crearBarbero, editarBarbero, eliminarBarbero, toggleEstadoBarbero } from '../../services/barberosService';
import { Card, Button, Badge, Skeleton, Avatar } from '../../components/ui';
import { Users, Plus, Edit2, Trash2, Power, Upload, X, Save, Mail, Lock, Scissors, Star, FileText } from 'lucide-react';

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

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gradient-primary">
            👨‍💼 Gestión de Barberos
          </h1>
          <p className="text-neutral-400 text-lg mt-2">
            Administra tu equipo de profesionales
          </p>
        </div>
        <Button variant="primary" onClick={abrirModalNuevo}>
          <Plus size={20} />
          Nuevo Barbero
        </Button>
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
        <Card className="border-neutral-700">
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No hay barberos registrados
            </h3>
            <p className="text-neutral-400 mb-6">
              Crea el primer barbero para comenzar
            </p>
            <Button variant="primary" onClick={abrirModalNuevo}>
              <Plus size={16} />
              Crear el primero
            </Button>
          </div>
        </Card>
      ) : (
        /* GRID DE BARBEROS */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {barberos.map((barbero) => (
            <Card key={barbero._id} className="hover:shadow-glow-primary transition-all">
              <div className="p-6 space-y-4">
                {/* Header con foto y estado */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={barbero.nombre}
                      src={barbero.foto}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {barbero.nombre}
                      </h3>
                      {barbero.experiencia > 0 && (
                        <p className="text-neutral-400 text-sm flex items-center gap-1">
                          <Star size={12} className="text-accent-500" />
                          {barbero.experiencia} años
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={barbero.activo ? "success" : "error"} size="sm">
                    {barbero.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {/* Descripción */}
                {barbero.descripcion && (
                  <p className="text-neutral-300 text-sm line-clamp-2">
                    {barbero.descripcion}
                  </p>
                )}

                {/* Especialidades */}
                {barbero.especialidades && barbero.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {barbero.especialidades.map((esp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-500 bg-opacity-20 text-primary-500 rounded-lg text-xs font-semibold"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => abrirModalEditar(barbero)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-warning-500 bg-opacity-20 text-warning-500 rounded-lg hover:bg-opacity-30 transition-all"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleEstado(barbero._id)}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-all ${barbero.activo
                        ? 'bg-error-500 bg-opacity-20 text-error-500 hover:bg-opacity-30'
                        : 'bg-success-500 bg-opacity-20 text-success-500 hover:bg-opacity-30'
                      }`}
                    title={barbero.activo ? "Desactivar" : "Activar"}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(barbero._id)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-error-500 bg-opacity-20 text-error-500 rounded-lg hover:bg-opacity-30 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Header del modal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl">
                    {editingBarbero ? <Edit2 className="text-primary-500" size={24} /> : <Plus className="text-primary-500" size={24} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editingBarbero ? 'Editar Barbero' : 'Nuevo Barbero'}
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      {editingBarbero ? 'Actualiza la información' : 'Completa los datos del barbero'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-all"
                >
                  <X size={20} className="text-neutral-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Users size={16} className="text-primary-500" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    placeholder="Ej: Carlos Soto"
                  />
                </div>

                {/* Email (solo crear) */}
                {!editingBarbero && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                      <Mail size={16} className="text-primary-500" />
                      Email (login) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                      placeholder="barbero@correo.com"
                    />
                  </div>
                )}

                {/* Password (solo crear) */}
                {!editingBarbero && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                      <Lock size={16} className="text-primary-500" />
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                )}

                {/* Foto - Upload */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Upload size={16} className="text-primary-500" />
                    Foto del Barbero
                  </label>

                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-error-500 hover:bg-error-600 text-white rounded-full transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-primary-500 transition-all">
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
                          <div className="text-neutral-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-2"></div>
                            <p>Cargando imagen...</p>
                          </div>
                        ) : (
                          <div className="text-neutral-400">
                            <Upload className="mx-auto h-12 w-12 mb-2" />
                            <p className="font-semibold">Click para subir imagen</p>
                            <p className="text-xs mt-1">PNG, JPG hasta 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* URL alternativa */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    🔗 O URL de imagen
                  </label>
                  <input
                    type="text"
                    name="foto"
                    value={formData.foto}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    placeholder="https://ejemplo.com/foto.jpg"
                    disabled={!!imagePreview}
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <FileText size={16} className="text-primary-500" />
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none resize-none"
                    placeholder="Breve descripción del barbero..."
                  />
                </div>

                {/* Especialidades */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Scissors size={16} className="text-primary-500" />
                    Especialidades
                  </label>
                  <input
                    type="text"
                    name="especialidades"
                    value={formData.especialidades}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    placeholder="Fade, Barba, Corte clásico"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Separadas por coma</p>
                </div>

                {/* Experiencia */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Star size={16} className="text-primary-500" />
                    Años de experiencia
                  </label>
                  <input
                    type="number"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={uploadingImage}
                >
                  <Save size={16} />
                  {editingBarbero ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}