import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    User,
    LogOut,
    DollarSign,
    ClipboardList,
    Receipt,
    Scissors,
    ChevronRight
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function BarberoSidebar({ slug, location, onLogout }) {
    const { user } = useAuth();

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    const navSections = [
        {
            section: "Principal",
            items: [
                { label: "Dashboard", icon: LayoutDashboard, path: `/${slug}/barbero/dashboard` },
                { label: "Agenda", icon: Calendar, path: `/${slug}/barbero/agenda` },
                { label: "Mis Citas", icon: ClipboardList, path: `/${slug}/barbero/citas` },
            ]
        },
        {
            section: "Finanzas",
            items: [
                { label: "Mis Ingresos", icon: DollarSign, path: `/${slug}/barbero/finanzas` },
                { label: "Transacciones", icon: Receipt, path: `/${slug}/barbero/finanzas/transacciones` },
            ]
        },
        {
            section: "Cuenta",
            items: [
                { label: "Mi Perfil", icon: User, path: `/${slug}/barbero/perfil` },
            ]
        }
    ];

    const initials = user?.nombre
        ? user.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : "BB";

    return (
        <aside className="w-64 bg-zinc-900 border-r border-white/5 flex flex-col fixed h-full z-20 hidden lg:flex">

            {/* ── LOGO ── */}
            <div className="px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Scissors size={20} className="text-zinc-900" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white leading-tight">BarberApp</h2>
                        <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Panel Barbero</p>
                    </div>
                </div>
            </div>

            {/* ── NAV ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {navSections.map((section) => (
                    <div key={section.section}>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-2">
                            {section.section}
                        </p>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${active
                                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon
                                                size={18}
                                                strokeWidth={active ? 2.5 : 1.8}
                                                className={active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"}
                                            />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                        {active && (
                                            <ChevronRight size={14} className="text-amber-400/60" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── FOOTER ── */}
            <div className="px-3 py-4 border-t border-white/5 space-y-2">
                {/* Avatar + nombre */}
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                        <span className="text-xs font-black text-zinc-900">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">{user?.nombre || "Barbero"}</p>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Profesional</p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group border border-transparent hover:border-red-500/20"
                >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
