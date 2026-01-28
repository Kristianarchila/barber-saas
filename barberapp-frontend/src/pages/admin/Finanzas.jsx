import { useEffect, useState } from "react";
import { getFinanzasAdmin } from "../../services/finanzasService";
import { Card, Stat, Skeleton } from "../../components/ui";
import { DollarSign, TrendingUp, CheckCircle, XCircle, Calendar, Target } from "lucide-react";

export default function FinanzasAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinanzas() {
      try {
        const res = await getFinanzasAdmin();
        setData(res);
      } catch (error) {
        console.error("Error cargando finanzas:", error);
        setData({
          ingresosHoy: 0,
          ingresosMes: 0,
          completadas: 0,
          canceladas: 0
        });
      } finally {
        setLoading(false);
      }
    }

    fetchFinanzas();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
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

  // Calcular métricas adicionales
  const tasaCompletadas = data.completadas + data.canceladas > 0
    ? Math.round((data.completadas / (data.completadas + data.canceladas)) * 100)
    : 0;

  const promedioIngresoPorCita = data.completadas > 0
    ? Math.round(data.ingresosMes / data.completadas)
    : 0;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gradient-primary">
          💰 Finanzas
        </h1>
        <p className="text-neutral-400 text-lg">
          Resumen financiero de tu barbería · {new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
          })}
        </p>
      </header>

      {/* HERO METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos del Mes */}
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500 opacity-10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white bg-opacity-10 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white opacity-80 text-sm font-medium uppercase tracking-wider">
                  Ingresos del Mes
                </p>
                <p className="text-white opacity-60 text-xs">Total acumulado</p>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <h2 className="text-5xl font-black text-white">
                {formatCurrency(data.ingresosMes)}
              </h2>
            </div>

            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white opacity-70">Promedio por cita:</span>
                <span className="text-white font-bold">{formatCurrency(promedioIngresoPorCita)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Ingresos Hoy */}
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary-500 opacity-10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white bg-opacity-10 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white opacity-80 text-sm font-medium uppercase tracking-wider">
                  Ingresos de Hoy
                </p>
                <p className="text-white opacity-60 text-xs">Actualizado en tiempo real</p>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <h2 className="text-5xl font-black text-white">
                {formatCurrency(data.ingresosHoy)}
              </h2>
            </div>

            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white opacity-70">% del mes:</span>
                <span className="text-white font-bold">
                  {data.ingresosMes > 0 ? Math.round((data.ingresosHoy / data.ingresosMes) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          title="Citas Completadas"
          value={data.completadas}
          icon="✅"
          color="success"
        />

        <Stat
          title="Citas Canceladas"
          value={data.canceladas}
          icon="❌"
          color="primary"
        />

        <Stat
          title="Tasa de Éxito"
          value={`${tasaCompletadas}%`}
          icon="🎯"
          color="secondary"
        />

        <Stat
          title="Ticket Promedio"
          value={formatCurrency(promedioIngresoPorCita)}
          icon="💵"
          color="accent"
        />
      </div>

      {/* DETALLES ADICIONALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de Citas */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-success-500 bg-opacity-20 rounded-xl">
              <CheckCircle className="text-success-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Resumen de Citas
              </h3>
              <p className="text-neutral-400 text-sm">
                Estado de las reservas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-800 bg-opacity-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-success rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white">Completadas</p>
                  <p className="text-sm text-neutral-400">Servicios finalizados</p>
                </div>
              </div>
              <span className="text-3xl font-black text-white">{data.completadas}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-800 bg-opacity-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-error-500 bg-opacity-20 rounded-full flex items-center justify-center border-2 border-error-500">
                  <XCircle className="text-error-500" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white">Canceladas</p>
                  <p className="text-sm text-neutral-400">No realizadas</p>
                </div>
              </div>
              <span className="text-3xl font-black text-white">{data.canceladas}</span>
            </div>
          </div>
        </Card>

        {/* Objetivos */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-accent-500 bg-opacity-20 rounded-xl">
              <Target className="text-accent-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Objetivos del Mes
              </h3>
              <p className="text-neutral-400 text-sm">
                Progreso hacia metas
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Objetivo de Ingresos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-300">Meta de Ingresos</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(data.ingresosMes)} / {formatCurrency(5000000)}
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                <div
                  className="gradient-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((data.ingresosMes / 5000000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {Math.round((data.ingresosMes / 5000000) * 100)}% completado
              </p>
            </div>

            {/* Objetivo de Citas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-300">Meta de Citas</span>
                <span className="text-sm font-bold text-white">
                  {data.completadas} / 200
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                <div
                  className="gradient-success h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((data.completadas / 200) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {Math.round((data.completadas / 200) * 100)}% completado
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
