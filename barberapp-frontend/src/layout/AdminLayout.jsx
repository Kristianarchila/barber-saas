import { useState, useEffect, Suspense } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { getMyBarberias } from "../services/userService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Users,
  Scissors,
  Clock,
  FolderOpen,
  Wallet,
  CreditCard,
  Mail,
  Store,
  PieChart,
  Receipt,
  TrendingUp,
  DollarSign,
  TrendingDown,
  Banknote,
  Package,
  ShoppingCart,
  Layout,
  Bell,
  Tag,
  Truck,
  History,
  Star,
  BarChart2,
  Shield,
  ClipboardList,
  BadgeDollarSign
} from "lucide-react";
import { logout } from "../pages/auth/logout";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "./admin/AdminSidebar";
import AdminHeader from "./admin/AdminHeader";
import AdminBottomNav from "./admin/AdminBottomNav";
import AdminMobileMenu from "./admin/AdminMobileMenu";

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { slug } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [barberias, setBarberias] = useState([]);

  useEffect(() => {
    async function loadBarberias() {
      try {
        const res = await getMyBarberias();
        setBarberias(res);
      } catch (error) {
        console.error("Error cargando sedes:", error);
      }
    }
    loadBarberias();
  }, []);

  const handleSwitchBarberia = (newSlug) => {
    if (newSlug === slug) return;
    setIsMobileMenuOpen(false);
    navigate(`/${newSlug}/admin/dashboard`);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    {
      section: "Operaciones", items: [
        { to: `/${slug}/admin/dashboard`, label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { to: `/${slug}/admin/clientes`, label: "Clientes & CRM", icon: <Users size={20} />, tooltip: "Historial y ficha de cada cliente" },
        { to: `/${slug}/admin/clientes/stats`, label: "Stats Clientes", icon: <BarChart2 size={20} />, tooltip: "Estadísticas de retención y lealtad" },
        { to: `/${slug}/admin/bloqueos`, label: "Bloqueos", icon: <Shield size={20} />, tooltip: "Bloquea fechas u horas para no recibir reservas" },
        { to: `/${slug}/admin/reservas`, label: "Agenda Diaria", icon: <Calendar size={20} /> },
        { to: `/${slug}/admin/calendario/diario`, label: "Calendario Diario", icon: <CalendarDays size={20} /> },
        { to: `/${slug}/admin/calendario/semanal`, label: "Calendario Semanal", icon: <CalendarRange size={20} /> },
        { to: `/${slug}/admin/calendario/mensual`, label: "Calendario Mensual", icon: <CalendarCheck size={20} /> },
        { to: `/${slug}/admin/venta-rapida`, label: "Venta Rápida", icon: <ShoppingCart size={20} />, tooltip: "Cobra un servicio sin crear reserva previa" },
        { to: `/${slug}/admin/historial`, label: "Historial Reservas", icon: <FolderOpen size={20} /> },
        { to: `/${slug}/admin/historial-ventas`, label: "Historial Ventas", icon: <Receipt size={20} /> },
      ]
    },
    {
      section: "Staff & Servicios", items: [
        { to: `/${slug}/admin/barberos`, label: "Barberos", icon: <Users size={20} /> },
        { to: `/${slug}/admin/servicios`, label: "Servicios", icon: <Scissors size={20} /> },
        { to: `/${slug}/admin/horarios`, label: "Horarios", icon: <Clock size={20} />, tooltip: "Define los días y horas de atención" },
        { to: `/${slug}/admin/sueldos`, label: "Sueldos Barberos", icon: <BadgeDollarSign size={20} />, tooltip: "Calcula y registra los pagos al equipo" },
      ]
    },
    {
      section: "Inventario & Tienda", items: [
        { to: `/${slug}/admin/productos`, label: "Productos", icon: <Package size={20} /> },
        { to: `/${slug}/admin/inventario`, label: "Control de Stock", icon: <Package size={20} /> },
        { to: `/${slug}/admin/proveedores`, label: "Proveedores", icon: <Truck size={20} /> },
        { to: `/${slug}/admin/movimientos-stock`, label: "Movimientos", icon: <History size={20} /> },
      ]
    },
    {
      section: "Marketing", items: [
        { to: `/${slug}/admin/cupones`, label: "Cupones & Descuentos", icon: <Tag size={20} />, tooltip: "Crea cupones para atraer nuevos clientes" },
        { to: `/${slug}/admin/resenas`, label: "Reseñas", icon: <Star size={20} />, tooltip: "Aprueba o rechaza reseñas de clientes" },
        { to: `/${slug}/admin/lista-espera`, label: "Lista de Espera", icon: <ClipboardList size={20} />, tooltip: "Clientes esperando un turno disponible" },
        { to: `/${slug}/admin/notificaciones`, label: "Notificaciones", icon: <Bell size={20} />, tooltip: "Configura emails y alertas push a tus clientes" },
      ]
    },
    {
      section: "Finanzas", items: [
        { to: `/${slug}/admin/finanzas`, label: "Dashboard Finanzas", icon: <Wallet size={20} /> },
        { to: `/${slug}/admin/finanzas/ingresos`, label: "Ingresos", icon: <DollarSign size={20} /> },
        { to: `/${slug}/admin/finanzas/egresos`, label: "Egresos", icon: <TrendingDown size={20} />, tooltip: "Gastos y salidas de dinero" },
        { to: `/${slug}/admin/finanzas/caja`, label: "Caja", icon: <Banknote size={20} />, tooltip: "Apertura y cierre de caja del día" },
        { to: `/${slug}/admin/finanzas/transacciones`, label: "Transacciones", icon: <Receipt size={20} /> },
        { to: `/${slug}/admin/finanzas/revenue-split`, label: "Split de Ingresos", icon: <PieChart size={20} />, tooltip: "Divide ingresos entre barberos por porcentaje" },
        { to: `/${slug}/admin/finanzas/pagos`, label: "Pagos a Staff", icon: <CreditCard size={20} />, tooltip: "Registra los pagos realizados al equipo" },
        { to: `/${slug}/admin/finanzas/reportes`, label: "Reportes", icon: <TrendingUp size={20} /> },
      ]
    },
    {
      section: "Configuración", items: [
        { to: `/${slug}/admin/mi-cuenta`, label: "Mi Cuenta", icon: <Shield size={20} /> },
        { to: `/${slug}/admin/suscripcion`, label: "Suscripción", icon: <CreditCard size={20} /> },
        { to: `/${slug}/admin/email-config`, label: "Email Config", icon: <Mail size={20} />, tooltip: "Configura el email desde el que se envían alertas" },
        { to: `/${slug}/admin/site-config`, label: "Configuración Web", icon: <Layout size={20} />, tooltip: "Logo, colores, fotos y textos de tu página" },
        { to: `/${slug}/admin/sucursales`, label: "Sucursales", icon: <Store size={20} />, tooltip: "Gestiona múltiples locales de la misma marca" },
        { to: `/${slug}/admin/calendario-config`, label: "Sincronización Calendario", icon: <Calendar size={20} />, tooltip: "Conecta con Google Calendar" },
      ]
    }
  ];

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión administrativa?")) {
      logout(navigate);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR DESKTOP */}
      <AdminSidebar
        slug={slug}
        barberias={barberias}
        handleSwitchBarberia={handleSwitchBarberia}
        navLinks={navLinks}
        isActive={isActive}
        user={user}
        handleLogout={handleLogout}
      />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <AdminHeader
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
        />

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
            <Suspense fallback={<LoadingSpinner label="Cargando módulo..." />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* BOTTOM NAVIGATION (MOBILE ONLY) */}
        <AdminBottomNav
          slug={slug}
          isActive={isActive}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>

      {/* MOBILE MENU */}
      <AdminMobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        slug={slug}
        barberias={barberias}
        handleSwitchBarberia={handleSwitchBarberia}
        navLinks={navLinks}
        isActive={isActive}
        handleLogout={handleLogout}
        user={user}
      />
    </div>
  );
}
