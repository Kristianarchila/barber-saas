import { useState, useEffect } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import { getBarberos } from "../../services/barberosService";
import { getReservasPorBarberoDia, completarReserva, cancelarReserva } from "../../services/reservasService";
import { Card, Stat, Badge, Button, Skeleton, Avatar } from "../../components/ui";
import { Calendar, Users, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ErrorAlert } from "../../components/ErrorComponents";
import { ensureArray } from "../../utils/validateData";
import WhatsAppButton from "../../components/WhatsAppButton";

dayjs.locale('es');

export default function ReservasAdmin() {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [turnos, setTurnos] = useState([]);
  const [resumen, setResumen] = useState({});

  // Hook para cargar barberos
  const { execute: loadBarberos, error: barberosError } = useApiCall(
    getBarberos,
    {
      errorMessage: 'Error al cargar barberos',
      onSuccess: (data) => setBarberos(ensureArray(data))
    }
  );

  // Hook para cargar turnos
  const { execute: fetchTurnos, loading, error: turnosError } = useApiCall(
    async () => {
      if (!selectedBarbero?._id) return [];
      return await getReservasPorBarberoDia(selectedBarbero._id, fecha);
    },
    {
      errorMessage: 'Error al cargar reservas',
      onSuccess: (reservas) => {
        const safeReservas = ensureArray(reservas);

        // Calcular resumen desde las reservas
        const resumenCalculado = {
          totalTurnos: safeReservas.length,
          completados: safeReservas.filter(r => r.estado === 'COMPLETADA').length,
          cancelados: safeReservas.filter(r => r.estado === 'CANCELADA').length,
          ingresosGenerados: safeReservas
            .filter(r => r.estado === 'COMPLETADA')
            .reduce((sum, r) => sum + (r.precioTotal || 0), 0),
          horasTrabajadas: "00:00" // Placeholder
        };

        setResumen(resumenCalculado);
        setTurnos(safeReservas);
      },
      onError: () => {
        setResumen({});
        setTurnos([]);
      }
    }
  );

  // Hook para completar reserva
  const { execute: handleCompletar, loading: completando } = useAsyncAction(
    completarReserva,
    {
      successMessage: 'Reserva completada exitosamente',
      errorMessage: 'Error al completar reserva',
      confirmMessage: '¿Marcar esta reserva como completada?',
      onSuccess: () => fetchTurnos()
    }
  );

  // Hook para cancelar reserva
  const { execute: handleCancelar, loading: cancelando } = useAsyncAction(
    cancelarReserva,
    {
      successMessage: 'Reserva cancelada',
      errorMessage: 'Error al cancelar reserva',
      confirmMessage: '¿Cancelar esta reserva?',
      onSuccess: () => fetchTurnos()
    }
  );

  useEffect(() => {
    loadBarberos();
  }, []);

  useEffect(() => {
    if (!selectedBarbero) return;
    fetchTurnos();
  }, [selectedBarbero, fecha]);

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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} />
            Agenda del Día
          </h1>
          <p className="body-large text-gray-600 mt-2">
            Control operativo de citas y disponibilidad de tus barberos
          </p>
        </div>
      </header>

      {/* ERROR ALERTS */}
      {barberosError && <ErrorAlert error={barberosError} />}
      {turnosError && <ErrorAlert error={turnosError} />}

      {/* CONTROLES DE SELECCIÓN */}
      <div className="card card-padding shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Selector de barbero */}
          <div className="space-y-3">
            <label className="label flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              Barbero en Sesión
            </label>
            <select
              className="input"
              value={selectedBarbero?._id || ""}
              onChange={e => {
                const b = barberos.find(x => x._id === e.target.value);
                setSelectedBarbero(b || null);
              }}
            >
              <option value="">Seleccione un profesional</option>
              {ensureArray(barberos).map(b => (
                <option key={b._id} value={b._id}>{b.nombre}</option>
              ))}
            </select>
          </div>

          {/* Selector de fecha */}
          <div className="space-y-3">
            <label className="label flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              Fecha de Trabajo
            </label>
            <input
              type="date"
              className="input"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* RESUMEN DEL DÍA */}
      {selectedBarbero && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden">
              {selectedBarbero.foto ? (
                <img src={selectedBarbero.foto} alt={selectedBarbero.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">{selectedBarbero.nombre.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="heading-3 animate-slide-in">
                {selectedBarbero.nombre}
              </h2>
              <p className="body-small text-gray-500">
                Agenda para el {dayjs(fecha).format('dddd, D [de] MMMM')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card card-padding shadow-sm">
              <p className="caption text-gray-400 font-bold uppercase tracking-widest mb-2">Reservas</p>
              <p className="text-3xl font-black text-gray-900">{resumen.totalTurnos || 0}</p>
            </div>

            <div className="card card-padding shadow-sm">
              <p className="caption text-gray-400 font-bold uppercase tracking-widest mb-2">Completadas</p>
              <p className="text-3xl font-black text-green-600">{resumen.completados || 0}</p>
            </div>

            <div className="card card-padding bg-gray-900 text-white shadow-lg">
              <p className="caption text-gray-500 font-bold uppercase tracking-widest mb-2">Ingresos Estimados</p>
              <p className="text-2xl font-black text-white">{formatCurrency(resumen.ingresosGenerados)}</p>
            </div>

            <div className="card card-padding shadow-sm">
              <p className="caption text-gray-400 font-bold uppercase tracking-widest mb-2">Productividad</p>
              <p className="text-3xl font-black text-gray-900">
                {resumen.totalTurnos > 0 ? Math.round((resumen.completados / resumen.totalTurnos) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LISTA DE TURNOS */}
      {selectedBarbero && (
        <div className="card overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-blue-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="heading-4">Cronograma de Turnos</h3>
                <p className="body-small text-gray-500">
                  {turnos.length} servicios para hoy
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
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hora de Cita</th>
                    <th>Cliente</th>
                    <th>Servicio Solicitado</th>
                    <th>Estado</th>
                    <th className="text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody>
                  {ensureArray(turnos).map((t, idx) => {
                    const estadoBadge = getEstadoBadge(t.estado);
                    return (
                      <tr key={t._id || idx} className="group hover:bg-gray-50/50 transition-all">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                              <Clock size={18} />
                            </div>
                            <span className="body font-bold text-gray-900">{t.hora}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            {t.clienteNombre ? (
                              <>
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-100">
                                  {t.clienteNombre.charAt(0)}
                                </div>
                                <div>
                                  <p className="body-small font-bold text-gray-900">{t.clienteNombre}</p>
                                  {t.telefonoCliente && (
                                    <WhatsAppButton
                                      phoneNumber={t.telefonoCliente}
                                      message={`Hola ${t.clienteNombre}, te contacto sobre tu reserva del ${dayjs(t.fecha).format('DD/MM/YYYY')} a las ${t.hora}`}
                                      className="mt-1"
                                      label={t.telefonoCliente}
                                    />
                                  )}
                                </div>
                              </>
                            ) : (
                              <span className="caption text-gray-400 italic">Sin asignar</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="body-small font-bold text-gray-900">{t.servicioId?.nombre || "—"}</p>
                            <p className="caption text-gray-400 uppercase tracking-widest">{t.servicioId?.duracion} min</p>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${t.estado === 'COMPLETADA' ? 'badge-success' : t.estado === 'CANCELADA' ? 'badge-error' : 'badge-primary'}`}>
                            {estadoBadge.label}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(t.estado === "RESERVADA" || t.estado === "CONFIRMADA") && (
                              <>
                                <button
                                  onClick={() => handleCompletar(t._id)}
                                  className="btn btn-ghost btn-sm text-green-600 hover:bg-green-50"
                                  title="Completar"
                                  disabled={completando || cancelando}
                                >
                                  {completando ? '...' : <CheckCircle size={18} />}
                                </button>
                                <button
                                  onClick={() => handleCancelar(t._id)}
                                  className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                                  title="Cancelar"
                                  disabled={completando || cancelando}
                                >
                                  {cancelando ? '...' : <XCircle size={18} />}
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
        </div>
      )
      }

      {/* MENSAJE INICIAL */}
      {
        !selectedBarbero && (
          <div className="card card-padding py-24 text-center shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Users size={40} />
            </div>
            <h3 className="heading-2 mb-2">Selecciona un profesional</h3>
            <p className="body-large text-gray-500 max-w-md mx-auto">
              Elige un barbero del menú superior para visualizar y gestionar su hoja de servicios diaria.
            </p>
          </div>
        )
      }
    </div >
  );
}