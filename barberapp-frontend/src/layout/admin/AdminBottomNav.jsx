import { Link } from "react-router-dom";
import { Home, Calendar as CalendarIcon, ShoppingCart, DollarSign as MoneyIcon, Menu as MenuIcon } from "lucide-react";

export default function AdminBottomNav({ slug, isActive, setIsMobileMenuOpen }) {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around px-2 z-40 backdrop-blur-lg bg-opacity-90">
            <Link
                to={`/${slug}/admin/dashboard`}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${isActive(`/${slug}/admin/dashboard`) ? "text-primary-500" : "text-neutral-500"}`}
            >
                <Home size={20} className={isActive(`/${slug}/admin/dashboard`) ? "animate-bounce-subtle" : ""} />
                <span className="text-[10px] font-bold">Inicio</span>
            </Link>
            <Link
                to={`/${slug}/admin/reservas`}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${isActive(`/${slug}/admin/reservas`) ? "text-primary-500" : "text-neutral-500"}`}
            >
                <CalendarIcon size={20} />
                <span className="text-[10px] font-bold">Agenda</span>
            </Link>
            <Link
                to={`/${slug}/admin/venta-rapida`}
                className="flex flex-col items-center gap-1 -mt-8"
            >
                <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center text-white shadow-glow-primary border-4 border-neutral-900">
                    <ShoppingCart size={24} />
                </div>
                <span className="text-[10px] font-black text-primary-500 mt-1">VENTA</span>
            </Link>
            <Link
                to={`/${slug}/admin/finanzas`}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${isActive(`/${slug}/admin/finanzas`) ? "text-primary-500" : "text-neutral-500"}`}
            >
                <MoneyIcon size={20} />
                <span className="text-[10px] font-bold">Finanzas</span>
            </Link>
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex flex-col items-center gap-1 px-3 py-1 text-neutral-500"
            >
                <MenuIcon size={20} />
                <span className="text-[10px] font-bold">Más</span>
            </button>
        </nav>
    );
}
