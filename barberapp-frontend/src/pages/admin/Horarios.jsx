import { useEffect, useState } from "react";
import { getBarberos } from "../../services/barberosService";
import { getHorarios, saveHorario, toggleHorario } from "../../services/horariosService";
import { Card, Button, Badge, Skeleton, Avatar } from "../../components/ui";
import { Clock, Users, Plus, Power, Calendar, Timer } from "lucide-react";

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function Horarios() {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    diaSemana: 1,
    horaInicio: "09:00",
    horaFin: "18:00",
    duracionTurno: 30
  });

  useEffect(() => {
    getBarberos().then(data => setBarberos(data));
  }, []);

  useEffect(() => {
    if (!selectedBarbero) return;
    fetchHorarios();
  }, [selectedBarbero]);

  async function fetchHorarios() {
    setLoading(true);
    try {
      const data = await getHorarios(selectedBarbero._id);
      setHorarios(data);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await saveHorario(selectedBarbero._id, {
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
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gradient-primary">
          🕒 Gestión de Horarios
        </h1>
        <p className="text-neutral-400 text-lg">
          Configura los horarios de atención de cada barbero
        </p>
      </header>

      {/* SELECTOR DE BARBERO */}
      <Card variant="glass">
        <div className="p-6">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-3">
            <Users size={16} className="text-primary-500" />
            Seleccionar Barbero
          </label>
          <select
            className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
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
        </div>
      </Card>

      {!selectedBarbero ? (
        /* EMPTY STATE */
        <Card className="border-neutral-700">
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-primary-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Selecciona un barbero
            </h3>
            <p className="text-neutral-400">
              Elige un barbero arriba para gestionar sus horarios
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* INFO DEL BARBERO */}
          <div className="flex items-center gap-3">
            <Avatar name={selectedBarbero.nombre} src={selectedBarbero.foto} size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedBarbero.nombre}
              </h2>
              <p className="text-neutral-400">
                Configurando horarios de atención
              </p>
            </div>
          </div>

          {/* FORMULARIO DE NUEVO HORARIO */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl">
                  <Plus className="text-primary-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Agregar Horario
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    Define un nuevo bloque de horario
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Día de la semana */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Calendar size={16} className="text-primary-500" />
                    Día de la Semana
                  </label>
                  <select
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    value={form.diaSemana}
                    onChange={e => setForm({ ...form, diaSemana: Number(e.target.value) })}
                  >
                    {DIAS_SEMANA.map((dia, idx) => (
                      <option key={idx} value={idx}>{dia}</option>
                    ))}
                  </select>
                </div>

                {/* Duración del turno */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Timer size={16} className="text-primary-500" />
                    Duración del Turno (min)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    value={form.duracionTurno}
                    onChange={e => setForm({ ...form, duracionTurno: Number(e.target.value) })}
                    placeholder="30"
                    min="15"
                    step="15"
                  />
                </div>

                {/* Hora inicio */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Clock size={16} className="text-primary-500" />
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    value={form.horaInicio}
                    onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                  />
                </div>

                {/* Hora fin */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Clock size={16} className="text-primary-500" />
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    value={form.horaFin}
                    onChange={e => setForm({ ...form, horaFin: e.target.value })}
                  />
                </div>
              </div>

              <Button variant="primary" onClick={handleSave} className="w-full">
                <Plus size={16} />
                Guardar Horario
              </Button>
            </div>
          </Card>

          {/* LISTA DE HORARIOS */}
          <Card>
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl">
                  <Calendar className="text-primary-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Horarios Configurados
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    {horarios.length} {horarios.length === 1 ? 'horario' : 'horarios'} registrados
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} variant="rectangular" height="h-16" />
                ))}
              </div>
            ) : horarios.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-neutral-800 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-neutral-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Sin horarios configurados
                </h3>
                <p className="text-neutral-400 text-sm">
                  Agrega el primer horario usando el formulario arriba
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5, 6].map(dia => {
                    const horariosDelDia = horariosPorDia[dia] || [];
                    if (horariosDelDia.length === 0) return null;

                    return (
                      <div key={dia} className="space-y-2">
                        <h4 className="text-sm font-bold text-neutral-400 uppercase flex items-center gap-2">
                          <Calendar size={14} />
                          {DIAS_SEMANA[dia]}
                        </h4>
                        {horariosDelDia.map(h => (
                          <div
                            key={h._id}
                            className="p-3 bg-neutral-800 bg-opacity-50 rounded-xl border border-neutral-700 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-white font-semibold">
                                <Clock size={14} className="text-neutral-500" />
                                <span>{h.horaInicio} - {h.horaFin}</span>
                              </div>
                              <Badge variant={h.activo ? "success" : "error"} size="sm">
                                {h.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-400">
                                Turnos de {h.duracionTurno} min
                              </span>
                              <button
                                onClick={() => handleToggle(h._id)}
                                className={`p-1.5 rounded-lg transition-all ${h.activo
                                    ? 'bg-error-500 bg-opacity-20 text-error-500 hover:bg-opacity-30'
                                    : 'bg-success-500 bg-opacity-20 text-success-500 hover:bg-opacity-30'
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
          </Card>
        </div>
      )}
    </div>
  );
}
