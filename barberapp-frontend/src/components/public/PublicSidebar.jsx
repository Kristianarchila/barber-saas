import { Home, Scissors, Calendar, Users, Star, MapPin, X } from 'lucide-react';

export default function PublicSidebarModern({ isOpen, onClose, theme, slug }) {
    const menuSections = [
        { id: 'home', title: 'Principal', items: [
            { icon: Home, label: 'Inicio', path: `/${slug}` },
            { icon: Scissors, label: 'Servicios', section: 'servicios' },
            { icon: Calendar, label: 'Reservar', path: `/${slug}/book` },
        ]},
        { id: 'info', title: 'Información', items: [
            { icon: Users, label: 'Equipo', section: 'barberos' },
            { icon: MapPin, label: 'Ubicación', section: 'ubicacion' },
        ]}
    ];

    return (
        <>
            {/* OVERLAY - Fondo negro translúcido */}
            <div 
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* SIDEBAR - Menú lateral */}
            <aside 
                className={`fixed inset-y-0 left-0 w-[280px] bg-white z-[110] transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col h-full border-r border-gray-200`}
            >
                <div className="px-6 py-8 flex items-center justify-between">
                    <h2 className="text-lg font-black text-black uppercase tracking-tighter">
                        {theme?.nombre || 'Barbería'}
                    </h2>
                    <button onClick={onClose} className="lg:hidden p-2 text-gray-400"><X size={24}/></button>
                </div>

                <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
                    {menuSections.map((section) => (
                        <div key={section.id}>
                            <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{section.title}</h3>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => { /* Tu lógica de navegación */ onClose(); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}