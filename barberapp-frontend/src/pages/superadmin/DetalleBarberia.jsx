import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBarberia,
  cambiarEstadoBarberia,
  extenderPlazoBarberia,
  getHistorialBarberia
} from "../../services/superAdminService";

export default function DetalleBarberia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [barberia, setBarberia] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarBarberia = async () => {
    try {
      const data = await getBarberia(id);
      setBarberia(data);
    } catch (error) {
      console.error("Error cargando barbería", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBarberia();
  }, [id]);

  const cambiarEstado = async (estado) => {
    if (!confirm(`¿Cambiar estado a ${estado}?`)) return;
    await cambiarEstadoBarberia(id, estado);
    cargarBarberia();
  };

  const extender = async (dias) => {
    await extenderPlazoBarberia(id, dias, `Extensión manual ${dias} días`);
    cargarBarberia();
  };

  const verHistorial = async () => {
    const data = await getHistorialBarberia(id);
    setHistorial(data);
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!barberia) return <p className="p-6">No encontrada</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{barberia.nombre}</h1>
        <button
          onClick={() => navigate("/superadmin/dashboard/barberias")}
          className="text-gray-400 hover:text-white"
        >
          ← Volver
        </button>
      </div>

      {/* Datos generales */}
      <div className="bg-gray-800 rounded p-4 grid grid-cols-2 gap-4">
        <div><b>Slug:</b> {barberia.slug}</div>
        <div><b>Estado:</b> {barberia.estado}</div>
        <div><b>Email:</b> {barberia.email}</div>
        <div>
          <b>Próximo pago:</b>{" "}
          {barberia.proximoPago
            ? new Date(barberia.proximoPago).toLocaleDateString()
            : "—"}
        </div>
      </div>

      {/* Admin */}
      <div className="bg-gray-800 rounded p-4">
        <h2 className="font-bold mb-2">Administrador</h2>
        {barberia.admin ? (
          <p>
            {barberia.admin.nombre} – {barberia.admin.email}
          </p>
        ) : (
          <p className="text-gray-400">Sin admin asignado</p>
        )}
      </div>

      {/* Multi-Sede */}
      <div className="bg-gray-800 rounded p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">Multi-Sede</h2>
          {barberia.esMatriz && (
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
              Activo
            </span>
          )}
        </div>
        <p className="text-gray-400 mb-3">
          {barberia.esMatriz
            ? `${barberia.sucursales?.length || 0} sucursal(es) configurada(s)`
            : "Modo multi-sede desactivado"}
        </p>
        <button
          onClick={() => navigate(`/superadmin/dashboard/barberias/${id}/sucursales`)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition-all"
        >
          Gestionar Sucursales
        </button>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 flex-wrap">
        {barberia.estado !== "activa" && (
          <button
            onClick={() => cambiarEstado("activa")}
            className="bg-green-600 px-3 py-1 rounded"
          >
            Activar
          </button>
        )}
        {barberia.estado !== "suspendida" && (
          <button
            onClick={() => cambiarEstado("suspendida")}
            className="bg-red-600 px-3 py-1 rounded"
          >
            Suspender
          </button>
        )}
        <button
          onClick={() => extender(30)}
          className="bg-blue-600 px-3 py-1 rounded"
        >
          +30 días
        </button>
        <button
          onClick={verHistorial}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          Historial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded">
          <b>Barberos</b>
          <div className="text-xl">{barberia.stats.totalBarberos}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <b>Reservas</b>
          <div className="text-xl">{barberia.stats.totalReservas}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <b>Completadas</b>
          <div className="text-xl">{barberia.stats.reservasCompletadas}</div>
        </div>
      </div>

      {/* Modal Historial */}
      {historial && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded w-full max-w-lg">
            <h2 className="font-bold mb-4">Historial</h2>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {historial.historial.map((h, i) => (
                <li key={i} className="border-b border-gray-700 pb-2">
                  <div className="font-semibold">{h.accion}</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(h.fecha).toLocaleString()} – {h.notas}
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 bg-red-600 px-4 py-2 rounded"
              onClick={() => setHistorial(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
