import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  getAgendaBarbero,
  completarReserva,
  cancelarReserva
} from "../../services/barberoDashboardService";
import {
  Card,
  Stat,
  Button,
  Badge,
  Skeleton
} from "../../components/ui";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Briefcase
} from "lucide-react";

dayjs.locale("es");

export default function Agenda() {
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    cargarAgenda();
  }, [selectedDate]);

  const cargarAgenda = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAgendaBarbero(selectedDate);
      setAgenda(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando agenda:", err);
      setError(err.response?.data?.message || "Error al cargar la agenda");
    } finally {
      setLoading(false);
    }
  };

  const onCompletar = async (id) => {
    try {
      await completarReserva(id);
      await cargarAgenda();
    } catch (error) {
      console.error("❌ Error completando reserva:", error);
      alert(error.response?.data?.message || "Error al completar reserva");
    }
  };

  const onCancelar = async (id) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;
    try {
      await cancelarReserva(id);
      await cargarAgenda();
    } catch (error) {
      console.error("❌ Error cancelando reserva:", error);
      alert(error.response?.data?.message || "Error al cancelar reserva");
    }
  };

  const cambiarDia = (offset) => {
    setSelectedDate(dayjs(selectedDate).add(offset, 'day').format("YYYY-MM-DD"));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  const stats = {
    total: agenda.length,
    completadas: agenda.filter(r => r.estado === "COMPLETADA").length,
    ingresos: agenda.filter(r => r.estado === "COMPLETADA").reduce((acc, r) => acc + (r.servicioId?.precio || 0), 0)
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER & DATE SELECTOR */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <span className="text-indigo-500"><Calendar size={36} /></span>
            Mi Agenda
          </h1>
          <p className="text-slate-400 mt-2 text-lg capitalize">
            {dayjs(selectedDate).format("dddd, D [de] MMMM YYYY")}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-2 border border-slate-800 rounded-2xl shadow-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarDia(-1)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <ChevronLeft size={20} />
          </Button>

          <div className="relative group">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white px-4 py-2 font-black text-sm uppercase tracking-wider focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarDia(1)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <ChevronRight size={20} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setSelectedDate(dayjs().format("YYYY-MM-DD"))}
            className="ml-2 text-[10px] font-black uppercase tracking-widest px-4 py-2"
          >
            Hoy
          </Button>
        </div>
      </header>

      {/* DASHBOARD KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat
          title="Total Citas"
          value={stats.total}
          icon={<Briefcase />}
          color="primary"
          subtitle="Programadas para hoy"
        />
        <Stat
          title="Completadas"
          value={stats.completadas}
          icon={<CheckCircle />}
          color="success"
          trend="up"
          change={`${Math.round((stats.completadas / (stats.total || 1)) * 100)}% de progreso`}
        />
        <Stat
          title="Ingresos Estimados"
          value={formatCurrency(stats.ingresos)}
          icon={<DollarSign />}
          color="secondary"
          subtitle="Basado en completadas"
        />
      </div>

      {/* AGENDA LIST */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="h-32" />)
        ) : agenda.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-slate-800 bg-transparent">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-400">Todo despejado por aquí</h3>
            <p className="text-slate-500 mt-2">No tienes reservas registradas para esta fecha.</p>
          </Card>
        ) : (
          agenda.map((reserva) => (
            <Card
              key={reserva._id}
              className={`border-slate-800 hover:border-indigo-500/30 transition-all group ${reserva.estado !== 'RESERVADA' ? 'opacity-70' : ''}`}
            >
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 w-full">
                  {/* TIME SLOT */}
                  <div className="w-20 h-20 shrink-0 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-glow-sm">
                    <Clock size={16} className="mb-1 opacity-50" />
                    <span className="text-2xl font-black leading-none">{reserva.hora}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white leading-tight">
                        {reserva.servicioId?.nombre || "Servicio"}
                      </h3>
                      <Badge
                        variant={
                          reserva.estado === "COMPLETADA" ? "success" :
                            reserva.estado === "CANCELADA" ? "error" : "primary"
                        }
                        className="text-[10px] uppercase font-bold px-2 py-0.5"
                      >
                        {reserva.estado}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-indigo-400/70" /> {reserva.nombreCliente || "Cliente Anónimo"}
                      </span>
                      <span className="text-slate-800">•</span>
                      <span className="text-indigo-400 font-bold">
                        {formatCurrency(reserva.servicioId?.precio)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  {reserva.estado === "RESERVADA" && (
                    <>
                      <Button
                        onClick={() => onCompletar(reserva._id)}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl shadow-glow-success"
                      >
                        <CheckCircle size={18} className="mr-2" /> Completar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => onCancelar(reserva._id)}
                        className="flex-1 md:flex-none bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-none py-3 px-6 rounded-xl transition-all"
                      >
                        <XCircle size={18} />
                      </Button>
                    </>
                  )}
                  {reserva.estado === "COMPLETADA" && (
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest bg-emerald-500/10 px-6 py-3 rounded-xl border border-emerald-500/20">
                      <CheckCircle size={18} /> Cita Finalizada
                    </div>
                  )}
                  {reserva.estado === "CANCELADA" && (
                    <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20">
                      <XCircle size={18} /> Cancelada
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* FOOTER ADVICE */}
      <Card className="bg-slate-900/50 border-slate-800 p-6 flex items-start gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
          <TrendingUp size={24} />
        </div>
        <div>
          <h4 className="font-bold text-white mb-1">Dato del día</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Mantén tu agenda actualizada completando las citas a tiempo. Esto nos ayuda a generar tus estadísticas de ganancias de forma más precisa.
          </p>
        </div>
      </Card>
    </div>
  );
}
