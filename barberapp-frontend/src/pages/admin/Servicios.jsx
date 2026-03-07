import { useEffect, useState } from "react";
import { getServicios, crearServicio, editarServicio, cambiarEstadoServicio, getCategorias, saveCategorias } from "../../services/serviciosService";
import uploadService from "../../services/uploadService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { toast } from "react-hot-toast";

export default function Servicios() {
  const [tab, setTab] = useState('servicios'); // 'servicios' | 'categorias'
  const [servicios, setServicios] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    duracion: "",
    precio: "",
    extras: "",
    imagen: "",
    categoria: "Cortes",
    destacado: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Categorías
  const [categorias, setCategorias] = useState([]);
  const [catInput, setCatInput] = useState('');
  const [savingCats, setSavingCats] = useState(false);

  // Ya no usamos lista fija — se usa el state `categorias`
  const nombresCategorias = categorias.map(c => c.nombre);

  // Hook para cargar servicios con manejo de errores
  const { execute: cargarServicios, loading, error } = useApiCall(
    getServicios,
    {
      errorMessage: 'No pudimos cargar tus servicios',
      onSuccess: (data) => setServicios(data)
    }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    cargarServicios();
    getCategorias().then(cats => {
      if (cats.length > 0) setCategorias(cats);
      else setCategorias([{ nombre: 'Cortes', orden: 0 }, { nombre: 'Barbas', orden: 1 }, { nombre: 'General', orden: 2 }]);
    }).catch(() => {
      setCategorias([{ nombre: 'Cortes', orden: 0 }, { nombre: 'Barbas', orden: 1 }, { nombre: 'General', orden: 2 }]);
    });
  }, []);

  // Hook para guardar servicio (crear/editar) con protección contra doble click
  const { execute: handleGuardarServicio, loading: saving } = useAsyncAction(
    async () => {
      // Validación de campos obligatorios
      if (!form.nombre || !form.duracion || !form.precio) {
        toast.error('Completa todos los campos obligatorios');
        throw new Error('Campos obligatorios faltantes');
      }

      let imageUrl = form.imagen;

      // Subir imagen si existe
      if (imageFile) {
        const uploadRes = await uploadService.uploadServiceImage(imageFile);
        if (uploadRes.success) {
          imageUrl = uploadRes.url;
        }
      }

      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion || "",
        duracion: Number(form.duracion),
        precio: Number(form.precio),
        extras: form.extras || "",
        imagen: imageUrl,
        categoria: form.categoria || "General",
        destacado: form.destacado || false
      };

      // Crear o editar según el caso
      return editId
        ? await editarServicio(editId, payload)
        : await crearServicio(payload);
    },
    {
      successMessage: editId ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente',
      errorMessage: 'Error al guardar servicio',
      onSuccess: () => {
        cargarServicios();
        cerrarModal();
      }
    }
  );

  // Hook para cambiar estado del servicio con protección
  const { execute: handleToggleEstado, loading: toggling } = useAsyncAction(
    cambiarEstadoServicio,
    {
      successMessage: 'Estado del servicio actualizado',
      errorMessage: 'Error al cambiar estado',
      onSuccess: () => {
        cargarServicios();
        setConfirmDelete(null);
      }
    }
  );

  const abrirNuevo = () => {
    setEditId(null);
    setForm({ nombre: "", descripcion: "", duracion: "", precio: "", extras: "", imagen: "", categoria: "Cortes" });
    setImageFile(null);
    setImagePreview("");
    setOpen(true);
  };

  const abrirEditar = (servicio) => {
    setEditId(servicio._id);
    setForm({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || "",
      duracion: servicio.duracion,
      precio: servicio.precio,
      extras: servicio.extras || "",
      imagen: servicio.imagen || "",
      categoria: servicio.categoria || "General",
      destacado: servicio.destacado || false
    });
    setImagePreview(servicio.imagen || "");
    setImageFile(null);
    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setEditId(null);
    setForm({ nombre: "", descripcion: "", duracion: "", precio: "", extras: "", imagen: "", categoria: "" });
    setImageFile(null);
    setImagePreview("");
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor selecciona un archivo de imagen válido");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const capitalizarNombre = (nombre) => {
    return nombre.split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return <LoadingSpinner label="Sincronizando tus servicios..." fullPage />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorMessage
          title="Error al cargar"
          message={error}
          onRetry={cargarServicios}
        />
      </div>
    );
  }

  /* ── Handlers de categorías ─────────────────────────── */
  const addCategoria = () => {
    const nombre = catInput.trim();
    if (!nombre) return;
    if (categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      toast.error('Esa categoría ya existe');
      return;
    }
    setCategorias([...categorias, { nombre, orden: categorias.length }]);
    setCatInput('');
  };

  const removeCategoria = (nombre) => {
    const enUso = servicios.some(s => s.categoria === nombre);
    if (enUso) { toast.error(`"${nombre}" tiene servicios asignados. Cambia su categoría primero.`); return; }
    setCategorias(categorias.filter(c => c.nombre !== nombre));
  };

  const renameCategoria = (oldNombre, newNombre) => {
    const trimmed = newNombre.trim();
    if (!trimmed) return;
    setCategorias(categorias.map(c => c.nombre === oldNombre ? { ...c, nombre: trimmed } : c));
  };

  const moveCat = (index, dir) => {
    const arr = [...categorias];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setCategorias(arr.map((c, i) => ({ ...c, orden: i })));
  };

  const handleSaveCategorias = async () => {
    setSavingCats(true);
    try {
      await saveCategorias(categorias.map((c, i) => ({ nombre: c.nombre, orden: i })));
      toast.success('Categorías guardadas');
    } catch {
      toast.error('Error guardando categorías');
    } finally {
      setSavingCats(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <h1 className="heading-1">Servicios</h1>
          <p className="body-large text-gray-600 mt-2">Control total sobre tu catálogo y precios</p>
        </div>
        {tab === 'servicios' && (
          <button onClick={abrirNuevo} className="btn btn-primary flex items-center gap-2">
            <span className="text-xl">+</span> Añadir Servicio
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {[{ key: 'servicios', label: 'Servicios' }, { key: 'categorias', label: 'Categorías' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${tab === t.key
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SERVICIOS ─────────────── */}
      {tab === 'servicios' && (
        <>
          {servicios.length === 0 ? (
            <div className="card card-padding text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">✂️</span>
              </div>
              <h2 className="heading-3 mb-2">Tu catálogo está vacío</h2>
              <p className="body text-gray-500 mb-6 max-w-sm mx-auto">Comienza agregando servicios para que tus clientes puedan reservar online.</p>
              <button onClick={abrirNuevo} className="btn btn-ghost">Crear primer servicio</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((s) => (
                <div key={s._id} className={`card card-padding transition-all duration-300 hover:shadow-md ${s.activo ? '' : 'grayscale opacity-60'}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {s.imagen
                        ? <img src={s.imagen} alt={s.nombre} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">✂️</div>
                      }
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge ${s.activo ? 'badge-success' : 'badge-error'}`}>{s.activo ? 'Activo' : 'Pausado'}</span>
                      <span className="caption text-gray-500 px-3 py-1 rounded-full bg-gray-100">{s.categoria || 'Sin Cat.'}</span>
                      {s.destacado && <span className="caption text-blue-600 px-3 py-1 rounded-full bg-blue-50">⭐ Recomendado</span>}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="heading-4 mb-2 truncate">{s.nombre}</h3>
                    <div className="flex items-center gap-4 text-gray-500 body-small">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {s.duracion} min
                      </span>
                      <span className="text-gray-900 font-bold">${s.precio?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-200">
                    <button onClick={() => abrirEditar(s)} className="btn btn-secondary">Editar</button>
                    <button onClick={() => setConfirmDelete(s._id)} className={`btn ${s.activo ? 'btn-ghost text-red-600 hover:bg-red-50' : 'btn-ghost text-green-600 hover:bg-green-50'}`}>
                      {s.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB: CATEGORÍAS ─────────────── */}
      {tab === 'categorias' && (
        <div className="max-w-xl">
          <p className="body text-gray-600 mb-6">Organiza tus servicios en categorías. El orden aquí determina el orden de los filtros en tu web pública.</p>

          {/* Add new */}
          <div className="flex gap-3 mb-6">
            <input
              value={catInput}
              onChange={e => setCatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategoria()}
              placeholder="Nueva categoría (ej: VIP, Tratamientos...)"
              className="input flex-1"
            />
            <button onClick={addCategoria} className="btn btn-primary px-5">+ Añadir</button>
          </div>

          {/* List */}
          <div className="space-y-2 mb-8">
            {categorias.length === 0 && (
              <p className="body text-gray-400 text-center py-10">No hay categorías. Añade la primera.</p>
            )}
            {categorias.map((cat, idx) => (
              <div key={cat.nombre + idx} className="flex items-center gap-3 card card-padding py-3 px-4">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveCat(idx, -1)} disabled={idx === 0} className="text-gray-300 hover:text-gray-700 disabled:opacity-20 cursor-pointer leading-none">▲</button>
                  <button onClick={() => moveCat(idx, 1)} disabled={idx === categorias.length - 1} className="text-gray-300 hover:text-gray-700 disabled:opacity-20 cursor-pointer leading-none">▼</button>
                </div>
                {/* Editable name */}
                <input
                  defaultValue={cat.nombre}
                  onBlur={e => renameCategoria(cat.nombre, e.target.value)}
                  className="input flex-1 py-1 text-sm"
                />
                {/* Service count badge */}
                <span className="caption text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {servicios.filter(s => s.categoria === cat.nombre).length} servicios
                </span>
                {/* Delete */}
                <button onClick={() => removeCategoria(cat.nombre)} className="text-red-400 hover:text-red-600 cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleSaveCategorias} disabled={savingCats} className="btn btn-primary w-full">
            {savingCats ? 'Guardando...' : '✓ Guardar Categorías'}
          </button>
        </div>
      )}

      {/* Modales */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="card card-padding max-w-md w-full">
            <h3 className="heading-3 mb-4">¿Actualizar estado?</h3>
            <p className="body text-gray-600 mb-6">
              Esto cambiará la visibilidad de tu servicio para los clientes en tiempo real.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn btn-ghost flex-1"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleToggleEstado(confirmDelete)}
                className="btn btn-primary flex-1"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 lg:p-10 overflow-y-auto">
          <div className="card card-padding max-w-2xl w-full my-auto relative">
            <button onClick={cerrarModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <header className="mb-8">
              <h2 className="heading-2">
                {editId ? "Editar Servicio" : "Nuevo Servicio"}
              </h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* IZQUIERDA: Formulario */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label">Nombre *</label>
                  <input
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="input"
                    placeholder="Ej: Corte de Autor"
                    minLength={2}
                    maxLength={80}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label">Precio *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value })}
                      className="input"
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label">Tiempo (Min) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="480"
                      value={form.duracion}
                      onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                      className="input"
                      placeholder="45"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="input"
                  >
                    <option value="">Sin categoría</option>
                    {(nombresCategorias.length > 0 ? nombresCategorias : ['Cortes', 'Barbas', 'Colorimetría', 'Faciales', 'General', 'Otros']).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Destacado toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div>
                    <p className="label mb-0.5">Marcar como Recomendado</p>
                    <p className="caption text-gray-500">Aparece con badge en la web pública</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, destacado: !form.destacado })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.destacado ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    aria-checked={form.destacado}
                    role="switch"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.destacado ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="label">Descripción corta</label>
                  <textarea
                    rows={2}
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="input resize-none"
                    placeholder="Describe el servicio..."
                  />
                </div>
              </div>

              {/* DERECHA: Imagen con Drag & Drop */}
              <div className="flex flex-col">
                <label className="label mb-2">Imagen Referencial</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex-grow min-h-[250px] border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-6 text-center overflow-hidden ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : imagePreview ? 'border-gray-300' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <p className="text-white font-bold mb-4">Soltar para reemplazar</p>
                        <label htmlFor="image-input" className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-sm font-bold">Cambiar</label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mb-4 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-gray-700 font-semibold text-sm mb-1">Arrastra tu imagen aquí</p>
                      <p className="text-gray-500 caption">Recomendado: 800x600px (3:2)</p>
                      <label htmlFor="image-input" className="mt-4 cursor-pointer text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">O busca un archivo</label>
                    </>
                  )}
                  <input type="file" id="image-input" className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
                {imagePreview && (
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(""); setForm({ ...form, imagen: "" }); }}
                    className="mt-4 text-red-600 font-semibold text-sm hover:text-red-700 self-center"
                  >
                    Eliminar Imagen
                  </button>
                )}
              </div>
            </div>

            <footer className="flex gap-4 border-t border-gray-200 pt-8">
              <button
                onClick={cerrarModal}
                className="btn btn-ghost flex-1"
              >
                Descartar
              </button>
              <button
                onClick={handleGuardarServicio}
                disabled={saving}
                className="btn btn-primary flex-[2]"
              >
                {saving ? "Procesando..." : editId ? "Actualizar Servicio" : "Publicar Servicio"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}