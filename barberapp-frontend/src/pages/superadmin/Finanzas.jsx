import { useEffect, useState } from "react";
import { getBarberias } from "../../services/superAdminService";

export default function Finanzas() {
  const [barberias, setBarberias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalMRR: 0,
    byPlan: {
      basico: { count: 0, mrr: 0 },
      premium: { count: 0, mrr: 0 },
      pro: { count: 0, mrr: 0 }
    },
    proximosPagos: []
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
      const data = await getBarberias({ limit: 1000 }); // Get all
      const allBarberias = data.barberias || [];
      setBarberias(allBarberias);

      // Calculate metrics
      calculateMetrics(allBarberias);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (barberias) => {
    let totalMRR = 0;
    const byPlan = {
      basico: { count: 0, mrr: 0 },
      premium: { count: 0, mrr: 0 },
      pro: { count: 0, mrr: 0 }
    };

    // Only count active barberías for MRR
    barberias.forEach((b) => {
      if (b.estado === "activa" && b.plan !== "trial") {
        const price = PLAN_PRICES[b.plan] || 0;
        totalMRR += price;
        if (byPlan[b.plan]) {
          byPlan[b.plan].count++;
          byPlan[b.plan].mrr += price;
        }
      }
    });

    // Get próximos pagos (next 30 days)
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(en30Dias.getDate() + 30);

    const proximosPagos = barberias
      .filter((b) => {
        if (!b.proximoPago) return false;
        const fecha = new Date(b.proximoPago);
        return fecha >= hoy && fecha <= en30Dias;
      })
      .sort((a, b) => new Date(a.proximoPago) - new Date(b.proximoPago))
      .slice(0, 10);

    setMetrics({
      totalMRR,
      byPlan,
      proximosPagos
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP"
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando datos financieros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Finanzas</h1>

      {/* MRR Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
          <div className="text-sm text-green-400 mb-2">💰 MRR Total</div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(metrics.totalMRR)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Monthly Recurring Revenue</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-sm text-blue-400 mb-2">📦 Plan Básico</div>
          <div className="text-2xl font-bold text-white">{metrics.byPlan.basico.count}</div>
          <div className="text-xs text-gray-400 mt-1">
            {formatCurrency(metrics.byPlan.basico.mrr)}/mes
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-sm text-purple-400 mb-2">⭐ Plan Premium</div>
          <div className="text-2xl font-bold text-white">{metrics.byPlan.premium.count}</div>
          <div className="text-xs text-gray-400 mt-1">
            {formatCurrency(metrics.byPlan.premium.mrr)}/mes
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="text-sm text-yellow-400 mb-2">🚀 Plan Pro</div>
          <div className="text-2xl font-bold text-white">{metrics.byPlan.pro.count}</div>
          <div className="text-xs text-gray-400 mt-1">
            {formatCurrency(metrics.byPlan.pro.mrr)}/mes
          </div>
        </div>
      </div>

      {/* Próximos Pagos */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">📅 Próximos Pagos (30 días)</h2>
        {metrics.proximosPagos.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay pagos programados en los próximos 30 días
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    Barbería
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    Plan
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    Fecha de Pago
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                    Días Restantes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {metrics.proximosPagos.map((barberia) => {
                  const diasRestantes = Math.ceil(
                    (new Date(barberia.proximoPago) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={barberia._id} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-white">{barberia.nombre}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-300 capitalize">{barberia.plan}</span>
                      </td>
                      <td className="px-4 py-3 text-green-400 font-semibold">
                        {formatCurrency(PLAN_PRICES[barberia.plan] || 0)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(barberia.proximoPago).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${diasRestantes <= 7
                              ? "text-red-400"
                              : diasRestantes <= 14
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                        >
                          {diasRestantes} días
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estado de Barberías */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">📊 Por Estado</h3>
          <div className="space-y-2">
            <StatusRow
              label="Activas"
              count={barberias.filter((b) => b.estado === "activa").length}
              color="text-green-400"
            />
            <StatusRow
              label="En Trial"
              count={barberias.filter((b) => b.estado === "trial").length}
              color="text-yellow-400"
            />
            <StatusRow
              label="Suspendidas"
              count={barberias.filter((b) => b.estado === "suspendida").length}
              color="text-red-400"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">📦 Por Plan</h3>
          <div className="space-y-2">
            <StatusRow
              label="Trial"
              count={barberias.filter((b) => b.plan === "trial").length}
              color="text-gray-400"
            />
            <StatusRow
              label="Básico"
              count={barberias.filter((b) => b.plan === "basico").length}
              color="text-blue-400"
            />
            <StatusRow
              label="Premium"
              count={barberias.filter((b) => b.plan === "premium").length}
              color="text-purple-400"
            />
            <StatusRow
              label="Pro"
              count={barberias.filter((b) => b.plan === "pro").length}
              color="text-yellow-400"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 Resumen</h3>
          <div className="space-y-2">
            <StatusRow
              label="Total Barberías"
              count={barberias.length}
              color="text-white"
            />
            <StatusRow
              label="Generando Ingresos"
              count={barberias.filter((b) => b.estado === "activa" && b.plan !== "trial").length}
              color="text-green-400"
            />
            <StatusRow
              label="Tasa de Conversión"
              count={
                barberias.length > 0
                  ? `${Math.round(
                    (barberias.filter((b) => b.estado === "activa" && b.plan !== "trial")
                      .length /
                      barberias.length) *
                    100
                  )}%`
                  : "0%"
              }
              color="text-blue-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, count, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold ${color}`}>{count}</span>
    </div>
  );
}