import { useEffect, useState } from "react";
import { getHistorialReservas } from "../../services/reservasService";
import { Card } from "../../components/ui";
import { FolderOpen, Calendar, Clock, Filter, Download, Search, X, Edit2 } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import api from "../../services/api";

dayjs.locale('es');

export default function Historial() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de reagendar
  const [showReagendarModal, setShowReagendarModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");

  async function cargarHistorial() {
    setLoading(true);
    try {
      const filtros = {};
      if (fecha) filtros.fecha = fecha;
      if (estado) filtros.estado = estado;

      const data = await getHistorialReservas(filtros);
      setReservas(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarHistorial();
  }, [fecha, estado]);

  const limpiarFiltros = () => {
    setFecha("");
    setEstado("");
    setSearchTerm("");
  };

  const abrirModalReagendar = (reserva) => {
    setReservaSeleccionada(reserva);
    setNuevaFecha(reserva.fecha);
    setNuevaHora(reserva.hora);
    setShowReagendarModal(true);
  };

  const cerrarModalReagendar = () => {
    setShowReagendarModal(false);
    setReservaSeleccionada(null);
    setNuevaFecha("");
    setNuevaHora("");
  };

  const confirmarReagendado = async () => {
    if (!nuevaFecha || !nuevaHora) {
      alert("Por favor selecciona fecha y hora");
      return;
    }

    try {
      const slug = window.location.pathname.split("/")[1];
      await api.patch(
        `/barberias/${slug}/admin/reservas/${reservaSeleccionada._id}/reagendar`,
        { fecha: nuevaFecha, hora: nuevaHora }
      );

      alert("Reserva reagendada exitosamente");
      cerrarModalReagendar();
      cargarHistorial();
    } catch (error) {
      console.error("Error reagendando:", error);
      alert(error.response?.data?.message || "Error al reagendar la reserva");
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      RESERVADA: { variant: "info", label: "Reservada" },
      CONFIRMADA: { variant: "success", label: "Confirmada" },
      COMPLETADA: { variant: "success", label: "Completada" },
      CANCELADA: { variant: "error", label: "Cancelada" },
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

  // Filtrar por término de búsqueda
  const reservasFiltradas = reservas.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.clienteNombre?.toLowerCase().includes(term) ||
      r.servicioId?.nombre?.toLowerCase().includes(term) ||
      r.barberoId?.nombre?.toLowerCase().includes(term)
    );
  });

  // Calcular estadísticas
  const stats = {
    total: reservasFiltradas.length,
    completadas: reservasFiltradas.filter(r => r.estado === 'COMPLETADA').length,
    canceladas: reservasFiltradas.filter(r => r.estado === 'CANCELADA').length,
    ingresos: reservasFiltradas
      .filter(r => r.estado === 'COMPLETADA')
      .reduce((sum, r) => sum + (r.precioTotal || 0), 0)
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <FolderOpen className="text-blue-600" size={32} />
            Historial de Reservas
          </h1>
          <p className="body-large text-gray-600 mt-2">
            Consulta y filtra todas las reservas históricas de tu negocio
          </p>
        </div>
        <button className="btn btn-ghost">
          <Download size={18} className="mr-2" />
          Exportar Datos
        </button>
      </header>

      {/* FILTROS */}
      <div className="card card-padding shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-blue-600" />
            <h3 className="heading-4">Panel de Filtros</h3>
          </div>
          {(fecha || estado || searchTerm) && (
            <button
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              onClick={limpiarFiltros}
            >
              <X size={14} />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              Búsqueda Rápida
            </label>
            <input
              type="text"
              placeholder="Cliente, servicio, barbero..."
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              Filtrar por Fecha
            </label>
            <input
              type="date"
              className="input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              Estado de Reserva
            </label>
            <select
              className="input"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Cualquier estado</option>
              <option value="RESERVADA">Reservada</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="NO_ASISTIO">No asistió</option>
            </select>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-400">Total</p>
            <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg">
              <FolderOpen size={20} className="text-primary-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <p className="text-xs text-neutral-500 mt-1">Reservas encontradas</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-400">Completadas</p>
            <div className="p-2 bg-success-500 bg-opacity-20 rounded-lg">
              <span className="text-success-500 text-xl">✓</span>
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.completadas}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0}% del total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-400">Canceladas</p>
            <div className="p-2 bg-error-500 bg-opacity-20 rounded-lg">
              <span className="text-error-500 text-xl">✗</span>
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.canceladas}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {stats.total > 0 ? Math.round((stats.canceladas / stats.total) * 100) : 0}% del total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-400">Ingresos</p>
            <div className="p-2 bg-accent-500 bg-opacity-20 rounded-lg">
              <span className="text-accent-500 text-xl">💰</span>
            </div>
          </div>
          <p className="text-3xl font-black text-white">{formatCurrency(stats.ingresos)}</p>
          <p className="text-xs text-neutral-500 mt-1">De reservas completadas</p>
        </Card>
      </div>

      {/* TABLA DE HISTORIAL */}
      {/* TABLA DE HISTORIAL */}
      <div className="card overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-blue-600">
              <FolderOpen size={24} />
            </div>
            <div>
              <h3 className="heading-4">Registro Detallado</h3>
              <p className="body-small text-gray-500">
                Mostrando {reservasFiltradas.length} resultados filtrados
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="text-gray-200" size={32} />
            </div>
            <p className="body font-bold text-gray-500">No se encontraron registros</p>
            <p className="caption text-gray-400 mt-1">Prueba ajustando los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente / Fecha</th>
                  <th>Atendido por</th>
                  <th>Servicio</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((r) => {
                  const estadoBadge = getEstadoBadge(r.estado);
                  return (
                    <tr key={r._id} className="group hover:bg-gray-50/80 transition-all">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-blue-600 font-bold">
                            {r.clienteNombre?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="body-small font-bold text-gray-900">{r.clienteNombre || "—"}</p>
                            <div className="flex items-center gap-1.5 caption text-gray-400 mt-0.5">
                              <Calendar size={12} />
                              {dayjs(r.fecha).format('DD/MM/YYYY')} · <Clock size={12} /> {r.hora}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="body-small font-medium text-gray-700">{r.barberoId?.nombre || "—"}</span>
                      </td>
                      <td>
                        <div>
                          <p className="body-small font-bold text-gray-900">{r.servicioId?.nombre || "—"}</p>
                          <p className="caption text-gray-400 uppercase tracking-widest">{r.servicioId?.duracion} min</p>
                        </div>
                      </td>
                      <td>
                        <span className="body-small font-black text-gray-900">
                          {formatCurrency(r.precioTotal)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${r.estado === 'COMPLETADA' ? 'badge-success' : r.estado === 'CANCELADA' ? 'badge-error' : 'badge-primary'}`}>
                          {estadoBadge.label}
                        </span>
                      </td>
                      <td className="text-right">
                        {(r.estado === "RESERVADA" || r.estado === "CONFIRMADA") && (
                          <button
                            onClick={() => abrirModalReagendar(r)}
                            className="btn btn-ghost btn-sm text-blue-600 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all"
                          >
                            <Edit2 size={16} className="mr-2" />
                            Reagendar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE REAGENDAR */}
      {showReagendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="card card-padding w-full max-w-md animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Edit2 size={24} />
                </div>
                <div>
                  <h3 className="heading-3">Reagendar Turno</h3>
                  <p className="body-small text-gray-500">Cambio de cita para {reservaSeleccionada?.clienteNombre}</p>
                </div>
              </div>
              <button
                onClick={cerrarModalReagendar}
                className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="caption text-gray-500 font-bold uppercase tracking-wider">Servicio</p>
                  <p className="body font-bold text-gray-900">{reservaSeleccionada?.servicioId?.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="caption text-gray-500 font-bold uppercase tracking-wider">Actual</p>
                  <p className="body-small text-gray-700 font-medium">
                    {reservaSeleccionada?.fecha} · {reservaSeleccionada?.hora}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label">Nueva Fecha</label>
                  <input
                    type="date"
                    className="input"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    min={dayjs().format('YYYY-MM-DD')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">Nueva Hora</label>
                  <input
                    type="time"
                    className="input"
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={cerrarModalReagendar}
                  className="btn btn-ghost flex-1"
                >
                  Descartar
                </button>
                <button
                  onClick={confirmarReagendado}
                  className="btn btn-primary flex-1"
                >
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
