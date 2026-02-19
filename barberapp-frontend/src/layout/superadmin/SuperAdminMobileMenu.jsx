import { Link } from "react-router-dom";
import { Crown, X, LogOut } from "lucide-react";
import { Badge } from "../../components/ui";

export default function SuperAdminMobileMenu({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navLinks,
    isActive,
    handleLogout
}) {
    if (!isMobileMenuOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <nav className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl animate-slide-in-right origin-left">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                            <Crown className="text-white" size={20} />
                        </div>
                        <h1 className="text-xl font-black text-gray-900">
                            MASTER<span className="text-primary-600">PANEL</span>
                        </h1>
                    </div>
                    <button
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navLinks.map((link) => {
                        const active = isActive(link.to);
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${active
                                        ? "bg-gray-900 text-white shadow-md"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={active ? "text-white" : "text-gray-400"}>
                                        {link.icon}
                                    </span>
                                    {link.label}
                                </div>
                                {link.badge > 0 && !active && (
                                    <Badge variant="primary" size="sm">
                                        {link.badge}
                                    </Badge>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all"
                    >
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>
                </div>
            </nav>
        </div>
    );
}
