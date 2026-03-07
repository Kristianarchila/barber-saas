import { useState, useEffect } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import { getBarberos } from "../../services/barberosService";
import { getReservasPorBarberoDia, completarReserva, cancelarReserva, crearReserva, reagendarReserva } from "../../services/reservasService";
import { getServicios } from "../../services/serviciosService";
import { Card, Stat, Badge, Button, Skeleton, Avatar } from "../../components/ui";
import { Calendar, Users, Clock, DollarSign, CheckCircle, XCircle, Plus, X, Save, Loader2, CalendarClock } from "lucide-react";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { ErrorAlert } from "../../components/ErrorComponents";
import { ensureArray } from "../../utils/validateData";
import WhatsAppButton from "../../components/WhatsAppButton";
import { toast } from "react-hot-toast";

dayjs.locale('es');

export default function ReservasAdmin() {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [turnos, setTurnos] = useState([]);
  const [resumen, setResumen] = useState({});

  // Estado del modal de nueva reserva
  const [showModal, setShowModal] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingReserva, setSavingReserva] = useState(false);
  const [formReserva, setFormReserva] = useState({
    barberoId: '',
    servicioId: '',
    fecha: dayjs().format('YYYY-MM-DD'),
    hora: '',
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
  });

  // Estado del modal de reagendar
  const [reagendarModal, setReagendarModal] = useState(null); // reserva seleccionada
  const [reagendarForm, setReagendarForm] = useState({ fecha: '', hora: '' });
  const [reagendarSlots, setReagendarSlots] = useState([]);
  const [loadingReagendarSlots, setLoadingReagendarSlots] = useState(false);
  const [savingReagendar, setSavingReagendar] = useState(false);

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

        // Calcular horasTrabajadas a partir de duraciones reales
        const minutosTrabajados = safeReservas
          .filter(r => r.estado === 'COMPLETADA')
          .reduce((sum, r) => sum + (r.servicioId?.duracion || 0), 0);
        const horas = Math.floor(minutosTrabajados / 60);
        const mins = minutosTrabajados % 60;
        const horasTrabajadas = `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

        // Calcular resumen desde las reservas
        const resumenCalculado = {
          totalTurnos: safeReservas.length,
          completados: safeReservas.filter(r => r.estado === 'COMPLETADA').length,
          cancelados: safeReservas.filter(r => r.estado === 'CANCELADA').length,
          ingresosGenerados: safeReservas
            .filter(r => r.estado === 'COMPLETADA')
            .reduce((sum, r) => sum + (r.precioTotal || 0), 0),
          horasTrabajadas
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
    // Cargar servicios para el modal de nueva reserva
    getServicios().then(setServicios).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBarbero) return;
    fetchTurnos();
  }, [selectedBarbero, fecha]);

  // Cargar slots disponibles para el modal de REAGENDAR
  useEffect(() => {
    if (!reagendarModal || !reagendarForm.fecha) {
      setReagendarSlots([]);
      return;
    }
    const duracion = reagendarModal.servicioId?.duracion || 30;
    const barberoId = reagendarModal.barberoId?._id || reagendarModal.barberoId || selectedBarbero?._id;
    if (!barberoId) return;

    setLoadingReagendarSlots(true);
    setReagendarSlots([]);
    setReagendarForm(prev => ({ ...prev, hora: '' }));

    const slug = window.location.pathname.split('/')[1];
    import('../../services/api').then(({ default: api }) => {
      api.get(`/barberias/${slug}/admin/reservas/horarios-disponibles`, {
        params: { barberoId, fecha: reagendarForm.fecha, duracion }
      }).then(res => {
        setReagendarSlots(ensureArray(res.data?.horariosDisponibles || res.data || []));
      }).catch(() => setReagendarSlots([]))
        .finally(() => setLoadingReagendarSlots(false));
    });
  }, [reagendarModal, reagendarForm.fecha]);

  const handleReagendar = async (e) => {
    e.preventDefault();
    if (!reagendarForm.fecha || !reagendarForm.hora) {
      toast.error('Elige una fecha y una hora');
      return;
    }
    setSavingReagendar(true);
    try {
      await reagendarReserva(reagendarModal._id, { fecha: reagendarForm.fecha, hora: reagendarForm.hora });
      toast.success('Reserva reagendada exitosamente');
      setReagendarModal(null);
      setReagendarForm({ fecha: '', hora: '' });
      fetchTurnos();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al reagendar');
    } finally {
      setSavingReagendar(false);
    }
  };

  // Cargar slots disponibles cuando cambian barbero/servicio/fecha en el modal
  useEffect(() => {
    const { barberoId, servicioId, fecha: fechaModal } = formReserva;
    if (!barberoId || !servicioId || !fechaModal) {
      setSlotsDisponibles([]);
      return;
    }
    const servicio = servicios.find(s => s._id === servicioId);
    if (!servicio) return;

    setLoadingSlots(true);
    setSlotsDisponibles([]);
    setFormReserva(prev => ({ ...prev, hora: '' }));

    const slug = window.location.pathname.split('/')[1];
    import('../../services/api').then(({ default: api }) => {
      api.get(`/barberias/${slug}/admin/reservas/horarios-disponibles`, {
        params: { barberoId, fecha: fechaModal, duracion: servicio.duracion }
      }).then(res => {
        const slots = res.data?.horariosDisponibles || res.data || [];
        setSlotsDisponibles(ensureArray(slots));
      }).catch(() => {
        setSlotsDisponibles([]);
      }).finally(() => {
        setLoadingSlots(false);
      });
    });
  }, [formReserva.barberoId, formReserva.servicioId, formReserva.fecha]);

  const handleCrearReserva = async (e) => {
    e.preventDefault();
    if (!formReserva.barberoId || !formReserva.servicioId || !formReserva.fecha || !formReserva.hora || !formReserva.nombreCliente) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setSavingReserva(true);
    try {
      await crearReserva(formReserva.barberoId, {
        servicioId: formReserva.servicioId,
        fecha: formReserva.fecha,
        hora: formReserva.hora,
        nombreCliente: formReserva.nombreCliente,
        emailCliente: formReserva.emailCliente,
        telefonoCliente: formReserva.telefonoCliente,
      });
      toast.success('Reserva creada exitosamente');
      setShowModal(false);
      setFormReserva({ barberoId: '', servicioId: '', fecha: dayjs().format('YYYY-MM-DD'), hora: '', nombreCliente: '', telefonoCliente: '', emailCliente: '' });
      // Si el barbero del modal es el mismo que el seleccionado, recargar agenda
      if (formReserva.barberoId === selectedBarbero?._id) {
        fetchTurnos();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setSavingReserva(false);
    }
  };

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
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary self-start md:self-center"
        >
          <Plus size={18} />
          Nueva Reserva
        </button>
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
                                  onClick={() => {
                                    setReagendarModal(t);
                                    setReagendarForm({ fecha: dayjs().format('YYYY-MM-DD'), hora: '' });
                                  }}
                                  className="btn btn-ghost btn-sm text-blue-600 hover:bg-blue-50"
                                  title="Reagendar"
                                  disabled={completando || cancelando}
                                >
                                  <CalendarClock size={18} />
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

      {/* MODAL REAGENDAR */}
      {reagendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card card-padding w-full max-w-lg relative shadow-2xl animate-slide-in">
            <button
              type="button"
              onClick={() => { setReagendarModal(null); setReagendarForm({ fecha: '', hora: '' }); }}
              className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <CalendarClock className="text-blue-600" size={22} />
              </div>
              <div>
                <h3 className="heading-3">Reagendar Cita</h3>
                <p className="body-small text-gray-500">
                  {reagendarModal.clienteNombre} · {reagendarModal.servicioId?.nombre || 'Servicio'}
                </p>
              </div>
            </div>

            <form onSubmit={handleReagendar} className="space-y-5">
              {/* Nueva fecha */}
              <div className="space-y-2">
                <label className="label">Nueva fecha</label>
                <input
                  type="date"
                  min={dayjs().format('YYYY-MM-DD')}
                  value={reagendarForm.fecha}
                  onChange={e => setReagendarForm(prev => ({ ...prev, fecha: e.target.value }))}
                  className="input"
                />
              </div>

              {/* Slots disponibles */}
              <div className="space-y-2">
                <label className="label">
                  Hora disponible
                  {loadingReagendarSlots && <Loader2 size={14} className="animate-spin inline ml-2 text-gray-400" />}
                </label>
                {!reagendarForm.fecha ? (
                  <p className="caption text-gray-400 italic">Elige una fecha para ver los horarios</p>
                ) : loadingReagendarSlots ? (
                  <p className="caption text-gray-400">Buscando horarios...</p>
                ) : reagendarSlots.length === 0 ? (
                  <p className="caption text-amber-600 font-semibold">Sin horarios disponibles para esa fecha</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {reagendarSlots.map(slot => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setReagendarForm(prev => ({ ...prev, hora: slot }))}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${reagendarForm.hora === slot
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setReagendarModal(null); setReagendarForm({ fecha: '', hora: '' }); }}
                  className="btn btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingReagendar || !reagendarForm.fecha || !reagendarForm.hora}
                  className="btn btn-primary flex-1"
                >
                  {savingReagendar ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {savingReagendar ? 'Guardando...' : 'Confirmar Reagendado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* MODAL NUEVA RESERVA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card card-padding w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Plus className="text-blue-600" size={22} />
              </div>
              <div>
                <h3 className="heading-3">Nueva Reserva</h3>
                <p className="body text-gray-500">Agenda una cita para un cliente</p>
              </div>
            </div>

            <form onSubmit={handleCrearReserva} className="space-y-5">
              {/* Barbero */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2 required">
                  <Users size={15} className="text-blue-600" /> Barbero *
                </label>
                <select
                  className="input"
                  value={formReserva.barberoId}
                  onChange={e => setFormReserva(prev => ({ ...prev, barberoId: e.target.value, hora: '' }))}
                  required
                >
                  <option value="">Selecciona un barbero</option>
                  {ensureArray(barberos).map(b => (
                    <option key={b._id} value={b._id}>{b.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Clock size={15} className="text-blue-600" /> Servicio *
                </label>
                <select
                  className="input"
                  value={formReserva.servicioId}
                  onChange={e => setFormReserva(prev => ({ ...prev, servicioId: e.target.value, hora: '' }))}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {ensureArray(servicios).map(s => (
                    <option key={s._id} value={s._id}>{s.nombre} — {s.duracion} min — {formatCurrency(s.precio)}</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Calendar size={15} className="text-blue-600" /> Fecha *
                </label>
                <input
                  type="date"
                  className="input"
                  value={formReserva.fecha}
                  min={dayjs().format('YYYY-MM-DD')}
                  onChange={e => setFormReserva(prev => ({ ...prev, fecha: e.target.value, hora: '' }))}
                  required
                />
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <Clock size={15} className="text-blue-600" /> Hora *
                </label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="body-small">Cargando horarios...</span>
                  </div>
                ) : slotsDisponibles.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {slotsDisponibles.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormReserva(prev => ({ ...prev, hora: slot }))}
                        className={`py-2 px-1 rounded-lg text-sm font-bold transition-all ${formReserva.hora === slot
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="caption text-gray-400 italic">
                    {formReserva.barberoId && formReserva.servicioId
                      ? 'Sin horarios disponibles para este día'
                      : 'Selecciona barbero y servicio primero'}
                  </p>
                )}
              </div>

              {/* Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label">Nombre del cliente *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Juan Pérez"
                    value={formReserva.nombreCliente}
                    onChange={e => setFormReserva(prev => ({ ...prev, nombreCliente: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+56 9 ..."
                    value={formReserva.telefonoCliente}
                    onChange={e => setFormReserva(prev => ({ ...prev, telefonoCliente: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="label">Email (opcional)</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="cliente@correo.com"
                    value={formReserva.emailCliente}
                    onChange={e => setFormReserva(prev => ({ ...prev, emailCliente: e.target.value }))}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setShowModal(false)}
                  disabled={savingReserva}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-[2]"
                  disabled={savingReserva || !formReserva.hora}
                >
                  {savingReserva ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {savingReserva ? 'Guardando...' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}