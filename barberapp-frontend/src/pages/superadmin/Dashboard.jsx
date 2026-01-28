import { useEffect, useState } from "react";
import { getDashboardSuperAdmin } from "../../services/superAdminService";
import { Card, Stat, Badge, Button, Skeleton } from "../../components/ui";
import { TrendingUp, AlertCircle, Users, DollarSign, Calendar } from "lucide-react";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await getDashboardSuperAdmin();
      setData(res);
    } catch (error) {
      console.error("Error cargando dashboard SUPER ADMIN", error);
    } finally {
      setLoading(false);
    }
  }

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

  // Calcular cambios (mock - en producción vendría del backend)
  const cambios = {
    activas: "+5",
    trial: "+3",
    suspendidas: "-1",
    nuevas: "+8",
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gradient-primary">
          Dashboard Super Admin
        </h1>
        <p className="text-neutral-400 text-lg">
          Vista global del sistema · {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </header>

      {/* HERO METRIC - MRR */}
      <Card variant="gradient" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <DollarSign className="text-white" size={28} />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                Monthly Recurring Revenue
              </p>
              <p className="text-white/60 text-xs">Ingresos mensuales recurrentes</p>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <h2 className="text-6xl font-black text-white">
              $45,250
            </h2>
            <div className="flex items-center gap-2 text-success-400 font-bold text-lg mb-2">
              <TrendingUp size={20} />
              <span>+12.5%</span>
            </div>
          </div>

          <p className="text-white/60 text-sm mt-2">
            vs mes anterior · Proyección anual: $543,000
          </p>
        </div>
      </Card>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          title="Barberías Activas"
          value={data.activas}
          change={cambios.activas}
          trend="up"
          icon="🟢"
          color="success"
        />
        <Stat
          title="En Trial"
          value={data.trial}
          change={cambios.trial}
          trend="up"
          icon="⏳"
          color="warning"
        />
        <Stat
          title="Nuevas Este Mes"
          value={data.nuevasEsteMes}
          change={cambios.nuevas}
          trend="up"
          icon="🎉"
          color="secondary"
        />
        <Stat
          title="Suspendidas"
          value={data.suspendidas}
          change={cambios.suspendidas}
          trend="down"
          icon="🔴"
          color="primary"
        />
      </div>

      {/* ALERTAS CRÍTICAS */}
      {data.proximasVencer && data.proximasVencer.length > 0 && (
        <Card className="border-warning-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-warning-500/20 rounded-xl">
              <AlertCircle className="text-warning-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Alertas Críticas
              </h3>
              <p className="text-neutral-400 text-sm">
                {data.proximasVencer.length} barberías requieren atención
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {data.proximasVencer.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-700 hover:border-warning-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {b.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{b.nombre}</p>
                    <p className="text-sm text-neutral-400">{b.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={b.diasRestantes <= 3 ? "error" : "warning"}>
                      {b.diasRestantes} días restantes
                    </Badge>
                    <p className="text-xs text-neutral-500 mt-1">
                      Vence: {new Date(b.proximoPago).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Contactar
                    </Button>
                    <Button variant="primary" size="sm">
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary-500/20 rounded-2xl">
              <Users className="text-primary-500" size={32} />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Total Barberías</p>
              <p className="text-4xl font-black text-white">{data.totalBarberias}</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-success-500/20 rounded-2xl">
              <TrendingUp className="text-success-500" size={32} />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Tasa de Conversión</p>
              <p className="text-4xl font-black text-white">
                {data.trial > 0 ? Math.round((data.activas / (data.activas + data.trial)) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-secondary-500/20 rounded-2xl">
              <Calendar className="text-secondary-500" size={32} />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Churn Rate</p>
              <p className="text-4xl font-black text-white">2.1%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* EMPTY STATE */}
      {data.proximasVencer.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            ¡Todo en orden!
          </h3>
          <p className="text-neutral-400">
            No hay barberías próximas a vencer en este momento
          </p>
        </Card>
      )}
    </div>
  );
}
