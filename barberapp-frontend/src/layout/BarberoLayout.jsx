import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../pages/auth/logout";

export default function BarberoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      logout(navigate);
    }
  };

  // Obtener nombre del barbero del localStorage
  const userName = JSON.parse(localStorage.getItem("user") || "{}")?.nombre || "Barbero";

  const menuItems = [
    { path: "agenda", icon: "📅", label: "Mi Agenda", color: "from-blue-500 to-blue-600" },
    { path: "citas", icon: "📁", label: "Historial", color: "from-purple-500 to-purple-600" },
    { path: "perfil", icon: "👤", label: "Mi Perfil", color: "from-amber-500 to-yellow-600" }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 transition-all duration-300 flex flex-col`}
      >
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  ✂️
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
                    Barbería Pro
                  </h2>
                  <p className="text-xs text-gray-400">Panel Barbero</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-xl mx-auto">
                ✂️
              </div>
            )}
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Info del usuario */}
          {sidebarOpen && (
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-3 border border-gray-600/30">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-lg">
                  👨‍💼
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{userName}</p>
                  <p className="text-xs text-amber-400">Barbero Profesional</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                ${isActive(item.path)
                  ? `bg-gradient-to-r ${item.color} shadow-lg transform scale-105`
                  : "hover:bg-gray-800 hover:translate-x-1"
                }
                ${!sidebarOpen && "justify-center"}
              `}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-semibold">{item.label}</span>
              )}
              {sidebarOpen && isActive(item.path) && (
                <span className="ml-auto text-xl">→</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl
              bg-gradient-to-r from-red-600 to-pink-700
              hover:from-red-700 hover:to-pink-800
              transition-all duration-300 shadow-lg
              hover:shadow-red-500/50 hover:scale-105
              ${!sidebarOpen && "justify-center"}
            `}
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-semibold">Cerrar Sesión</span>}
          </button>

          {sidebarOpen && (
            <p className="text-center text-xs text-gray-500 mt-4">
              © 2026 Barbería Pro
            </p>
          )}
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {menuItems.find(item => isActive(item.path))?.label || "Dashboard"}
              </h1>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString("es-ES", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notificaciones */}
              <button className="relative p-2 hover:bg-gray-800 rounded-lg transition">
                <span className="text-2xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Avatar del usuario */}
              <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-sm">
                  👨‍💼
                </div>
                <span className="font-semibold text-sm hidden md:block">{userName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de las páginas */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}