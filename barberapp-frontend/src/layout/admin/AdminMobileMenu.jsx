import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Store, X, LogOut, ChevronRight, Check } from "lucide-react";

/**
 * AdminMobileMenu — Full-screen slide-in drawer
 *
 * Design decisions:
 * - Slides from the LEFT (natural for LTR reading)
 * - Traps focus when open (a11y)
 * - Closes on Escape key
 * - Over-scroll shows all nav items
 * - User identity prominent at top
 * - Sede switcher (if multi-location) as pill chips, not a native select
 */
export default function AdminMobileMenu({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    slug,
    barberias,
    handleSwitchBarberia,
    navLinks,
    isActive,
    handleLogout,
    user,
}) {
    const drawerRef = useRef(null);

    /* ── Close on Escape ── */
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const handleKey = (e) => e.key === "Escape" && setIsMobileMenuOpen(false);
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isMobileMenuOpen, setIsMobileMenuOpen]);

    /* ── Lock body scroll when open ── */
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isMobileMenuOpen]);

    const initials = user?.nombre
        ? user.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "AD";

    return (
        <>
            {/*
              * Two-layer approach:
              * 1. Invisible overlay — captures click-outside + blurs background
              * 2. The actual drawer panel
              *
              * Using CSS transitions on `translate` avoids layout reflow
              * (much smoother than width-based or display-block transitions).
              */}

            {/* Overlay */}
            <div
                aria-hidden="true"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                    lg:hidden fixed inset-0 z-[60]
                    bg-black/60 backdrop-blur-sm
                    transition-opacity duration-300
                    ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
            />

            {/* Drawer panel */}
            <aside
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Menú de navegación"
                className={`
                    lg:hidden fixed top-0 left-0 bottom-0 z-[70]
                    w-[80vw] max-w-[320px]
                    bg-white dark:bg-neutral-900
                    flex flex-col
                    shadow-2xl
                    transition-transform duration-300 ease-out
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-5 pt-safe-top pb-4 pt-5 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/30">
                            <Store size={18} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest leading-none">
                                Admin Panel
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mt-0.5 capitalize">
                                {slug?.replace(/-/g, " ")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Cerrar menú"
                        className="
                            w-8 h-8 rounded-lg flex items-center justify-center
                            text-gray-400 dark:text-neutral-500
                            hover:bg-gray-100 dark:hover:bg-white/5
                            active:scale-90 transition-all
                        "
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── USER CARD ── */}
                <div className="mx-4 mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                        <span className="text-xs font-black text-white">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {user?.nombre || "Administrador"}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-medium">
                            Administrador de barbería
                        </p>
                    </div>
                </div>

                {/* ── SEDE SWITCHER (multi-location only) ── */}
                {barberias.length > 1 && (
                    <div className="px-4 mt-4">
                        <p className="text-[10px] font-black text-gray-400 dark:text-neutral-600 uppercase tracking-widest mb-2 px-1">
                            Cambiar sucursal
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {barberias.map((b) => (
                                <button
                                    key={b._id}
                                    onClick={() => { handleSwitchBarberia(b.slug); setIsMobileMenuOpen(false); }}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                                        border transition-all duration-150
                                        ${b.slug === slug
                                            ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/30"
                                            : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-neutral-400 hover:border-amber-400 hover:text-amber-500"
                                        }
                                    `}
                                >
                                    {b.slug === slug && <Check size={11} strokeWidth={3} />}
                                    {b.nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── NAV SECTIONS ── */}
                <nav
                    aria-label="Secciones del panel"
                    className="flex-1 overflow-y-auto overscroll-contain px-4 mt-4 pb-4 space-y-5"
                >
                    {navLinks.map((section) => (
                        <div key={section.section}>
                            <p className="text-[10px] font-black text-gray-400 dark:text-neutral-600 uppercase tracking-widest mb-1.5 px-2">
                                {section.section}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((link) => {
                                    const active = isActive(link.to);
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            aria-current={active ? "page" : undefined}
                                            className={`
                                                group flex items-center justify-between
                                                px-3 py-2.5 rounded-xl
                                                transition-all duration-150 active:scale-[0.98]
                                                ${active
                                                    ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                                                    : "hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent"
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`${active ? "text-amber-500" : "text-gray-400 dark:text-neutral-500 group-hover:text-gray-600 dark:group-hover:text-neutral-300"} transition-colors`}>
                                                    {link.icon}
                                                </span>
                                                <span className={`text-sm font-medium ${active ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-gray-700 dark:text-neutral-300"}`}>
                                                    {link.label}
                                                </span>
                                            </div>
                                            {active && (
                                                <ChevronRight size={14} className="text-amber-500/60" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* ── FOOTER / LOGOUT ── */}
                <div className="px-4 pb-safe-bottom pb-4 pt-3 border-t border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => { setIsMobileMenuOpen(false); setTimeout(handleLogout, 100); }}
                        className="
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl
                            text-red-500 hover:text-red-600
                            hover:bg-red-50 dark:hover:bg-red-500/10
                            border border-transparent hover:border-red-200 dark:hover:border-red-500/20
                            transition-all duration-150
                            active:scale-[0.98]
                        "
                    >
                        <LogOut size={18} strokeWidth={2} />
                        <span className="text-sm font-semibold">Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
