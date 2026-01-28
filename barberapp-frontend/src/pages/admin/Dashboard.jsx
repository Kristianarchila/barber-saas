import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { getDashboardAdmin, completarReserva, cancelarReserva } from "../../services/dashboardService";
import { Card, Stat, Badge, Button, Skeleton } from "../../components/ui";
import { DollarSign, Calendar, Users, TrendingUp, CheckCircle, XCircle, Clock, Plus } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const hoyStr = new Date().toISOString().split("T")[0];
  const [fechaInicio, setFechaInicio] = useState(hoyStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);

  const navigate = useNavigate();
  const { slug } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.rol !== "BARBERIA_ADMIN") {
      navigate("/login");
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin]);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await getDashboardAdmin({ fechaInicio, fechaFin });
      setData(res);
    } catch (error) {
      console.error("Error al sincronizar el dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id, actionFn) => {
    if (!window.confirm("¿Deseas actualizar el estado de esta cita?")) return;
    try {
      await actionFn(id);
      fetchDashboard();
    } catch {
      alert("Error operativo al actualizar");
    }
  };

  const formatearMoneda = (valor) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0
    }).format(valor || 0);

  if (loading && !data) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <Skeleton variant="rectangular" width="w-64" height="h-10" />
          <Skeleton variant="rectangular" width="w-96" height="h-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const rangoInicio = data?.rango?.inicio;
  const rangoFin = data?.rango?.fin;
  const reservas = data?.ultimasReservas ?? [];

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

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gradient-primary">
            Panel de Control
          </h1>
          <p className="text-neutral-400 text-lg mt-1">
            {rangoInicio && rangoFin
              ? `Mostrando datos del ${rangoInicio} al ${rangoFin}`
              : "Gestión operativa diaria"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Date Range Picker */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <label className="text-xs uppercase font-bold text-neutral-500 mb-1">Desde</label>
                <input
                  type="date"
                  className="bg-neutral-800 text-sm text-primary-400 outline-none font-semibold px-3 py-2 rounded-lg border border-neutral-700 focus:border-primary-500 transition-all"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>

              <div className="w-px h-12 bg-neutral-700" />

              <div className="flex flex-col">
                <label className="text-xs uppercase font-bold text-neutral-500 mb-1">Hasta</label>
                <input
                  type="date"
                  className="bg-neutral-800 text-sm text-primary-400 outline-none font-semibold px-3 py-2 rounded-lg border border-neutral-700 focus:border-primary-500 transition-all"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link to={`/${slug}/admin/barberos`}>
              <Button variant="ghost" size="sm">
                <Users size={16} />
                Personal
              </Button>
            </Link>
            <Link to={`/${slug}/admin/finanzas`}>
              <Button variant="ghost" size="sm">
                <TrendingUp size={16} />
                Finanzas
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          title="Ingresos Periodo"
          value={formatearMoneda(data?.ingresosPeriodo)}
          icon="💰"
          color="primary"
        />

        <Stat
          title="Citas Hoy"
          value={data?.turnosHoy ?? 0}
          icon="⚡"
          color="success"
        />

        <Stat
          title="Total en Rango"
          value={data?.turnosRango ?? 0}
          icon="📅"
          color="secondary"
        />

        <Stat
          title="Barberos Activos"
          value={data?.totalBarberos ?? 0}
          icon="👨‍💼"
          color="accent"
        />
      </div>

      {/* AGENDA TABLE */}
      <Card>
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-500 bg-opacity-20 rounded-xl">
              <Calendar className="text-primary-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Agenda del Periodo
              </h3>
              <p className="text-neutral-400 text-sm">
                {reservas.length} {reservas.length === 1 ? 'cita' : 'citas'} registradas
              </p>
            </div>
          </div>

          <Link to={`/${slug}/admin/reservas`}>
            <Button variant="primary" size="sm">
              <Plus size={16} />
              Nueva Cita
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          {reservas.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-neutral-800 bg-opacity-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-neutral-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No hay citas registradas
              </h3>
              <p className="text-neutral-400">
                No hay registros para las fechas seleccionadas
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Fecha/Hora</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Cliente</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Barbero</th>
                  <th className="text-left p-4 text-xs font-bold text-neutral-500 uppercase">Estado</th>
                  <th className="text-right p-4 text-xs font-bold text-neutral-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => {
                  const estadoBadge = getEstadoBadge(reserva.estado);
                  return (
                    <tr key={reserva._id} className="border-b border-neutral-800 hover:bg-neutral-800 hover:bg-opacity-30 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-neutral-500" />
                          <div>
                            <p className="font-semibold text-white">{reserva.fecha}</p>
                            <p className="text-sm text-neutral-400">{reserva.hora}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-white">{reserva.clienteNombre}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-neutral-300">{reserva.barberoId?.nombre || "Sin asignar"}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant={estadoBadge.variant} size="sm">
                          {estadoBadge.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {["RESERVADA", "CONFIRMADA"].includes(reserva.estado) && (
                            <>
                              <button
                                onClick={() => handleAction(reserva._id, completarReserva)}
                                className="p-2 bg-success-500 bg-opacity-20 text-success-500 rounded-lg hover:bg-opacity-30 transition-all"
                                title="Completar"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleAction(reserva._id, cancelarReserva)}
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
          )}
        </div>
      </Card>

      {/* FAB - Floating Action Button */}
      <Link
        to={`/${slug}/admin/reservas`}
        className="fixed bottom-8 right-8 w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-glow-primary hover:scale-110 transition-all z-50"
      >
        <Plus className="text-white" size={24} />
      </Link>
    </div>
  );
}
