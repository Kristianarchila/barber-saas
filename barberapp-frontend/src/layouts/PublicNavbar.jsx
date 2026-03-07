import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    const links = [
        { to: '/#como-funciona', label: 'Cómo funciona' },
        { to: '/precios', label: 'Precios' },
        { to: '/terminos', label: 'Legal' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Scissors size={16} className="text-white" />
                        </div>
                        <span className="text-white font-black text-lg tracking-tight">BarberSaaS</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-8">
                        {links.map(l => (
                            <Link
                                key={l.to}
                                to={l.to}
                                className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                            Iniciar sesión
                        </Link>
                        <Link
                            to="/signup"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/20"
                        >
                            Prueba gratis 14 días
                        </Link>
                    </div>

                    {/* Mobile burger */}
                    <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden bg-black border-t border-zinc-800 px-4 py-4 space-y-3">
                    {links.map(l => (
                        <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-zinc-400 hover:text-white text-sm font-medium py-2 transition-colors">
                            {l.label}
                        </Link>
                    ))}
                    <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
                        <Link to="/login" onClick={() => setOpen(false)} className="block text-center py-2.5 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
                            Iniciar sesión
                        </Link>
                        <Link to="/signup" onClick={() => setOpen(false)} className="block text-center py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all">
                            Prueba gratis 14 días
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
