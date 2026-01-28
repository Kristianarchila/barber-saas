import { useEffect, useState } from "react";
import { getBarberias } from "../../services/superAdminService";
import { Card, Stat, Badge, Button, Skeleton } from "../../components/ui";
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, Calendar } from "lucide-react";

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [barberias, setBarberias] = useState([]);

  const [kpis, setKpis] = useState({
    mesActual: 0,
    mesAnterior: 0,
    crecimiento: 0,
    mrrActual: 0,
    mrrAnterior: 0,
    churn: 0,
    alertas: []
  });

  const PLAN_PRICES = {
    basico: 29990,
    premium: 49990,
    pro: 79990
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getBarberias({ limit: 1000 });
      const all = data.barberias || [];
      setBarberias(all);
      calcularKPIs(all);
    } catch (err) {
      console.error("Error cargando reportes", err);
    } finally {
      setLoading(false);
    }
  };

  const calcularKPIs = (data) => {
    const hoy = new Date();

    const keyMes = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const mesActualKey = keyMes(hoy);
    const mesAnteriorKey = keyMes(
      new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
    );

    let mesActual = 0;
    let mesAnterior = 0;
    let mrrActual = 0;
    let mrrAnterior = 0;
    let suspendidasMes = 0;

    data.forEach((b) => {
      if (!b.createdAt) return;
      const creado = new Date(b.createdAt);
      const key = keyMes(creado);

      if (key === mesActualKey) mesActual++;
      if (key === mesAnteriorKey) mesAnterior++;

      if (b.estado === "activa" && b.plan !== "trial") {
        const price = PLAN_PRICES[b.plan] || 0;
        if (key === mesActualKey) mrrActual += price;
        if (key === mesAnteriorKey) mrrAnterior += price;
      }

      if (b.estado === "suspendida" && key === mesActualKey) {
        suspendidasMes++;
      }
    });

    const crecimiento =
      mesAnterior === 0 ? (mesActual > 0 ? 100 : 0)
        : Math.round(((mesActual - mesAnterior) / mesAnterior) * 100);

    const churn =
      mesActual === 0 ? 0 : Math.round((suspendidasMes / mesActual) * 100);

    // Alertas de pago (≤ 7 días)
    const alertas = data.filter((b) => {
      if (!b.proximoPago || b.estado !== "activa") return false;
      const dias =
        (new Date(b.proximoPago) - hoy) / (1000 * 60 * 60 * 24);
      return dias <= 7;
    });

    setKpis({
      mesActual,
      mesAnterior,
      crecimiento,
      mrrActual,
      mrrAnterior,
      churn,
      alertas
    });
  };

  const money = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0
    }).format(n);

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

  const mrrCrecimiento = kpis.mrrAnterior > 0
    ? Math.round(((kpis.mrrActual - kpis.mrrAnterior) / kpis.mrrAnterior) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gradient-primary">
          📊 Reportes Globales
        </h1>
        <p className="text-neutral-400 text-lg">
          Análisis completo del sistema · {new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
          })}
        </p>
      </header>

      {/* HERO MRR */}
      <Card variant="gradient" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white bg-opacity-10 rounded-xl">
              <DollarSign className="text-white" size={28} />
            </div>
            <div>
              <p className="text-white opacity-80 text-sm font-medium uppercase tracking-wider">
                Monthly Recurring Revenue
              </p>
              <p className="text-white opacity-60 text-xs">Ingresos mensuales recurrentes</p>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <h2 className="text-6xl font-black text-white">
              {money(kpis.mrrActual)}
            </h2>
            <div className={`flex items-center gap-2 font-bold text-lg mb-2 ${mrrCrecimiento >= 0 ? 'text-success-400' : 'text-error-400'}`}>
              {mrrCrecimiento >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span>{mrrCrecimiento >= 0 ? '+' : ''}{mrrCrecimiento}%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white border-opacity-20 grid grid-cols-2 gap-4">
            <div>
              <p className="text-white opacity-60 text-xs">Mes anterior</p>
              <p className="text-white font-bold text-lg">{money(kpis.mrrAnterior)}</p>
            </div>
            <div>
              <p className="text-white opacity-60 text-xs">Proyección anual</p>
              <p className="text-white font-bold text-lg">{money(kpis.mrrActual * 12)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          title="Barberías Este Mes"
          value={kpis.mesActual}
          change={kpis.mesAnterior > 0 ? `${Math.round(((kpis.mesActual - kpis.mesAnterior) / kpis.mesAnterior) * 100)}%` : null}
          trend={kpis.mesActual >= kpis.mesAnterior ? 'up' : 'down'}
          icon="🏪"
          color="primary"
        />

        <Stat
          title="Mes Anterior"
          value={kpis.mesAnterior}
          icon="📅"
          color="secondary"
        />

        <Stat
          title="Crecimiento"
          value={`${kpis.crecimiento}%`}
          trend={kpis.crecimiento >= 0 ? 'up' : 'down'}
          icon="📈"
          color={kpis.crecimiento >= 0 ? 'success' : 'warning'}
        />

        <Stat
          title="Churn Rate"
          value={`${kpis.churn}%`}
          trend={kpis.churn <= 5 ? 'up' : 'down'}
          icon="⚠️"
          color="accent"
        />
      </div>

      {/* ALERTAS CRÍTICAS */}
      {kpis.alertas.length > 0 && (
        <Card className="border-warning-500 border-opacity-30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-warning-500 bg-opacity-20 rounded-xl">
              <AlertTriangle className="text-warning-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                ⚠️ Barberías en Riesgo
              </h3>
              <p className="text-neutral-400 text-sm">
                {kpis.alertas.length} barberías con pago próximo (≤ 7 días)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {kpis.alertas.map((b) => {
              const dias = Math.ceil(
                (new Date(b.proximoPago) - new Date()) /
                (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={b._id}
                  className="flex items-center justify-between p-4 bg-neutral-800 bg-opacity-50 rounded-xl border border-neutral-700 hover:border-warning-500 hover:border-opacity-50 transition-all"
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
                      <Badge variant={dias <= 3 ? "error" : "warning"}>
                        Vence en {dias} {dias === 1 ? 'día' : 'días'}
                      </Badge>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(b.proximoPago).toLocaleDateString('es-ES')}
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
              );
            })}
          </div>
        </Card>
      )}

      {/* DISTRIBUCIÓN POR ESTADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-success-500 bg-opacity-20 rounded-2xl">
              <Users className="text-success-500" size={32} />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Activas</p>
              <p className="text-4xl font-black text-white">
                {barberias.filter(b => b.estado === 'activa').length}
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-warning-500 bg-opacity-20 rounded-2xl">
              <Calendar className="text-warning-500" size={32} />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">En Trial</p>
              <p className="text-4xl font-black text-white">
                {barberias.filter(b => b.plan === 'trial').length}
              </p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-error-500 bg-opacity-20 rounded-2xl">
              <AlertTriangle className="text-error-500" size={32} />
            </div>
            <div>
              <p className="text-neutral-400 text-sm font-medium">Suspendidas</p>
              <p className="text-4xl font-black text-white">
                {barberias.filter(b => b.estado === 'suspendida').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* EMPTY STATE */}
      {kpis.alertas.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-success-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            ¡Todo en orden!
          </h3>
          <p className="text-neutral-400">
            No hay barberías en riesgo en este momento
          </p>
        </Card>
      )}
    </div>
  );
}
