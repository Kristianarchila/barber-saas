import { useLocation, Link } from "react-router-dom";
import { Menu, Bell, Search, ChevronRight, User as UserIcon } from "lucide-react";

export default function SuperAdminHeader({ setIsMobileMenuOpen, notifications, user }) {
    const location = useLocation();

    // Generate breadcrumbs from path
    const pathnames = location.pathname.split("/").filter((x) => x);

    // Map of path names to human readable labels
    const breadcrumbLabels = {
        superadmin: "SuperAdmin",
        dashboard: "Dashboard",
        barberias: "Barberías",
        "cuentas-pendientes": "Cuentas Pendientes",
        finanzas: "Finanzas",
        suscripciones: "Suscripciones",
        reportes: "Reportes",
        admins: "Administradores",
        auditoria: "Audit Log",
        crear: "Nueva",
        detalle: "Detalle"
    };

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 transition-all">
            {/* Left Side: Mobile Menu + Breadcrumbs */}
            <div className="flex items-center gap-6">
                <button
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu size={22} className="text-gray-600" />
                </button>

                {/* Breadcrumbs - Enterprise Style */}
                <nav className="hidden sm:flex items-center gap-2">
                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;
                        const label = breadcrumbLabels[name] || name;

                        return (
                            <div key={name} className="flex items-center gap-2">
                                {index > 0 && <ChevronRight size={14} className="text-gray-300" />}
                                {isLast ? (
                                    <span className="text-sm font-black text-gray-900 tracking-tight px-2 py-1 bg-gray-50 rounded-lg">
                                        {label}
                                    </span>
                                ) : (
                                    <Link
                                        to={routeTo}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Right Side: Search + Notifications + Profile */}
            <div className="flex items-center gap-6">
                {/* Search Bar - Modern SaaS Style */}
                <div className="hidden lg:flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 focus-within:border-gray-900 focus-within:bg-white transition-all group w-72">
                    <Search size={16} className="text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                    <input
                        className="bg-transparent outline-none w-full text-sm text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Search anything..."
                    />
                    <div className="flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity">
                        <span className="text-[10px] font-black border border-gray-300 px-1.5 py-0.5 rounded-md">⌘</span>
                        <span className="text-[10px] font-black border border-gray-300 px-1.5 py-0.5 rounded-md">K</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 pr-2 border-r border-gray-100">
                    {/* Notifications */}
                    <button className="relative p-2.5 hover:bg-gray-50 rounded-xl transition-all group">
                        <Bell size={20} className="text-gray-500 group-hover:text-gray-900 transition-colors" />
                        {notifications > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-100 animate-pulse" />
                        )}
                    </button>
                </div>

                {/* User Profile - Compact Enterprise */}
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-gray-900 leading-none">
                            {user.nombre?.split(' ')[0] || "Super"}
                        </p>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">Admin</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all cursor-pointer">
                        <UserIcon size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}
