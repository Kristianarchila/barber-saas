import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  getAgendaBarbero,
  completarReserva,
  cancelarReserva,
} from "../../services/barberoDashboardService";

dayjs.locale("es");

export default function Dashboard() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fecha = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📡 Cargando agenda para fecha:", fecha);
      
      const data = await getAgendaBarbero(fecha);
      
      console.log("✅ Reservas cargadas:", data);
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error cargando reservas:", error);
      setError(error.response?.data?.message || error.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Cálculos del día
  const total = reservas.length;
  const completadas = reservas.filter(r => r.estado === "COMPLETADA").length;
  const canceladas = reservas.filter(r => r.estado === "CANCELADA").length;
  const pendientes = reservas.filter(r => r.estado === "RESERVADA").length;
  const ingresos = reservas
    .filter(r => r.estado === "COMPLETADA")
    .reduce((acc, r) => {
      const precio = r.servicioId?.precio || r.precio || 0;
      return acc + precio;
    }, 0);

  const onCompletar = async (id) => {
    try {
      console.log("🔄 Completando reserva:", id);
      await completarReserva(id);
      console.log("✅ Reserva completada");
      await cargarReservas();
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
      await cargarReservas();
    } catch (error) {
      console.error("❌ Error cancelando reserva:", error);
      alert(error.response?.data?.message || "Error al cancelar reserva");
    }
  };

  // Filtrar solo reservas pendientes para la lista principal
  const reservasPendientes = reservas.filter(r => r.estado === "RESERVADA");
  const reservasFinalizadas = reservas.filter(r => r.estado !== "RESERVADA");

  // 🚨 Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
        <div className="text-red-400 p-6 bg-red-900/20 rounded-xl border border-red-500/50 max-w-md">
          <h2 className="text-2xl font-bold mb-3">❌ Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={cargarReservas}
            className="bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 px-6 py-3 rounded-lg font-semibold transition-all w-full"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">✂️</div>
        </div>
        <p className="text-amber-400 mt-6 font-semibold">Cargando agenda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Header con estilo vintage */}
      <div className="mb-8 pb-6 border-b-2 border-amber-600/30">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-2">
              ✂️ Mi Agenda
            </h1>
            <p className="text-gray-400 text-lg capitalize">
              {dayjs(fecha).format("dddd, DD [de] MMMM YYYY")}
            </p>
          </div>
          <button 
            onClick={cargarReservas}
            className="bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-amber-500/50 flex items-center gap-2"
          >
            <span className="text-xl">🔄</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Cards de estadísticas con estilo premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon="📅" 
          title="Total Citas" 
          value={total}
          subtitle="del día"
          gradient="from-blue-600 to-blue-800"
        />
        <StatCard 
          icon="✅" 
          title="Completadas" 
          value={completadas}
          subtitle="finalizadas"
          gradient="from-green-600 to-emerald-800"
        />
        <StatCard 
          icon="❌" 
          title="Canceladas" 
          value={canceladas}
          subtitle="anuladas"
          gradient="from-red-600 to-rose-800"
        />
        <StatCard 
          icon="💰" 
          title="Ingresos" 
          value={`$${ingresos.toLocaleString()}`}
          subtitle="ganados hoy"
          gradient="from-purple-600 to-pink-800"
        />
      </div>

      {/* Citas Pendientes */}
      {reservasPendientes.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-yellow-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-amber-400">⏳ Citas Pendientes</h2>
          </div>

          <div className="space-y-4">
            {reservasPendientes.map((r, index) => (
              <AppointmentCard 
                key={r._id}
                reserva={r}
                index={index}
                onCompletar={onCompletar}
                onCancelar={onCancelar}
              />
            ))}
          </div>
        </div>
      )}

      {/* Citas Finalizadas (colapsable) */}
      {reservasFinalizadas.length > 0 && (
        <details className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
          <summary className="cursor-pointer text-xl font-bold text-gray-300 hover:text-white transition flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-red-500 rounded-full"></div>
            📋 Citas Finalizadas ({reservasFinalizadas.length})
          </summary>
          
          <div className="space-y-4 mt-6">
            {reservasFinalizadas.map((r, index) => (
              <AppointmentCard 
                key={r._id}
                reserva={r}
                index={index}
                onCompletar={onCompletar}
                onCancelar={onCancelar}
                showActions={false}
              />
            ))}
          </div>
        </details>
      )}

      {/* Mensaje si no hay citas */}
      {reservas.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
          <div className="text-center py-16 bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-700">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400 text-xl font-semibold">No hay citas programadas</p>
            <p className="text-gray-500 mt-2">Disfruta tu día libre</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de estadísticas
function StatCard({ icon, title, value, subtitle, gradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/10`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl">{icon}</span>
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
          <span className="text-2xl">📊</span>
        </div>
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <p className="text-4xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/60 text-xs">{subtitle}</p>
    </div>
  );
}

// Componente de tarjeta de cita
function AppointmentCard({ reserva, index, onCompletar, onCancelar, showActions = true }) {
  const r = reserva;
  const estadoConfig = {
    RESERVADA: { 
      bg: "bg-gradient-to-r from-amber-500 to-yellow-600",
      text: "PENDIENTE",
      icon: "⏳",
      border: "border-amber-500/50"
    },
    COMPLETADA: { 
      bg: "bg-gradient-to-r from-green-500 to-emerald-600",
      text: "COMPLETADA",
      icon: "✅",
      border: "border-green-500/50"
    },
    CANCELADA: { 
      bg: "bg-gradient-to-r from-red-500 to-pink-600",
      text: "CANCELADA",
      icon: "❌",
      border: "border-red-500/50"
    }
  };

  const config = estadoConfig[r.estado] || estadoConfig.RESERVADA;

  return (
    <div 
      className={`bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border ${config.border} hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10`}
      style={{ 
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="flex justify-between items-start gap-4 flex-wrap lg:flex-nowrap">
        <div className="flex-1 min-w-0">
          {/* Servicio y estado */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              ✂️
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white truncate">
                {r.servicioId?.nombre || r.servicioNombre || "Servicio"}
              </h3>
              <span className={`${config.bg} text-white text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 shadow-lg`}>
                <span>{config.icon}</span>
                {config.text}
              </span>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
            <div className="flex items-center gap-2">
              <span className="text-2xl flex-shrink-0">👤</span>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="text-white font-semibold truncate">
                  {r.nombreCliente || "Sin nombre"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl flex-shrink-0">🕐</span>
              <div>
                <p className="text-xs text-gray-500">Hora</p>
                <p className="text-white font-semibold text-lg">{r.hora}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl flex-shrink-0">💵</span>
              <div>
                <p className="text-xs text-gray-500">Precio</p>
                <p className="text-amber-400 font-bold text-lg">
                  ${(r.servicioId?.precio || r.precio || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción - Solo para pendientes */}
        {showActions && r.estado === "RESERVADA" && (
          <div className="flex flex-col gap-2 w-full lg:w-auto lg:ml-4">
            <button
              onClick={() => onCompletar(r._id)}
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/50 hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">✓</span>
              Completar
            </button>
            <button
              onClick={() => onCancelar(r._id)}
              className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">✕</span>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}