import { useState, useEffect, Suspense } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Wallet,
  BarChart3,
  Users,
  CreditCard,
  UserCheck,
  ShieldCheck
} from "lucide-react";
import { logout } from "../pages/auth/logout";
import { getDashboardSuperAdmin } from "../services/superAdminService";
import SuperAdminSidebar from "./superadmin/SuperAdminSidebar";
import SuperAdminHeader from "./superadmin/SuperAdminHeader";
import SuperAdminMobileMenu from "./superadmin/SuperAdminMobileMenu";

export default function SuperAdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [barberiaCount, setBarberiaCount] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadStats();
    // Leer preferencia de sidebar del localStorage
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState === "true") setIsSidebarCollapsed(true);
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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", newState.toString());
      return newState;
    });
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
      to: "/superadmin/dashboard/cuentas-pendientes",
      label: "Cuentas Pendientes",
      icon: <UserCheck size={20} />
    },
    {
      to: "/superadmin/dashboard/finanzas",
      label: "Finanzas",
      icon: <Wallet size={20} />
    },
    {
      to: "/superadmin/dashboard/suscripciones",
      label: "Suscripciones",
      icon: <CreditCard size={20} />
    },
    {
      to: "/superadmin/dashboard/reportes",
      label: "Reportes",
      icon: <BarChart3 size={20} />
    },
    {
      to: "/superadmin/dashboard/admins",
      label: "Administradores",
      icon: <Users size={20} />
    },
    {
      to: "/superadmin/dashboard/auditoria",
      label: "Auditoría",
      icon: <ShieldCheck size={20} />
    }
  ];

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión?")) {
      logout(navigate);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">

      {/* SIDEBAR DESKTOP */}
      <SuperAdminSidebar
        navLinks={navLinks}
        isActive={isActive}
        user={user}
        handleLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <SuperAdminHeader
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          notifications={notifications}
          user={user}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            <Suspense fallback={<LoadingSpinner label="Cargando..." />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* MOBILE MENU */}
      <SuperAdminMobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navLinks={navLinks}
        isActive={isActive}
        handleLogout={handleLogout}
      />
    </div>
  );
}
