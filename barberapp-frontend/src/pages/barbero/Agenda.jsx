import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { 
  getAgendaBarbero,
  completarReserva,
  cancelarReserva 
} from "../../services/barberoDashboardService";

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
      setAgenda(data);
    } catch (err) {
      console.error("Error cargando agenda:", err);
      setError(err.response?.data?.message || "Error al cargar la agenda");
    } finally {
      setLoading(false);
    }
  };

  const onCompletar = async (id) => {
    try {
      console.log("🔄 Completando reserva:", id);
      await completarReserva(id);
      console.log("✅ Reserva completada");
      await cargarAgenda(); // Recargar después de completar
    } catch (error) {
      console.error("❌ Error completando reserva:", error);
      alert(error.response?.data?.message || "Error al completar reserva");
    }
  };

  const onCancelar = async (id) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;
    
    try {
      console.log("🔄 Cancelando reserva:", id);
      await cancelarReserva(id);
      console.log("✅ Reserva cancelada");
      await cargarAgenda(); // Recargar después de cancelar
    } catch (error) {
      console.error("❌ Error cancelando reserva:", error);
      alert(error.response?.data?.message || "Error al cancelar reserva");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 mt-4">⏳ Cargando agenda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded">
        <h2 className="text-xl font-bold mb-2">❌ Error</h2>
        <p>{error}</p>
        <button 
          onClick={cargarAgenda}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📅 Mi Agenda</h1>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {agenda.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded">
          <p className="text-gray-400 text-lg">
            📅 No tienes reservas para {dayjs(selectedDate).format("DD/MM/YYYY")}
          </p>
        </div>
      ) : (
        <>
          {/* Lista de citas */}
          <div className="space-y-3">
            {agenda.map((reserva) => (
              <div
                key={reserva._id}
                className="bg-gray-800 p-4 rounded flex justify-between items-center hover:bg-gray-700 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">
                    {reserva.servicioId?.nombre || "Servicio"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    👤 Cliente: {reserva.nombreCliente || "Sin nombre"}
                  </p>
                  <p className="text-sm text-gray-400">
                    🕐 Hora: {reserva.hora}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-3 py-1 rounded font-semibold ${
                      reserva.estado === "COMPLETADA" 
                        ? "bg-green-600 text-white" 
                        : reserva.estado === "CANCELADA" 
                        ? "bg-red-600 text-white" 
                        : "bg-yellow-600 text-white"
                    }`}>
                      {reserva.estado === "COMPLETADA" ? "✓ COMPLETADA" :
                       reserva.estado === "CANCELADA" ? "✗ CANCELADA" :
                       "⏳ RESERVADA"}
                    </span>
                    <p className="text-lg font-bold text-blue-400">
                      ${reserva.servicioId?.precio || 0}
                    </p>
                  </div>
                </div>

                {/* Botones de acción - Solo si está RESERVADA */}
                {reserva.estado === "RESERVADA" && (
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => onCompletar(reserva._id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold transition whitespace-nowrap"
                    >
                      ✓ Completar
                    </button>
                    <button
                      onClick={() => onCancelar(reserva._id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition whitespace-nowrap"
                    >
                      ✗ Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen del día */}
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-semibold mb-2">📊 Resumen del día</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Total citas</p>
                <p className="text-2xl font-bold">{agenda.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completadas</p>
                <p className="text-2xl font-bold text-green-400">
                  {agenda.filter(r => r.estado === "COMPLETADA").length}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ingresos</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${agenda
                    .filter(r => r.estado === "COMPLETADA")
                    .reduce((acc, r) => acc + (r.servicioId?.precio || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}