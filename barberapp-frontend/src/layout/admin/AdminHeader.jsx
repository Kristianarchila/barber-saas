import { Menu, Bell, Sun, Moon, Search } from "lucide-react";

export default function AdminHeader({ setIsMobileMenuOpen, theme, toggleTheme, user }) {
    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
            {/* LEFT SECTION */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu size={20} className="text-gray-600" />
                </button>

                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md w-80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar clientes, servicios..."
                        className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                >
                    {theme === 'light' ? (
                        <Moon size={18} className="text-gray-600" />
                    ) : (
                        <Sun size={18} className="text-gray-600" />
                    )}
                </button>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <Bell size={18} className="text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                            {user.nombre || "Admin"}
                        </p>
                        <p className="text-xs text-gray-500">Administrador</p>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                            {user.nombre?.charAt(0) || 'A'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
