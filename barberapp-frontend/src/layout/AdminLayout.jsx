import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Clock,
  FolderOpen,
  Wallet,
  CreditCard,
  Mail,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Store,
  PieChart,
  Receipt,
  TrendingUp
} from "lucide-react";
import { logout } from "../pages/auth/logout";
import { Badge } from "../components/ui";

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { slug } = useParams();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    {
      section: "Operaciones", items: [
        { to: `/${slug}/admin/dashboard`, label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { to: `/${slug}/admin/reservas`, label: "Agenda", icon: <Calendar size={20} /> },
        { to: `/${slug}/admin/historial`, label: "Historial", icon: <FolderOpen size={20} /> },
      ]
    },
    {
      section: "Staff & Servicios", items: [
        { to: `/${slug}/admin/barberos`, label: "Barberos", icon: <Users size={20} /> },
        { to: `/${slug}/admin/servicios`, label: "Servicios", icon: <Scissors size={20} /> },
        { to: `/${slug}/admin/horarios`, label: "Horarios", icon: <Clock size={20} /> },
      ]
    },
    {
      section: "Finanzas", items: [
        { to: `/${slug}/admin/finanzas`, label: "Dashboard Finanzas", icon: <Wallet size={20} /> },
        { to: `/${slug}/admin/finanzas/transacciones`, label: "Transacciones", icon: <Receipt size={20} /> },
        { to: `/${slug}/admin/finanzas/revenue-split`, label: "Split de Ingresos", icon: <PieChart size={20} /> },
        { to: `/${slug}/admin/finanzas/pagos`, label: "Pagos a Staff", icon: <CreditCard size={20} /> },
        { to: `/${slug}/admin/finanzas/reportes`, label: "Reportes", icon: <TrendingUp size={20} /> },
      ]
    },
    {
      section: "Módulo Sistema", items: [
        { to: `/${slug}/admin/suscripcion`, label: "Suscripción", icon: <CreditCard size={20} /> },
        { to: `/${slug}/admin/email-config`, label: "Email Config", icon: <Mail size={20} /> },
      ]
    }
  ];

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión administrativa?")) {
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
              <Store className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                Admin<span className="text-gradient-primary">Pro</span>
              </h1>
              <p className="text-xs text-neutral-500">Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-hide">
          {navLinks.map((section) => (
            <div key={section.section} className="space-y-1">
              <h3 className="px-4 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`group flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${isActive(link.to)
                      ? "gradient-primary text-white shadow-glow-primary"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive(link.to) ? "text-white" : "text-neutral-500 group-hover:text-primary-500 transition-colors"}>
                        {link.icon}
                      </span>
                      {link.label}
                    </div>

                    {isActive(link.to) && (
                      <ChevronRight size={14} className="text-white animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-neutral-800">
          <div className="p-4 bg-neutral-800 bg-opacity-50 rounded-xl mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                {user.nombre?.charAt(0) || "A"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  {user.nombre || "Admin"}
                </p>
                <Badge variant="primary" size="sm">ADMIN</Badge>
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
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-neutral-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-500 bg-opacity-20 border border-success-500 border-opacity-30">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xs font-bold text-success-500 uppercase tracking-wider">Online</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-800 rounded-xl transition-all">
              <Bell size={20} className="text-neutral-400" />
            </button>

            {/* User Info */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white">
                {user.nombre || "Admin"}
              </p>
              <p className="text-xs text-primary-500 font-semibold">Administrador</p>
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
                  <Store className="text-white" size={20} />
                </div>
                <h1 className="text-xl font-black text-white">
                  Admin<span className="text-gradient-primary">Pro</span>
                </h1>
              </div>
              <button
                className="text-neutral-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
              {navLinks.map((section) => (
                <div key={section.section} className="space-y-1">
                  <h3 className="px-4 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive(link.to)
                          ? "gradient-primary text-white"
                          : "text-neutral-400 hover:bg-neutral-800"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {link.icon}
                          {link.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
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