import { useEffect, useState } from "react";
import { getBarberos } from "../../services/barberosService";
import { getHorarios, saveHorario, toggleHorario } from "../../services/horariosService";
import { Card, Button, Badge, Skeleton, Avatar } from "../../components/ui";
import { Clock, Users, Plus, Power, Calendar, Timer, AlertCircle } from "lucide-react";

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function Horarios() {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    diaSemana: 1,
    horaInicio: "09:00",
    horaFin: "18:00",
    duracionTurno: 30
  });

  useEffect(() => {
    getBarberos()
      .then(data => {
        setBarberos(data);
      })
      .catch(error => {
        console.error("Error cargando barberos:", error);
      });
  }, []);

  useEffect(() => {
    if (!selectedBarbero) return;
    fetchHorarios();
  }, [selectedBarbero]);

  async function fetchHorarios() {
    if (!selectedBarbero || !selectedBarbero.id) {
      setError("Error: Barbero no válido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getHorarios(selectedBarbero.id);
      setHorarios(data);
    } catch (error) {
      console.error("Error cargando horarios:", error);
      const errorMsg = error.response?.data?.message || error.message || "Error al cargar horarios";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await saveHorario(selectedBarbero.id, {
        ...form,
        diaSemana: Number(form.diaSemana),
        duracionTurno: Number(form.duracionTurno)
      });
      await fetchHorarios();

      // Reset form
      setForm({
        diaSemana: 1,
        horaInicio: "09:00",
        horaFin: "18:00",
        duracionTurno: 30
      });
    } catch (error) {
      alert("Error al guardar horario: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id) {
    try {
      await toggleHorario(id);
      await fetchHorarios();
    } catch (error) {
      alert("Error al cambiar estado: " + (error.response?.data?.message || error.message));
    }
  }

  // Agrupar horarios por día
  const horariosPorDia = horarios.reduce((acc, h) => {
    if (!acc[h.diaSemana]) acc[h.diaSemana] = [];
    acc[h.diaSemana].push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header>
        <h1 className="heading-1">Gestión de Horarios</h1>
        <p className="body-large text-gray-600 mt-2">
          Configura los horarios de atención de cada barbero
        </p>
      </header>

      {/* SELECTOR DE BARBERO */}
      <div className="card card-padding">
        <label className="label mb-2 flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          Seleccionar Barbero
        </label>
        <select
          className="input w-full md:w-64"
          value={selectedBarbero?.id || ""}
          onChange={e => {
            const b = barberos.find(x => x.id === e.target.value);
            setSelectedBarbero(b);
          }}
        >
          <option key="" value="">Selecciona un barbero</option>
          {barberos.map(b => (
            <option key={b.id} value={b.id}>{b.nombre}</option>
          ))}
        </select>
      </div>

      {!selectedBarbero ? (
        /* EMPTY STATE */
        <div className="card card-padding text-center py-20">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-blue-600" size={32} />
          </div>
          <h3 className="heading-3 mb-2">
            Selecciona un barbero
          </h3>
          <p className="body text-gray-500">
            Elige un barbero arriba para gestionar sus horarios
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* INFO DEL BARBERO */}
          <div className="flex items-center gap-4 py-2">
            <Avatar name={selectedBarbero.nombre} src={selectedBarbero.foto} size="lg" />
            <div>
              <h2 className="heading-2">
                {selectedBarbero.nombre}
              </h2>
              <p className="body text-gray-500">
                Configurando horarios de atención
              </p>
            </div>
          </div>

          {/* FORMULARIO DE NUEVO HORARIO */}
          <div className="card card-padding space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Plus className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="heading-4">
                  Agregar Horario
                </h3>
                <p className="body-small text-gray-500">
                  Define un nuevo bloque de horario
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Día de la semana */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  Día
                </label>
                <select
                  className="input"
                  value={form.diaSemana}
                  onChange={e => setForm({ ...form, diaSemana: Number(e.target.value) })}
                >
                  {DIAS_SEMANA.map((dia, idx) => (
                    <option key={idx} value={idx}>{dia}</option>
                  ))}
                </select>
              </div>

              {/* Duración del turno */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Timer size={16} className="text-blue-600" />
                  Turnos (min)
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.duracionTurno}
                  onChange={e => setForm({ ...form, duracionTurno: Number(e.target.value) })}
                  placeholder="30"
                  min="15"
                  step="15"
                />
              </div>

              {/* Hora inicio */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  Inicio
                </label>
                <input
                  type="time"
                  className="input"
                  value={form.horaInicio}
                  onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                />
              </div>

              {/* Hora fin */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  Fin
                </label>
                <input
                  type="time"
                  className="input"
                  value={form.horaFin}
                  onChange={e => setForm({ ...form, horaFin: e.target.value })}
                />
              </div>
            </div>

            <button onClick={handleSave} className="btn btn-primary w-full md:w-auto" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Horario"}
            </button>
          </div>

          {/* LISTA DE HORARIOS */}
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="heading-4">
                    Horarios Configurados
                  </h3>
                  <p className="body-small text-gray-500">
                    {horarios.length} {horarios.length === 1 ? 'horario' : 'horarios'} registrados
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} />
                  <p className="font-semibold">Error al cargar horarios</p>
                </div>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} variant="rectangular" height="h-16" />
                ))}
              </div>
            ) : horarios.length === 0 ? (
              <div className="card card-padding py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-gray-300" size={24} />
                </div>
                <h3 className="heading-4 mb-2">
                  Sin horarios configurados
                </h3>
                <p className="body text-gray-500">
                  Agrega el primer horario usando el formulario arriba
                </p>
              </div>
            ) : (
              <div className="card card-padding">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2, 3, 4, 5, 6].map(dia => {
                    const horariosDelDia = horariosPorDia[dia] || [];
                    if (horariosDelDia.length === 0) return null;

                    return (
                      <div key={dia} className="space-y-3">
                        <h4 className="label text-gray-400 flex items-center gap-2">
                          <Calendar size={14} />
                          {DIAS_SEMANA[dia]}
                        </h4>
                        {horariosDelDia.map(h => (
                          <div
                            key={h.id}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                <Clock size={14} className="text-gray-400" />
                                <span>{h.horaInicio} - {h.horaFin}</span>
                              </div>
                              <span className={`badge ${h.activo ? 'badge-success' : 'badge-error'}`}>
                                {h.activo ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="caption text-gray-500">
                                Turnos de {h.duracionTurno} min
                              </span>
                              <button
                                onClick={() => handleToggle(h.id)}
                                className={`p-2 rounded-lg transition-all ${h.activo
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                                  }`}
                                title={h.activo ? "Desactivar" : "Activar"}
                              >
                                <Power size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
