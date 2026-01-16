import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardAdmin, completarReserva, cancelarReserva } from "../../services/dashboardService";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Obtener datos del localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminId = localStorage.getItem("adminId");

  // 🔒 PROTECCIÓN: Verificar ROL y adminId
  useEffect(() => {
    console.log("🔍 Verificando acceso al dashboard admin...");
    console.log("Usuario:", user);
    console.log("Rol:", user.rol);
    console.log("AdminId en localStorage:", adminId);

    // Si NO es admin, redirigir
    if (user.rol !== "BARBERIA_ADMIN") {
      console.error("❌ Acceso denegado: Usuario no es admin");
      alert("Acceso denegado. No tienes permisos de administrador.");
      localStorage.clear(); // Limpiar todo
      navigate("/login");
      return;
    }

    // Si no hay adminId, redirigir
    if (!adminId) {
      console.error("❌ Acceso denegado: No hay adminId");
      alert("Sesión inválida. Por favor inicia sesión nuevamente.");
      localStorage.clear();
      navigate("/login");
      return;
    }

    // Si todo está bien, cargar dashboard
    console.log("✅ Acceso permitido al dashboard admin");
    fetchDashboard();
  }, []); // Solo ejecutar una vez al montar

  async function fetchDashboard() {
    try {
      const res = await getDashboardAdmin();
      setData(res);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      
      // Si el error es 403 (Forbidden), es problema de permisos
      if (error.response?.status === 403) {
        alert("No tienes permisos para acceder a este dashboard");
        localStorage.clear();
        navigate("/login");
        return;
      }
      
      setData({
        totalBarberos: 0,
        totalServicios: 0,
        turnosMes: 0,
        ultimasReservas: [],
        completadas: 0,
        canceladas: 0
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCompletar = async (id) => {
    try {
      await completarReserva(id);
      await fetchDashboard();
    } catch (error) {
      console.error("Error al completar reserva:", error);
      alert("Error al completar la reserva");
    }
  };

  const handleCancelar = async (id) => {
    try {
      await cancelarReserva(id);
      await fetchDashboard();
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      alert("Error al cancelar la reserva");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">⏳ Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Barberos */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg text-gray-400 mb-2">👨‍💼 Total Barberos</h3>
          <p className="text-5xl font-bold text-blue-400">
            {data.totalBarberos}
          </p>
        </div>

        {/* Servicios */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg text-gray-400 mb-2">✂️ Total Servicios</h3>
          <p className="text-5xl font-bold text-green-400">
            {data.totalServicios}
          </p>
        </div>

        {/* Turnos */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg text-gray-400 mb-2">📅 Turnos del Mes</h3>
          <p className="text-5xl font-bold text-purple-400">
            {data.turnosMes}
          </p>
        </div>
      </div>

      {/* Últimas Reservas */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4 text-gray-200">📅 Últimas Reservas</h3>
        
        {data.ultimasReservas.length === 0 ? (
          <p className="text-gray-400">No hay reservas recientes</p>
        ) : (
          <div className="space-y-3">
            {data.ultimasReservas.map((reserva) => (
              <div 
                key={reserva._id} 
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-semibold">
                    {reserva.clienteNombre}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {reserva.servicioId?.nombre} - {reserva.barberoId?.nombre}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {reserva.fecha} a las {reserva.hora}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-green-400 font-bold">
                    ${reserva.servicioId?.precio}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded uppercase ${
                    reserva.estado?.toLowerCase() === 'reservada' || reserva.estado?.toLowerCase() === 'confirmada' ? 'bg-yellow-600' : 
                    reserva.estado?.toLowerCase() === 'completada' ? 'bg-blue-600' :
                    reserva.estado?.toLowerCase() === 'cancelada' ? 'bg-red-600' :
                    'bg-gray-600'
                  }`}>
                    {reserva.estado}
                  </span>
                  {(reserva.estado?.toLowerCase() === 'reservada' || reserva.estado?.toLowerCase() === 'confirmada') && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => handleCompletar(reserva._id)}
                        className="text-xs text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition font-semibold"
                      >
                        ✓ Completar
                      </button>
                      <button 
                        onClick={() => handleCancelar(reserva._id)}
                        className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition font-semibold"
                      >
                        ✗ Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}