import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-black border-t border-zinc-800 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Scissors size={16} className="text-white" />
                            </div>
                            <span className="text-white font-black text-lg">BarberSaaS</span>
                        </div>
                        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                            La plataforma de gestión todo en uno para barberías modernas. Reservas, barberos, pagos y mucho más.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Producto</h4>
                        <ul className="space-y-2.5">
                            {[
                                { to: '/precios', label: 'Planes y precios' },
                                { to: '/#como-funciona', label: 'Cómo funciona' },
                                { to: '/signup', label: 'Prueba gratis' },
                                { to: '/login', label: 'Iniciar sesión' },
                            ].map(l => (
                                <li key={l.to}>
                                    <Link to={l.to} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Legal</h4>
                        <ul className="space-y-2.5">
                            {[
                                { to: '/terminos', label: 'Términos y condiciones' },
                                { to: '/privacidad', label: 'Política de privacidad' },
                                { to: '/terminos#reembolso', label: 'Política de reembolso' },
                            ].map(l => (
                                <li key={l.to}>
                                    <Link to={l.to} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-sm">© {year} BarberSaaS. Todos los derechos reservados.</p>
                    <p className="text-zinc-700 text-xs">Hecho con ❤️ para barberías modernas</p>
                </div>
            </div>
        </footer>
    );
}
