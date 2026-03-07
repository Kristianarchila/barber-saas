import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    DollarSign,
    User,
    ClipboardList
} from "lucide-react";

export default function BarberoBottomNav({ slug }) {
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + "/");

    const navItems = [
        { label: "Inicio", icon: LayoutDashboard, path: `/${slug}/barbero/dashboard` },
        { label: "Agenda", icon: Calendar, path: `/${slug}/barbero/agenda` },
        { label: "Citas", icon: ClipboardList, path: `/${slug}/barbero/citas` },
        { label: "Finanzas", icon: DollarSign, path: `/${slug}/barbero/finanzas` },
        { label: "Perfil", icon: User, path: `/${slug}/barbero/perfil` },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
            {/* Glass morphism bar */}
            <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
                <div className="grid grid-cols-5 h-16 px-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-90 ${active ? "text-amber-400" : "text-zinc-500"
                                    }`}
                            >
                                {/* Active pill indicator */}
                                {active && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                                )}

                                <item.icon
                                    size={active ? 22 : 20}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    className={`transition-all duration-200 ${active
                                            ? "drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                                            : ""
                                        }`}
                                />
                                <span className={`text-[10px] font-semibold tracking-wide transition-all ${active ? "text-amber-400" : "text-zinc-600"
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
