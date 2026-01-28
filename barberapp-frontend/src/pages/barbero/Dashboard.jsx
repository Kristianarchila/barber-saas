import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  getAgendaBarbero,
  completarReserva,
  cancelarReserva,
  getEstadisticasBarbero,
} from "../../services/barberoDashboardService";
import { getMiBalance } from "../../services/transactionService";
import { Card, Stat, Button, Badge } from "../../components/ui";
import {
  Calendar,
  Users,
  Scissors,
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Play
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useBarberia } from "../../context/BarberiaContext";

dayjs.locale("es");

export default function Dashboard() {
  const { slug } = useParams();
  const { barberia } = useBarberia();
  const [reservas, setReservas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fecha = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [agendaData, statsData, balanceData] = await Promise.all([
        getAgendaBarbero(fecha),
        getEstadisticasBarbero(),
        getMiBalance().catch(() => null) // No bloqueante si falla
      ]);
      setReservas(Array.isArray(agendaData) ? agendaData : []);
      setEstadisticas(statsData);
      setBalance(balanceData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  const onCompletar = async (id) => {
    try {
      await completarReserva(id);
      await cargarDatos();
    } catch (err) {
      console.error("Error completando reserva:", err);
    }
  };

  const onCancelar = async (id) => {
    if (!confirm("¿Cancelar cita?")) return;
    try {
      await cancelarReserva(id);
      await cargarDatos();
    } catch (err) {
      console.error("Error cancelando reserva:", err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Preparando tu jornada...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
      <XCircle className="text-red-500 mx-auto mb-4" size={48} />
      <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
      <Button onClick={cargarDatos} variant="secondary">Reintentar</Button>
    </div>
  );

  return (
    <div className="space-y-10 animate-slide-in">
      {/* HEADER BIENVENIDA */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-2">¡Hola de nuevo!</Badge>
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-white">Buen día, Barbero</h1>
            {barberia && (
              <p className="text-indigo-400 font-bold flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                {barberia.nombre}
              </p>
            )}
          </div>
          <p className="text-slate-500 capitalize mt-2 font-medium">{dayjs().format("dddd DD [de] MMMM")}</p>
        </div>

        {/* Quick Wallet Summary */}
        <Link to={`/${slug}/barbero/finanzas`}>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-500/50 transition-all group">
            <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all">
              <Wallet className="text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Mi Balance</p>
              <p className="text-white font-black text-lg">{formatCurrency(balance?.pendiente?.totalMontoBarbero)}</p>
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-indigo-400 transition-all ml-4" size={20} />
          </div>
        </Link>
      </header>

      {/* SECCIÓN DE MÉTRICAS */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat
            title="Citas Hoy"
            value={estadisticas.citas.hoy}
            icon={<Calendar />}
            color="primary"
            subtitle="Servicios programados"
          />
          <Stat
            title="Citas Mes"
            value={estadisticas.citas.mes}
            icon={<Users />}
            color="secondary"
            subtitle={`${estadisticas.clientesUnicosMes} clientes únicos`}
          />
          <Stat
            title="Ganancias Mes"
            value={formatCurrency(balance?.total?.totalMontoBarbero || estadisticas.ingresos.mes)}
            icon={<DollarSign />}
            color="success"
            trend="up"
            change={`${estadisticas.tasaCancelacion}% cancelación`}
          />
          <Stat
            title="Histórico"
            value={estadisticas.citas.total}
            icon={<TrendingUp />}
            color="accent"
            subtitle="Total de cortes realizados"
          />
        </div>
      )}

      {/* SECCIÓN PRINCIPAL: AGENDA */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Clock className="text-indigo-400" size={24} />
              Agenda de Hoy
            </h2>
            <Badge variant="outline" className="border-slate-800 text-slate-500">
              {reservas.length} Citas
            </Badge>
          </div>

          {reservas.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-slate-800 bg-transparent">
              <Calendar className="text-slate-700 mx-auto mb-4" size={48} />
              <p className="text-slate-500 text-lg font-bold">Sin actividad programada hoy</p>
              <p className="text-slate-600 text-sm mt-1">Sigue trabajando así de bien 💪</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservas.map((r) => (
                <Card
                  key={r._id}
                  className={`border-slate-800 hover:border-slate-700 transition-all group ${r.estado === 'COMPLETADA' ? 'opacity-80' : ''}`}
                >
                  <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5 w-full">
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                        <span className="text-lg font-black leading-none">{r.hora.split(':')[0]}</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{r.hora.split(':')[1]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-white text-lg">{r.servicioId?.nombre}</p>
                          <Badge variant={r.estado === 'COMPLETADA' ? 'success' : 'primary'} className="text-[10px]">
                            {r.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-sm mt-1 font-medium">
                          <span className="flex items-center gap-1"><Users size={14} /> {r.nombreCliente}</span>
                          <span className="text-slate-700">•</span>
                          <span className="flex items-center gap-1"><DollarSign size={14} /> {formatCurrency(r.servicioId?.precio)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      {r.estado === "RESERVADA" && (
                        <>
                          <Button
                            onClick={() => onCompletar(r._id)}
                            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-xs font-black uppercase tracking-wider py-3 px-6 rounded-xl shadow-glow-success"
                          >
                            <CheckCircle size={16} className="mr-2" /> Completar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => onCancelar(r._id)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex-1 md:flex-none text-xs font-black uppercase tracking-wider py-3 px-6 rounded-xl border-none transition-all"
                          >
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}
                      {r.estado === "COMPLETADA" && (
                        <div className="flex items-center gap-2 text-emerald-500 font-black text-sm uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl">
                          <CheckCircle size={18} /> Registrado
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR DASHBOARD */}
        <div className="space-y-6">
          <Card className="bg-indigo-600 shadow-glow-primary border-none p-6 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-black text-xl mb-1">Mi Perfil Público</h3>
              <p className="text-indigo-100 text-xs mb-6">Link para compartir con tus clientes</p>
              <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl">
                Copiar Enlace
              </Button>
            </div>
            <Scissors className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <div className="p-5 border-b border-slate-800">
              <h4 className="font-black text-sm uppercase tracking-widest text-slate-500">🏆 Servicios Estrella</h4>
            </div>
            <div className="p-5 space-y-4">
              {estadisticas?.serviciosPopulares.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-500 font-black">{idx + 1}.</span>
                    <span className="text-white text-sm font-bold">{s.nombre}</span>
                  </div>
                  <Badge variant="outline" className="text-slate-500 border-slate-800 text-[10px]">
                    {s.cantidad} veces
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
