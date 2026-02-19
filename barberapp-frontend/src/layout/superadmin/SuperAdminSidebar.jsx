import { Link } from "react-router-dom";
import {
    Crown,
    ChevronRight,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { Badge } from "../../components/ui";

export default function SuperAdminSidebar({
    navLinks,
    isActive,
    user,
    handleLogout,
    isCollapsed,
    toggleSidebar
}) {
    return (
        <aside
            className={`hidden lg:flex flex-col bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-20" : "w-72"
                }`}
        >
            {/* Logo Section */}
            <div className={`p-6 border-b border-gray-50 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-[40px] w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                        <Crown className="text-white" size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in whitespace-nowrap">
                            <h1 className="text-xl font-black text-gray-900 leading-none">
                                MASTER<span className="text-primary-600">PANEL</span>
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">SuperAdmin</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
                {navLinks.map((link) => {
                    const active = isActive(link.to);
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            title={isCollapsed ? link.label : ""}
                            className={`group flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all relative ${active
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                } ${isCollapsed ? "justify-center" : "justify-between"}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`${active ? "text-white" : "text-gray-400 group-hover:text-gray-900"} transition-colors`}>
                                    {link.icon}
                                </span>
                                {!isCollapsed && <span className="animate-fade-in">{link.label}</span>}
                            </div>

                            {!isCollapsed && (
                                <div className="flex items-center gap-2">
                                    {link.badge > 0 && !active && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary-50 text-primary-600 text-[10px] font-black rounded-full border border-primary-100">
                                            {link.badge}
                                        </span>
                                    )}
                                    {active && <ChevronRight size={14} className="text-gray-400" />}
                                </div>
                            )}

                            {isCollapsed && link.badge > 0 && !active && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout Section */}
            <div className="p-4 border-t border-gray-50 space-y-2">
                {!isCollapsed && (
                    <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3 animate-fade-in">
                        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm">
                            {user.nombre?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {user.nombre || "Super Admin"}
                            </p>
                            <span className="text-[10px] font-black uppercase text-primary-600 tracking-wider">Root Access</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ${isCollapsed ? "justify-center" : ""
                        }`}
                >
                    <LogOut size={18} className="shrink-0" />
                    {!isCollapsed && <span className="animate-fade-in">Cerrar sesión</span>}
                </button>
            </div>

            {/* Collapse Toggle Button - Desktop Overlay */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-100 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all active:scale-90 z-20"
                title={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            >
                {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
        </aside>
    );
}
