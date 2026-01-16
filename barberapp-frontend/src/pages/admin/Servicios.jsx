import { useEffect, useState } from "react";
import { getServicios, crearServicio, editarServicio, cambiarEstadoServicio } from "../../services/serviciosService";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);   // carga inicial
  const [saving, setSaving] = useState(false);   // crear / editar
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    duracion: "",
    precio: ""
  });

  // ===============================
  // Cargar servicios
  // ===============================
  const cargarServicios = async () => {
    try {
      setLoading(true);
      const data = await getServicios();
      setServicios(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // ===============================
  // Crear o editar servicio
  // ===============================
  const handleGuardarServicio = async () => {
    if (!form.nombre || !form.duracion || !form.precio) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nombre: form.nombre,
        duracion: Number(form.duracion),
        precio: Number(form.precio)
      };

      if (editId) {
        await editarServicio(editId, payload);
      } else {
        await crearServicio(payload);
      }

      await cargarServicios();
      cerrarModal();
    } catch (error) {
      alert("Error al guardar servicio");
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // Activar / Desactivar
  // ===============================
  const handleToggleEstado = async (id) => {
    await cambiarEstadoServicio(id);
    await cargarServicios();
  };

  // ===============================
  // Modal helpers
  // ===============================
  const abrirNuevo = () => {
    setEditId(null);
    setForm({ nombre: "", duracion: "", precio: "" });
    setOpen(true);
  };

  const abrirEditar = (servicio) => {
    setEditId(servicio._id);
    setForm({
      nombre: servicio.nombre,
      duracion: servicio.duracion,
      precio: servicio.precio
    });
    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setEditId(null);
    setForm({ nombre: "", duracion: "", precio: "" });
  };

  // ===============================
  // Render
  // ===============================
  if (loading) return <p className="text-gray-300">Cargando servicios...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">✂️ Servicios</h1>

      <button
        onClick={abrirNuevo}
        className="bg-blue-600 px-4 py-2 rounded mb-4"
      >
        ➕ Nuevo servicio
      </button>

      {servicios.length === 0 ? (
        <p>No hay servicios registrados</p>
      ) : (
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3">Duración</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s._id} className="border-t border-gray-700">
                <td className="p-3">{s.nombre}</td>
                <td className="p-3 text-center">{s.duracion} min</td>
                <td className="p-3 text-center">${s.precio}</td>
                <td className="p-3 text-center">
                  {s.activo ? "Activo" : "Inactivo"}
                </td>
                <td className="p-3 flex gap-2 justify-center">
                  <button
                    onClick={() => abrirEditar(s)}
                    className="bg-yellow-600 px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleEstado(s._id)}
                    className="bg-red-600 px-2 py-1 rounded"
                  >
                    {s.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= MODAL ================= */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Editar servicio" : "Nuevo servicio"}
            </h2>

            <input
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full mb-2 p-2 bg-gray-700"
            />

            <input
              placeholder="Duración (min)"
              type="number"
              value={form.duracion}
              onChange={(e) => setForm({ ...form, duracion: e.target.value })}
              className="w-full mb-2 p-2 bg-gray-700"
            />

            <input
              placeholder="Precio"
              type="number"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="w-full mb-4 p-2 bg-gray-700"
            />

            <div className="flex justify-end gap-2">
              <button onClick={cerrarModal} className="px-3 py-1 bg-gray-600">
                Cancelar
              </button>
              <button
                onClick={handleGuardarServicio}
                disabled={saving}
                className="px-3 py-1 bg-green-600"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}