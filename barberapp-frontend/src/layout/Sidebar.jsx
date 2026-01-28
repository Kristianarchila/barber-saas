// layouts/SuperAdminLayout.jsx

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../pages/auth/logout";

export default function SuperAdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isActive = (path) => location.pathname.includes(path);

    const navLinks = [
        { to: "dashboard", label: "Dashboard", icon: "📊" },
        { to: "barberias", label: "Barberías", icon: "🏪" },
        { to: "finanzas", label: "Finanzas", icon: "💰" },
        { to: "reportes", label: "Reportes", icon: "📈" },
    ];

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            logout(navigate);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950">

            {/* Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-purple-900/50 to-slate-950/90 backdrop-blur-xl border-r border-purple-700/20 flex flex-col hidden md:flex shadow-2xl">

                {/* Logo */}
                <div className="p-6 border-b border-purple-700/20">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-purple-500/50 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                S
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-black leading-none tracking-tight">
                                SUPER ADMIN
                            </h1>
                            <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 block">
                                Control Total
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 relative overflow-hidden ${isActive(link.to)
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/30 scale-105"
                                    : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-100 hover:scale-105 hover:shadow-lg hover:shadow-slate-700/20"
                                }`}
                        >
                            <span className={`text-2xl transition-all duration-300 ${isActive(link.to)
                                    ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                    : "group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                }`}>
                                {link.icon}
                            </span>
                            <span className="relative z-10">{link.label}</span>
                            {!isActive(link.to) && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-purple-700/20 bg-slate-950/40">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all duration-300 group border border-transparent hover:border-red-500/20 hover:shadow-lg hover:shadow-red-500/10"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col max-h-screen overflow-hidden">

                {/* Header */}
                <header className="h-20 border-b border-purple-700/20 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-2xl shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-800/30 border border-purple-700/30">
                            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                Sistema Central
                            </span>
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 leading-none">
                                {user.nombre || "Super Admin"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1.5 font-medium">
                                Nivel: <span className="text-purple-400">Máximo Control</span>
                            </p>
                        </div>
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 border-2 border-slate-700/50 shadow-xl shadow-purple-500/30"></div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                    </div>
                </header>

                {/* Área de Scroll */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
