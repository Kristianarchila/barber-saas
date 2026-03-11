import { useState } from "react";
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
    const [activeRipple, setActiveRipple] = useState(null);

    const handleAction = (item, index) => {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        setActiveRipple(index);
        setTimeout(() => setActiveRipple(null), 400);
    };

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
            <div className="bg-zinc-900/90 dark:bg-black/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-5 h-16 px-1">
                    {navItems.map((item, index) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => handleAction(item, index)}
                                className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${active ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {/* Active pill indicator */}
                                <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-amber-400 transition-all duration-500 ${active ? "w-8 shadow-[0_0_12px_rgba(251,191,36,0.8)]" : "w-0"}`} />

                                {activeRipple === index && (
                                    <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping-once" />
                                )}

                                <item.icon
                                    size={active ? 22 : 20}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`transition-all duration-200 ${active
                                            ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                            : ""
                                        }`}
                                />
                                <span className={`text-[10px] font-bold tracking-wide transition-all ${active ? "text-amber-400" : "text-zinc-600"
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                @keyframes ping-once {
                    0% {
                        transform: scale(0.6);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1.4);
                        opacity: 0;
                    }
                }
                .animate-ping-once {
                    animation: ping-once 0.4s cubic-bezier(0, 0, 0.2, 1) forwards;
                }
            `}</style>
        </nav>
    );
}
