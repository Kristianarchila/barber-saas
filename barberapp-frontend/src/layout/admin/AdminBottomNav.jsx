import { useState } from "react";
import {
    LayoutDashboard,
    Calendar,
    ShoppingCart,
    BarChart2,
    Grid3X3,
} from "lucide-react";

/**
 * AdminBottomNav — Mobile-first bottom navigation bar
 *
 * Pattern: 5-tab bar with a visually elevated center CTA action.
 * Follows iOS/Android HIG guidelines:
 *  - Safe-area inset for home-indicator on iPhone X+
 *  - 44px+ tap targets
 *  - Active state: top pill + color change
 */
export default function AdminBottomNav({ slug, isActive, setIsMobileMenuOpen }) {
    const [activeRipple, setActiveRipple] = useState(null);

    const handleAction = (tab, index) => {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        setActiveRipple(index);
        setTimeout(() => setActiveRipple(null), 400);

        if (tab.type === "menu") {
            setIsMobileMenuOpen(true);
        }
    };

    const tabs = [
        {
            label: "Inicio",
            icon: LayoutDashboard,
            path: `/${slug}/admin/dashboard`,
            type: "link",
        },
        {
            label: "Agenda",
            icon: Calendar,
            path: `/${slug}/admin/reservas`,
            type: "link",
        },
        {
            label: "Venta",
            icon: ShoppingCart,
            path: `/${slug}/admin/venta-rapida`,
            type: "cta",         // visually elevated center action
        },
        {
            label: "Finanzas",
            icon: BarChart2,
            path: `/${slug}/admin/finanzas`,
            type: "link",
        },
        {
            label: "Menú",
            icon: Grid3X3,
            path: null,
            type: "menu",       // opens the full-screen drawer
        },
    ];

    return (
        /* 
         * Safe area: `pb-safe` relies on @tailwindcss/vite which supports env(safe-area-inset-bottom).
         * Fallback `pb-2` ensures usability on devices without safe-area env support.
         */
        <nav
            aria-label="Navegación principal"
            className="lg:hidden fixed bottom-0 inset-x-0 z-50"
        >
            {/* Glass bar */}
            <div
                className="
                    bg-white/90 dark:bg-neutral-900/95
                    backdrop-blur-2xl
                    border-t border-black/5 dark:border-white/5
                    shadow-[0_-1px_0_0_rgba(0,0,0,0.06),0_-16px_40px_rgba(0,0,0,0.12)]
                    pb-safe
                "
            >
                <div className="grid grid-cols-5 h-[3.75rem] px-1">
                    {tabs.map((tab, index) => {
                        const active =
                            tab.type !== "menu" && tab.path && isActive(tab.path);

                        /* ── CTA center button ── */
                        if (tab.type === "cta") {
                            return (
                                <Link
                                    key="cta"
                                    to={tab.path}
                                    onClick={() => handleAction(tab, index)}
                                    aria-label={tab.label}
                                    className="flex flex-col items-center justify-center -mt-5 z-10 touch-manipulation"
                                >
                                    {/* Ripple effect */}
                                    {activeRipple === index && (
                                        <div className="absolute top-0 w-16 h-16 bg-amber-400/30 rounded-full animate-ping-once" />
                                    )}

                                    {/* Floating circle */}
                                    <span
                                        className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center
                                            shadow-lg shadow-amber-500/40
                                            transition-all duration-200 active:scale-90
                                            ${active
                                                ? "bg-amber-600 scale-105"
                                                : "bg-amber-500 hover:bg-amber-400"
                                            }
                                        `}
                                    >
                                        <tab.icon size={24} strokeWidth={2} className="text-white" />
                                    </span>
                                    <span className="text-[10px] font-bold mt-1.5 text-amber-600 dark:text-amber-500 tracking-wide">
                                        {tab.label}
                                    </span>
                                </Link>
                            );
                        }

                        /* ── Menu button ── */
                        if (tab.type === "menu") {
                            return (
                                <button
                                    key="menu"
                                    onClick={() => handleAction(tab, index)}
                                    aria-label="Abrir menú completo"
                                    className="relative flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95 text-neutral-400 dark:text-neutral-500 touch-manipulation"
                                >
                                    {activeRipple === index && (
                                        <div className="absolute inset-0 bg-neutral-200/40 dark:bg-neutral-700/40 rounded-full animate-ping-once" />
                                    )}
                                    <tab.icon size={20} strokeWidth={1.8} />
                                    <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
                                </button>
                            );
                        }

                        /* ── Regular tab ── */
                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                onClick={() => handleAction(tab, index)}
                                aria-label={tab.label}
                                aria-current={active ? "page" : undefined}
                                className={`
                                    relative flex flex-col items-center justify-center gap-1
                                    transition-all duration-150 active:scale-95 touch-manipulation
                                    ${active
                                        ? "text-amber-500"
                                        : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600"
                                    }
                                `}
                            >
                                {activeRipple === index && (
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping-once" />
                                )}

                                {/* Active pill (top) */}
                                <span
                                    className={`
                                        absolute top-0 left-1/2 -translate-x-1/2
                                        h-0.5 rounded-full
                                        transition-all duration-500
                                        ${active
                                            ? "w-8 bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                                            : "w-0 bg-transparent"
                                        }
                                    `}
                                />
                                <tab.icon
                                    size={active ? 22 : 20}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    className="transition-all duration-200"
                                />
                                <span className={`text-[10px] font-bold tracking-wide transition-all ${active ? "opacity-100" : "opacity-80 font-semibold"}`}>
                                    {tab.label}
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
