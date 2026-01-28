import { useEffect, useState } from "react";
import { getHistorialReservas } from "../../services/reservasService";
import { Card, Badge, Button, Skeleton, Avatar } from "../../components/ui";
import { FolderOpen, Calendar, Clock, Filter, Download, Search, X, Edit2, Save } from "lucide-react";
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
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gradient-primary">
          📂 Historial de Reservas
        </h1>
        <p className="text-neutral-400 text-lg">
          Consulta y filtra todas las reservas históricas
        </p>
      </header>

      {/* FILTROS */}
      <Card variant="glass">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-primary-500" />
              <h3 className="text-lg font-bold text-white">Filtros</h3>
            </div>
            {(fecha || estado || searchTerm) && (
              <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
                <X size={16} />
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                <Search size={16} className="text-primary-500" />
                Buscar
              </label>
              <input
                type="text"
                placeholder="Cliente, servicio, barbero..."
                className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                <Calendar size={16} className="text-primary-500" />
                Fecha
              </label>
              <input
                type="date"
                className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                <Filter size={16} className="text-primary-500" />
                Estado
              </label>
              <select
                className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="RESERVADA">Reservada</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="NO_ASISTIO">No asistió</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

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
      <Card>
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl">
              <FolderOpen className="text-primary-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Registro de Reservas
              </h3>
              <p className="text-neutral-400 text-sm">
                {reservasFiltradas.length} {reservasFiltradas.length === 1 ? 'reserva' : 'reservas'}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <Download size={16} />
            Exportar
          </Button>
        </div>

        {loading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} variant="rectangular" height="h-16" />
            ))}
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-neutral-800 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="text-neutral-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No hay reservas
            </h3>
            <p className="text-neutral-400">
              {fecha || estado || searchTerm
                ? "No se encontraron reservas con los filtros aplicados"
                : "No hay reservas en el historial"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Fecha/Hora</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Cliente</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Barbero</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Servicio</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Precio</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Estado</th>
                  <th className="text-right p-4 text-xs font-bold text-neutral-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((r) => {
                  const estadoBadge = getEstadoBadge(r.estado);
                  return (
                    <tr
                      key={r._id}
                      className="border-b border-neutral-800 hover:bg-neutral-800 hover:bg-opacity-30 transition-all"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-neutral-500" />
                          <div>
                            <p className="text-white font-semibold">{r.fecha}</p>
                            <p className="text-neutral-400 text-sm flex items-center gap-1">
                              <Clock size={12} />
                              {r.hora}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.clienteNombre || "Cliente"} size="sm" />
                          <span className="text-white font-medium">{r.clienteNombre || "—"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-neutral-300">{r.barberoId?.nombre || "—"}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{r.servicioId?.nombre || "—"}</p>
                          {r.servicioId?.duracion && (
                            <p className="text-neutral-400 text-sm">
                              {r.servicioId.duracion} min
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-semibold">
                          {formatCurrency(r.precioTotal)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={estadoBadge.variant} size="sm">
                          {estadoBadge.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {(r.estado === "RESERVADA" || r.estado === "CONFIRMADA") && (
                            <button
                              onClick={() => abrirModalReagendar(r)}
                              className="p-2 bg-primary-500 bg-opacity-20 text-primary-500 rounded-lg hover:bg-opacity-30 transition-all"
                              title="Reagendar"
                            >
                              <Edit2 size={16} />
                            </button>
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

      {/* MODAL DE REAGENDAR */}
      {showReagendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl">
                    <Edit2 className="text-primary-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Reagendar Reserva</h3>
                    <p className="text-neutral-400 text-sm">Selecciona nueva fecha y hora</p>
                  </div>
                </div>
                <button
                  onClick={cerrarModalReagendar}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-all"
                >
                  <X size={20} className="text-neutral-400" />
                </button>
              </div>

              {/* Información de la reserva */}
              <div className="p-4 bg-neutral-800 bg-opacity-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar name={reservaSeleccionada?.clienteNombre} size="sm" />
                  <div>
                    <p className="text-white font-semibold">{reservaSeleccionada?.clienteNombre}</p>
                    <p className="text-neutral-400 text-sm">{reservaSeleccionada?.servicioId?.nombre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Calendar size={14} />
                  <span>Actual: {reservaSeleccionada?.fecha} a las {reservaSeleccionada?.hora}</span>
                </div>
              </div>

              {/* Selección de nueva fecha y hora */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Calendar size={16} className="text-primary-500" />
                    Nueva Fecha
                  </label>
                  <input
                    type="date"
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    min={dayjs().format('YYYY-MM-DD')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-2">
                    <Clock size={16} className="text-primary-500" />
                    Nueva Hora
                  </label>
                  <input
                    type="time"
                    className="w-full bg-neutral-800 text-white p-3 rounded-xl border border-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all outline-none"
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={cerrarModalReagendar}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={confirmarReagendado}
                >
                  <Save size={16} />
                  Confirmar Cambio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
