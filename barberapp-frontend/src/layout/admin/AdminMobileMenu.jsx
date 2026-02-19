import { Link } from "react-router-dom";
import { Store, X, LogOut } from "lucide-react";

export default function AdminMobileMenu({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    slug,
    barberias,
    handleSwitchBarberia,
    navLinks,
    isActive,
    handleLogout
}) {
    if (!isMobileMenuOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
            />
            <nav className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-900 p-6 animate-slide-in">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                            <Store className="text-white" size={20} />
                        </div>
                        <h1 className="text-xl font-black text-white">
                            Admin<span className="text-gradient-primary">Pro</span>
                        </h1>
                    </div>
                    <button
                        className="text-neutral-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Sede Selector Mobile */}
                {barberias.length > 1 && (
                    <div className="mb-6 px-4">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 block">
                            Cambiar Sucursal
                        </label>
                        <select
                            value={slug}
                            onChange={(e) => handleSwitchBarberia(e.target.value)}
                            className="w-full bg-neutral-800 text-white text-sm font-bold p-3 rounded-xl border border-neutral-700 outline-none"
                        >
                            {barberias.map((b) => (
                                <option key={b._id} value={b.slug}>
                                    📍 {b.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
                    {navLinks.map((section) => (
                        <div key={section.section} className="space-y-1">
                            <h3 className="px-4 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">
                                {section.section}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${isActive(link.to)
                                            ? "gradient-primary text-white"
                                            : "text-neutral-400 hover:bg-neutral-800"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {link.icon}
                                            {link.label}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-error-500 hover:bg-error-500 hover:bg-opacity-10 rounded-xl transition-all"
                    >
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>
                </div>
            </nav>
        </div>
    );
}
