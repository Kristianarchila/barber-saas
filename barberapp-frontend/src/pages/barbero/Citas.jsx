import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { getCitasBarbero } from "../../services/barberoDashboardService";

dayjs.locale("es");

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("TODAS"); // TODAS, COMPLETADA, CANCELADA
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const data = await getCitasBarbero();
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando citas:", error);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar citas
  const citasFiltradas = citas.filter(cita => {
    const cumpleFiltro = filtro === "TODAS" || cita.estado === filtro;
    const cumpleBusqueda = 
      (cita.clienteNombre || cita.clienteId?.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (cita.servicioId?.nombre || "").toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  // Agrupar por fecha
  const citasAgrupadas = citasFiltradas.reduce((grupos, cita) => {
    const fecha = cita.fecha;
    if (!grupos[fecha]) {
      grupos[fecha] = [];
    }
    grupos[fecha].push(cita);
    return grupos;
  }, {});

  // Ordenar fechas de más reciente a más antigua
  const fechasOrdenadas = Object.keys(citasAgrupadas).sort((a, b) => 
    new Date(b) - new Date(a)
  );

  // Estadísticas
  const stats = {
    total: citas.length,
    completadas: citas.filter(c => c.estado === "COMPLETADA").length,
    canceladas: citas.filter(c => c.estado === "CANCELADA").length,
    ingresos: citas
      .filter(c => c.estado === "COMPLETADA")
      .reduce((acc, c) => acc + (c.servicioId?.precio || c.precio || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">📁</div>
        </div>
        <p className="text-purple-400 mt-6 font-semibold">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
              📁 Historial de Citas
            </h1>
            <p className="text-gray-400">Registro completo de todas tus atenciones</p>
          </div>
          <button 
            onClick={cargarCitas}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStatCard 
            icon="📊" 
            label="Total Citas" 
            value={stats.total}
            color="text-blue-400"
          />
          <MiniStatCard 
            icon="✅" 
            label="Completadas" 
            value={stats.completadas}
            color="text-green-400"
          />
          <MiniStatCard 
            icon="❌" 
            label="Canceladas" 
            value={stats.canceladas}
            color="text-red-400"
          />
          <MiniStatCard 
            icon="💰" 
            label="Ingresos Totales" 
            value={`$${stats.ingresos.toLocaleString()}`}
            color="text-purple-400"
          />
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                placeholder="Buscar por cliente o servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex gap-2">
            {["TODAS", "COMPLETADA", "CANCELADA"].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  filtro === estado
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {estado === "TODAS" ? "📋 Todas" : 
                 estado === "COMPLETADA" ? "✅ Completadas" : 
                 "❌ Canceladas"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de citas agrupadas por fecha */}
      {citasFiltradas.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-gray-400 mb-2">No se encontraron citas</p>
          <p className="text-gray-500">
            {busqueda ? "Intenta con otra búsqueda" : "Aún no tienes citas registradas"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {fechasOrdenadas.map((fecha) => (
            <div key={fecha} className="space-y-3">
              {/* Separador de fecha */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full">
                  <span className="font-semibold text-sm capitalize">
                    {dayjs(fecha).format("dddd, DD [de] MMMM YYYY")}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>

              {/* Citas de ese día */}
              <div className="space-y-3">
                {citasAgrupadas[fecha].map((cita, index) => (
                  <CitaCard key={cita._id} cita={cita} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Mini tarjeta de estadística
function MiniStatCard({ icon, label, value, color }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// Tarjeta de cita individual
function CitaCard({ cita, index }) {
  const estadoConfig = {
    COMPLETADA: {
      bg: "from-green-600/20 to-emerald-600/20",
      border: "border-green-500/30",
      badge: "bg-gradient-to-r from-green-500 to-emerald-600",
      icon: "✅"
    },
    CANCELADA: {
      bg: "from-red-600/20 to-pink-600/20",
      border: "border-red-500/30",
      badge: "bg-gradient-to-r from-red-500 to-pink-600",
      icon: "❌"
    },
    RESERVADA: {
      bg: "from-amber-600/20 to-yellow-600/20",
      border: "border-amber-500/30",
      badge: "bg-gradient-to-r from-amber-500 to-yellow-600",
      icon: "⏳"
    }
  };

  const config = estadoConfig[cita.estado] || estadoConfig.RESERVADA;

  return (
    <div 
      className={`
        bg-gradient-to-r ${config.bg} backdrop-blur-sm 
        rounded-xl p-5 border ${config.border}
        hover:shadow-xl hover:shadow-purple-500/10 transition-all
      `}
      style={{ 
        animation: `slideIn 0.4s ease-out ${index * 0.05}s both` 
      }}
    >
      <div className="flex justify-between items-start gap-4 flex-wrap">
        {/* Info principal */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Hora */}
          <div className="bg-gray-900/50 rounded-lg p-3 text-center min-w-[70px]">
            <p className="text-xs text-gray-400 mb-1">Hora</p>
            <p className="text-lg font-bold text-white">{cita.hora}</p>
          </div>

          {/* Detalles */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-white truncate">
                {cita.servicioId?.nombre || "Servicio"}
              </h3>
              <span className={`${config.badge} text-white text-xs px-2 py-1 rounded-full font-semibold inline-flex items-center gap-1`}>
                <span>{config.icon}</span>
                {cita.estado}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <span>👤</span>
                { cita.nombreCliente || "Sin nombre"}
              </span>
              <span className="flex items-center gap-1">
                <span>💰</span>
                ${(cita.servicioId?.precio || cita.precio || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agregar animación al final del archivo
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  if (!document.querySelector('style[data-slide-in]')) {
    style.setAttribute('data-slide-in', 'true');
    document.head.appendChild(style);
  }
}