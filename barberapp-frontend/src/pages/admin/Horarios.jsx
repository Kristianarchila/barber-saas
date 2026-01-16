import { useEffect, useState } from "react";
import { getBarberos } from "../../services/barberosService";
import { getHorarios, saveHorario, toggleHorario } from "../../services/horariosService";

export default function Horarios() {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Campos del formulario
  const [form, setForm] = useState({
    diaSemana: 1,          // lunes por defecto
    horaInicio: "09:00",
    horaFin: "18:00",
    duracionTurno: 30
  });

  // cargar barberos
  useEffect(() => {
    getBarberos().then(data => setBarberos(data));
  }, []);

  // cargar horarios al seleccionar barbero
  useEffect(() => {
    if (!selectedBarbero) return;
    fetchHorarios();
  }, [selectedBarbero]);

  async function fetchHorarios() {
    setLoading(true);
    const data = await getHorarios(selectedBarbero._id);
    setHorarios(data);
    setLoading(false);
  }

  // guardar horario
  async function handleSave() {
    await saveHorario(selectedBarbero._id, {
      ...form,
      diaSemana: Number(form.diaSemana),  // aseguramos number
      duracionTurno: Number(form.duracionTurno)
    });

    await fetchHorarios(); // refrescar lista
  }

  return (
    <div className="text-white p-4">
      <h1 className="text-3xl font-bold mb-6">🕒 Horarios</h1>

      {/* seleccionar barbero */}
      <select
        className="bg-gray-800 p-2 rounded mb-4"
        value={selectedBarbero?._id || ""}
        onChange={e => {
          const b = barberos.find(x => x._id === e.target.value);
          setSelectedBarbero(b);
        }}
      >
        <option value="">Selecciona un barbero</option>
        {barberos.map(b => (
          <option key={b._id} value={b._id}>{b.nombre}</option>
        ))}
      </select>

      {!selectedBarbero ? (
        <p className="text-gray-400">Elige un barbero para gestionar horarios</p>
      ) : (
        <div className="space-y-6">

          {/* FORM */}
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Agregar / actualizar horario</h2>

            <div className="flex flex-col gap-2">

              <select
                className="bg-gray-700 p-2 rounded"
                value={form.diaSemana}
                onChange={e => setForm({ ...form, diaSemana: Number(e.target.value) })}
              >
                <option value={0}>Domingo</option>
                <option value={1}>Lunes</option>
                <option value={2}>Martes</option>
                <option value={3}>Miércoles</option>
                <option value={4}>Jueves</option>
                <option value={5}>Viernes</option>
                <option value={6}>Sábado</option>
              </select>

              <input
                type="time"
                className="bg-gray-700 p-2 rounded"
                value={form.horaInicio}
                onChange={e => setForm({ ...form, horaInicio: e.target.value })}
              />

              <input
                type="time"
                className="bg-gray-700 p-2 rounded"
                value={form.horaFin}
                onChange={e => setForm({ ...form, horaFin: e.target.value })}
              />

              <input
                type="number"
                className="bg-gray-700 p-2 rounded"
                value={form.duracionTurno}
                onChange={e => setForm({ ...form, duracionTurno: Number(e.target.value) })}
                placeholder="Duración min"
              />

              <button
                className="bg-blue-600 rounded p-2 mt-2"
                onClick={handleSave}
              >
                Guardar horario
              </button>
            </div>
          </div>

          {/* LISTA */}
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-3">Horarios asignados</h2>

            {loading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : horarios.length === 0 ? (
              <p className="text-gray-400">Sin horarios para este barbero</p>
            ) : (
              horarios.map(h => (
                <div key={h._id} className="flex justify-between border-b border-gray-700 py-2">
                  <span>
                    {["Dom","Lun","Mar","Mie","Jue","Vie","Sab"][h.diaSemana]}:
                    {" "}{h.horaInicio} - {h.horaFin}
                  </span>
                  <button
                    className={`px-3 py-1 rounded ${
                      h.activo ? "bg-green-600" : "bg-red-600"
                    }`}
                    onClick={() => toggleHorario(h._id).then(fetchHorarios)}
                  >
                    {h.activo ? "Activo" : "Inactivo"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
