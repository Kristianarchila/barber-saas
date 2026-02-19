import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";

export default function AdminSidebar({
    slug,
    barberias,
    handleSwitchBarberia,
    navLinks,
    isActive,
    user,
    handleLogout
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const currentBarberia = barberias.find(b => b.slug === slug);

    return (
        <aside
            className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'
                }`}
        >
            {/* HEADER - Logo + Collapse */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-sm">BS</span>
                        </div>
                        <span className="font-semibold text-gray-900">Barber SaaS</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    title={isCollapsed ? "Expandir" : "Colapsar"}
                >
                    {isCollapsed ? (
                        <ChevronRight size={18} className="text-gray-600" />
                    ) : (
                        <ChevronLeft size={18} className="text-gray-600" />
                    )}
                </button>
            </div>

            {/* SELECTOR BARBERÍA */}
            {!isCollapsed && barberias.length > 1 && (
                <div className="p-3 border-b border-gray-200">
                    <select
                        value={slug}
                        onChange={(e) => handleSwitchBarberia(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-colors"
                    >
                        {barberias.map((b) => (
                            <option key={b.slug} value={b.slug}>
                                {b.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto py-4">
                {navLinks.map((section, idx) => (
                    <div key={idx} className="mb-6">
                        {/* Section Header */}
                        {!isCollapsed && (
                            <div className="px-4 mb-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {section.section}
                                </h3>
                            </div>
                        )}

                        {/* Nav Items */}
                        <div className="space-y-1 px-2">
                            {section.items.map((item, itemIdx) => {
                                const active = isActive(item.to);
                                return (
                                    <Link
                                        key={itemIdx}
                                        to={item.to}
                                        className={`
                                            flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                                            ${active
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }
                                            ${isCollapsed ? 'justify-center' : ''}
                                        `}
                                        title={isCollapsed ? item.label : ''}
                                    >
                                        <span className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {item.icon}
                                        </span>
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* USER PROFILE */}
            <div className="p-3 border-t border-gray-200">
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 font-medium text-sm">
                                {user.nombre?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user.nombre || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500">Administrador</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                            title="Cerrar sesión"
                        >
                            <LogOut size={16} className="text-gray-500" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="w-full p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
                        title="Cerrar sesión"
                    >
                        <LogOut size={18} className="text-gray-500" />
                    </button>
                )}
            </div>
        </aside>
    );
}
