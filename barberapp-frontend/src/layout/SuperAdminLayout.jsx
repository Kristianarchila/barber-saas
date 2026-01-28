import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Wallet,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Crown
} from "lucide-react";
import { logout } from "../pages/auth/logout";
import { getDashboardSuperAdmin } from "../services/superAdminService";
import { Badge } from "../components/ui";

export default function SuperAdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [barberiaCount, setBarberiaCount] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardSuperAdmin();
      setBarberiaCount(data.totalBarberias || 0);
      setNotifications(data.proximasVencer?.length || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    {
      to: "/superadmin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      to: "/superadmin/dashboard/barberias",
      label: "Barberías",
      icon: <Store size={20} />,
      badge: barberiaCount
    },
    {
      to: "/superadmin/dashboard/finanzas",
      label: "Finanzas",
      icon: <Wallet size={20} />
    },
    {
      to: "/superadmin/dashboard/reportes",
      label: "Reportes",
      icon: <BarChart3 size={20} />
    }
  ];

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión?")) {
      logout(navigate);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-72 flex-col bg-neutral-900 border-r border-neutral-800">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Crown className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                MASTER<span className="text-gradient-primary">PANEL</span>
              </h1>
              <p className="text-xs text-neutral-500">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isActive(link.to)
                  ? "gradient-primary text-white shadow-glow-primary"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive(link.to) ? "text-white" : "text-neutral-500 group-hover:text-primary-500"}>
                  {link.icon}
                </span>
                {link.label}
              </div>

              {link.badge && !isActive(link.to) && (
                <Badge variant="neutral" size="sm">
                  {link.badge}
                </Badge>
              )}

              {isActive(link.to) && (
                <ChevronRight size={16} className="text-white" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-neutral-800">
          <div className="p-4 bg-neutral-800 bg-opacity-50 rounded-xl mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                {user.nombre?.charAt(0) || "S"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  {user.nombre || "Super Admin"}
                </p>
                <Badge variant="primary" size="sm">ROOT</Badge>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-error-500 hover:bg-error-500 hover:bg-opacity-10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 bg-neutral-900 bg-opacity-50 border-b border-neutral-800 backdrop-blur-lg">
          <button
            className="lg:hidden text-neutral-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-neutral-800 bg-opacity-50 px-4 py-2 rounded-xl w-96 border border-neutral-700 focus-within:border-primary-500 transition-all">
            <Search size={18} className="text-neutral-500" />
            <input
              className="bg-transparent outline-none px-3 w-full text-sm placeholder-neutral-500"
              placeholder="Buscar barberías, reportes..."
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-800 rounded-xl transition-all">
              <Bell size={20} className="text-neutral-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Info */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white">
                {user.nombre || "Super Admin"}
              </p>
              <p className="text-xs text-primary-500 font-semibold">ROOT ACCESS</p>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto bg-neutral-950">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-900 p-6 animate-slide-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Crown className="text-white" size={20} />
                </div>
                <h1 className="text-xl font-black text-white">
                  MASTER<span className="text-gradient-primary">PANEL</span>
                </h1>
              </div>
              <button
                className="text-neutral-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isActive(link.to)
                      ? "gradient-primary text-white"
                      : "text-neutral-400 hover:bg-neutral-800"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    {link.label}
                  </div>
                  {link.badge && (
                    <Badge variant="neutral" size="sm">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-error-500 hover:bg-error-500 hover:bg-opacity-10 rounded-xl transition-all"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
