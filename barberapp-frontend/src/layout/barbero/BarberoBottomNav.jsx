import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    DollarSign,
    User
} from "lucide-react";

export default function BarberoBottomNav({ slug }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: `/${slug}/barbero/dashboard` },
        { label: 'Agenda', icon: Calendar, path: `/${slug}/barbero/agenda` },
        { label: 'Finanzas', icon: DollarSign, path: `/${slug}/barbero/finanzas` },
        { label: 'Perfil', icon: User, path: `/${slug}/barbero/perfil` },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center gap-1 transition-all ${isActive(item.path)
                                ? 'text-blue-600'
                                : 'text-gray-500 active:bg-gray-50'
                            }`}
                    >
                        <item.icon
                            size={22}
                            className={isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}
                        />
                        <span className={`text-xs font-medium ${isActive(item.path) ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
