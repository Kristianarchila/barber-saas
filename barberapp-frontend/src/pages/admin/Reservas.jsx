import { useState, useEffect } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import { getBarberos } from "../../services/barberosService";
import { getReservasPorBarberoDia, completarReserva, cancelarReserva } from "../../services/reservasService";
import { Card, Stat, Badge, Button, Skeleton, Avatar } from "../../components/ui";
import { Calendar, Users, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from "lucide-react";

dayjs.locale('es');

export default function ReservasAdmin() {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));

  const [turnos, setTurnos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBarberos().then(data => setBarberos(data));
  }, []);

  useEffect(() => {
    if (!selectedBarbero) return;
    fetchTurnos();
  }, [selectedBarbero, fecha]);

  async function fetchTurnos() {
    setLoading(true);
    try {
      const reservas = await getReservasPorBarberoDia(selectedBarbero._id, fecha);

      // Calcular resumen desde las reservas
      const resumenCalculado = {
        totalTurnos: reservas.length,
        completados: reservas.filter(r => r.estado === 'COMPLETADA').length,
        cancelados: reservas.filter(r => r.estado === 'CANCELADA').length,
        ingresosGenerados: reservas
          .filter(r => r.estado === 'COMPLETADA')
          .reduce((sum, r) => sum + (r.precioTotal || 0), 0),
        horasTrabajadas: "00:00" // Placeholder
      };

      setResumen(resumenCalculado);
      setTurnos(reservas);
    } catch (err) {
      console.log("Error cargando reservas:", err);
      setResumen({});
      setTurnos([]);
    }
    setLoading(false);
  }

  async function handleCompletar(id) {
    if (!window.confirm("¿Marcar esta reserva como completada?")) return;
    await completarReserva(id);
    fetchTurnos();
  }

  async function handleCancelar(id) {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    await cancelarReserva(id);
    fetchTurnos();
  }

  const getEstadoBadge = (estado) => {
    const estados = {
      RESERVADA: { variant: "info", label: "Reservada" },
      CONFIRMADA: { variant: "success", label: "Confirmada" },
      COMPLETADA: { variant: "success", label: "Completada" },
      CANCELADA: { variant: "error", label: "Cancelada" },
      DISPONIBLE: { variant: "neutral", label: "Disponible" },
      NO_ASISTIO: { variant: "warning", label: "No asistió" }
    };
    return estados[estado] || { variant: "neutral", label: estado };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gradient-primary">
          📅 Agenda del Día
        </h1>
        <p className="text-neutral-400 text-lg">
          Gestiona las reservas y turnos de tus barberos
        </p>
      </header>

      {/* CONTROLES DE SELECCIÓN */}
      <Card variant="glass">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Selector de barbero */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-3">
              <Users size={16} className="text-primary-500" />
              Seleccionar Barbero
            </label>
            <select
              className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
              value={selectedBarbero?._id || ""}
              onChange={e => {
                const b = barberos.find(x => x._id === e.target.value);
                setSelectedBarbero(b || null);
              }}
            >
              <option value="">Seleccione un barbero</option>
              {barberos.map(b => (
                <option key={b._id} value={b._id}>{b.nombre}</option>
              ))}
            </select>
          </div>

          {/* Selector de fecha */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-3">
              <Calendar size={16} className="text-primary-500" />
              Seleccionar Fecha
            </label>
            <input
              type="date"
              className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* RESUMEN DEL DÍA */}
      {selectedBarbero && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Avatar name={selectedBarbero.nombre} size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedBarbero.nombre}
              </h2>
              <p className="text-neutral-400">
                {dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stat
              title="Total Reservas"
              value={resumen.totalTurnos || 0}
              icon="📋"
              color="primary"
            />

            <Stat
              title="Completadas"
              value={resumen.completados || 0}
              icon="✅"
              color="success"
            />

            <Stat
              title="Ingresos Generados"
              value={formatCurrency(resumen.ingresosGenerados)}
              icon="💰"
              color="accent"
            />

            <Stat
              title="Horas Trabajadas"
              value={resumen.horasTrabajadas || "00:00"}
              icon="⏰"
              color="warning"
            />
          </div>
        </div>
      )}

      {/* LISTA DE TURNOS */}
      {selectedBarbero && (
        <Card>
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl">
                <Clock className="text-primary-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Turnos del Día
                </h3>
                <p className="text-neutral-400 text-sm">
                  {turnos.length} {turnos.length === 1 ? 'turno' : 'turnos'} registrados
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height="h-20" />
              ))}
            </div>
          ) : turnos.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-neutral-800 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-neutral-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No hay reservas
              </h3>
              <p className="text-neutral-400">
                No hay turnos programados para esta fecha
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Hora</th>
                    <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Cliente</th>
                    <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Servicio</th>
                    <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Estado</th>
                    <th className="text-right p-4 text-xs font-bold text-neutral-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((t, idx) => {
                    const estadoBadge = getEstadoBadge(t.estado);
                    return (
                      <tr
                        key={t._id || idx}
                        className="border-b border-neutral-800 hover:bg-neutral-800 hover:bg-opacity-30 transition-all"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-neutral-500" />
                            <span className="text-white font-bold text-lg">{t.hora}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {t.clienteNombre ? (
                              <>
                                <Avatar name={t.clienteNombre} size="sm" />
                                <span className="text-white font-semibold">{t.clienteNombre}</span>
                              </>
                            ) : (
                              <span className="text-neutral-500 italic">Sin cliente</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{t.servicioId?.nombre || "—"}</p>
                            {t.servicioId?.duracion && (
                              <p className="text-neutral-400 text-sm flex items-center gap-1">
                                <Clock size={12} />
                                {t.servicioId.duracion} min
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={estadoBadge.variant} size="sm">
                            {estadoBadge.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {(t.estado === "RESERVADA" || t.estado === "CONFIRMADA") && (
                              <>
                                <button
                                  onClick={() => handleCompletar(t._id)}
                                  className="p-2 bg-success-500 bg-opacity-20 text-success-500 rounded-lg hover:bg-opacity-30 transition-all"
                                  title="Completar"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancelar(t._id)}
                                  className="p-2 bg-error-500 bg-opacity-20 text-error-500 rounded-lg hover:bg-opacity-30 transition-all"
                                  title="Cancelar"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* MENSAJE INICIAL */}
      {!selectedBarbero && (
        <Card className="border-neutral-700">
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-primary-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Selecciona un barbero
            </h3>
            <p className="text-neutral-400">
              Elige un barbero arriba para ver su agenda del día
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}