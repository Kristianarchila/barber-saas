import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBarberia } from '../../context/BarberiaContext';

// --- SECCIÓN DE SERVICIOS (DISEÑO GALERÍA CON IMÁGENES) ---
export default function ServicesSection({ servicios = [] }) {
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();
    const { slug } = useBarberia();

    const categorias = useMemo(() => {
        const counts = { 'Todos': servicios.length };
        servicios.forEach(s => {
            const cat = s.categoria || 'General';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).map(([nombre, count]) => ({ nombre, count }));
    }, [servicios]);

    const serviciosFiltrados = useMemo(() => {
        return servicios.filter(s => {
            const matchesCategory = selectedCategory === 'Todos' || (s.categoria || 'General') === selectedCategory;
            const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [servicios, selectedCategory, searchTerm]);

    // Mostrar solo 9 servicios inicialmente, o todos si showAll es true
    const serviciosVisibles = showAll ? serviciosFiltrados : serviciosFiltrados.slice(0, 9);
    const hayMasServicios = serviciosFiltrados.length > 9;

    return (
        <section id="servicios" className="relative z-20 py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">

                {/* Cabecera de Sección */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <span className="text-black/40 font-black tracking-[.4em] uppercase text-[10px] block mb-4">
                            Experiencia Profesional
                        </span>
                        <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase leading-none">
                            Servicios<span className="text-transparent" style={{ WebkitTextStroke: '1px #000000' }}>.</span>
                        </h2>
                        <p className="text-neutral-400 text-sm mt-4 max-w-md">
                            {serviciosFiltrados.length} servicio{serviciosFiltrados.length !== 1 ? 's' : ''} disponible{serviciosFiltrados.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Búsqueda Minimalista */}
                    <div className="relative w-full md:max-w-xs">
                        <input
                            type="text"
                            placeholder="BUSCAR..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-b border-black/10 text-black py-4 text-xs font-black tracking-widest outline-none focus:border-black transition-all uppercase"
                        />
                        <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                    </div>
                </div>

                {/* Categorías (Pills Estilo Revista) */}
                <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
                    {categorias.map((cat) => (
                        <button
                            key={cat.nombre}
                            onClick={() => setSelectedCategory(cat.nombre)}
                            className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${selectedCategory === cat.nombre
                                ? 'bg-black text-white border-black'
                                : 'bg-transparent text-black/40 border-black/10 hover:border-black'
                                }`}
                        >
                            {cat.nombre} ({cat.count})
                        </button>
                    ))}
                </div>

                {/* Grid de Servicios - Diseño Galería con Imágenes (3 columnas) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {serviciosVisibles.map((servicio, idx) => (
                            <motion.div
                                key={servicio._id || idx}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                className="group bg-white border border-black/5 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-black/20 transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(`/${slug}/book`)}
                            >
                                {/* Imagen del Servicio */}
                                <div className="relative h-56 bg-neutral-100 overflow-hidden">
                                    {servicio.imagen ? (
                                        <img
                                            src={servicio.imagen}
                                            alt={servicio.nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-black/5 flex items-center justify-center">
                                                    <Clock size={28} className="text-black/20" />
                                                </div>
                                                <span className="text-[10px] text-black/20 font-black uppercase tracking-widest">
                                                    {servicio.categoria || 'Premium'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay con precio */}
                                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                                        <span className="text-lg font-black">${servicio.precio}</span>
                                    </div>

                                    {/* Badge de categoría */}
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                        <span className="text-[9px] text-black font-black uppercase tracking-wider">
                                            {servicio.categoria || 'Premium'}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-6">
                                    <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2 group-hover:text-black/70 transition-colors">
                                        {servicio.nombre}
                                    </h3>

                                    <p className="text-neutral-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                                        {servicio.descripcion || "Servicio profesional de alta calidad para tu mejor look."}
                                    </p>

                                    {/* Footer con duración y botón */}
                                    <div className="flex items-center justify-between pt-4 border-t border-black/5">
                                        <div className="flex items-center gap-2 text-black/40">
                                            <Clock size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {servicio.duracion} MIN
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-wider group-hover:gap-3 transition-all">
                                            Reservar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Botón "Ver Más" / "Ver Menos" */}
                {hayMasServicios && (
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="group px-12 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-neutral-800 transition-all shadow-lg hover:shadow-2xl flex items-center gap-3"
                        >
                            {showAll ? (
                                <>
                                    Ver Menos
                                    <motion.div
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        ↑
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    Ver Todos ({serviciosFiltrados.length} servicios)
                                    <motion.div
                                        animate={{ y: [0, 3, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        ↓
                                    </motion.div>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
