import { Outlet, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  DollarSign,
  History,
  ChevronRight
} from "lucide-react";
import { logout } from "../pages/auth/logout";

export default function BarberoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${active
            ? "bg-indigo-600 shadow-glow-primary text-white"
            : "hover:bg-slate-800 text-slate-400 hover:text-white"
          }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={active ? "text-white" : "group-hover:text-indigo-400"} />
          <span className="font-semibold text-sm">{label}</span>
        </div>
        {active && <ChevronRight size={14} />}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 p-6 border-r border-slate-800 flex flex-col fixed h-full z-20">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-black tracking-tighter text-gradient-primary">
            ✂️ BARBERO
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Panel de Profesional
          </p>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
          {/* SECCIÓN GENERAL */}
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-3 mb-4">
              General
            </p>
            <div className="space-y-1">
              <NavItem
                to={`/${slug}/barbero/dashboard`}
                icon={LayoutDashboard}
                label="Dashboard"
              />
              <NavItem
                to={`/${slug}/barbero/citas`}
                icon={Calendar}
                label="Agenda & Citas"
              />
              <NavItem
                to={`/${slug}/barbero/perfil`}
                icon={User}
                label="Mi Perfil"
              />
            </div>
          </div>

          {/* SECCIÓN FINANZAS */}
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-3 mb-4">
              Finanzas
            </p>
            <div className="space-y-1">
              <NavItem
                to={`/${slug}/barbero/finanzas`}
                icon={DollarSign}
                label="Mis Ganancias"
              />
              <NavItem
                to={`/${slug}/barbero/finanzas/transacciones`}
                icon={History}
                label="Historial"
              />
            </div>
          </div>
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="pt-6 border-t border-slate-800 mt-6">
          <button
            onClick={() => logout(navigate, slug)}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-8 min-h-screen relative overflow-x-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-600/5 blur-[100px] rounded-full -z-10" />

        <Outlet />
      </main>
    </div>
  );
}
