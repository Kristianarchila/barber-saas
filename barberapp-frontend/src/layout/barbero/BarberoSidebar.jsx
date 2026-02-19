import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    User,
    LogOut,
    DollarSign,
    History,
    ChevronRight,
    TrendingUp,
    Scissors
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function BarberoSidebar({ slug, location, onLogout }) {
    const { user } = useAuth();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: `/${slug}/barbero/dashboard` },
        { label: 'Agenda', icon: Calendar, path: `/${slug}/barbero/agenda` },
        { label: 'Mis Finanzas', icon: DollarSign, path: `/${slug}/barbero/finanzas` },
        { label: 'Perfil', icon: User, path: `/${slug}/barbero/perfil` },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 hidden lg:flex">
            {/* LOGO AREA */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Scissors size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 leading-tight">BarberApp</h2>
                        <p className="text-xs text-gray-500 font-medium">Panel Barbero</p>
                    </div>
                </div>
            </div>

            {/* NAV ITEMS */}
            <nav className="flex-1 mt-2 px-3 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isActive(item.path)
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className={isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span className="text-sm">{item.label}</span>
                        </div>
                        {isActive(item.path) && <ChevronRight size={16} className="text-blue-600/50" />}
                    </Link>
                ))}
            </nav>

            {/* FOOTER AREA */}
            <div className="p-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                        <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.nombre || 'Barbero'}</p>
                        <p className="text-xs text-gray-500 truncate">Profesional</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}


