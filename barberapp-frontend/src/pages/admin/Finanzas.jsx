import { useEffect, useState } from "react";
import StatCard from "../../components/cards/StatCard";
import { getFinanzasAdmin } from "../../services/finanzasService";

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

  if (loading) {
    return <p className="text-gray-400">⏳ Cargando finanzas...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">💰 Finanzas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Hoy"
          value={`$${data.ingresosHoy}`}
          icon="💵"
        />

        <StatCard
          title="Ingresos del Mes"
          value={`$${data.ingresosMes}`}
          icon="📅"
        />

        <StatCard
          title="Reservas Completadas"
          value={data.completadas}
          icon="✅"
        />

        <StatCard
          title="Reservas Canceladas"
          value={data.canceladas}
          icon="❌"
        />
      </div>
    </div>
  );
}
