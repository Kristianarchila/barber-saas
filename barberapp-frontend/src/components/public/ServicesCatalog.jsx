/**
 * ServicesCatalog — Premium vertical cards with image-top layout.
 * Better than Webook: gradient price badge, smooth hover scale,
 * Popular/Recomendado badges, Spanish labels, beautiful empty state.
 */
import { useState, useMemo, useRef } from 'react';
import { Clock, Search, Star, Sparkles, X, ChevronLeft, ChevronRight, ArrowRight, Scissors } from 'lucide-react';

const ALL_KEY = '__all__';

function formatPrice(precio) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(precio);
}

export default function ServicesCatalog({
    servicios = [],
    categorias = [],
    onBook,
    theme = {},
    title,
}) {
    const {
        accent = '#2563EB',
        bg = '#fff',
        card = '#fff',
        text = '#111',
        muted = '#6b7280',
        border = '#e5e7eb',
        inputBg = '#f9fafb',
        pillActive = '#2563EB',
        pillActiveTxt = '#fff',
    } = theme;

    const [search, setSearch] = useState('');
    const [activeCat, setActive] = useState(ALL_KEY);
    const pillsRef = useRef(null);

    const orderedCategories = useMemo(() => {
        if (categorias.length > 0) {
            return [...categorias].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        }
        const names = [...new Set(servicios.map(s => s.categoria || 'General').filter(Boolean))];
        return names.map((nombre, i) => ({ nombre, orden: i }));
    }, [categorias, servicios]);

    const activeServices = useMemo(() => servicios.filter(s => s.activo !== false), [servicios]);
    const popularIds = useMemo(() => activeServices.slice(0, 3).map(s => s._id || s.id), [activeServices]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return activeServices
            .filter(s => activeCat === ALL_KEY || (s.categoria || 'General') === activeCat)
            .filter(s => !q || s.nombre?.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q))
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    }, [activeServices, activeCat, search]);

    const scrollPills = (dir) => {
        if (pillsRef.current) {
            pillsRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
        }
    };

    const catCount = (catName) =>
        catName === ALL_KEY
            ? activeServices.length
            : activeServices.filter(s => (s.categoria || 'General') === catName).length;

    return (
        <div style={{ background: bg }}>
            {/* ─── Header row: Title + Search ─── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                {title && (
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: text }}>{title}</h2>
                        <p className="text-sm mt-1" style={{ color: muted }}>
                            {activeServices.length} {activeServices.length === 1 ? 'servicio disponible' : 'servicios disponibles'}
                        </p>
                    </div>
                )}
                <div className="relative" style={{ minWidth: '220px', maxWidth: '320px' }}>
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: muted }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm border outline-none transition-shadow focus:ring-2"
                        style={{ background: inputBg, borderColor: border, color: text, '--tw-ring-color': accent + '40' }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: muted }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Category pills with scroll arrows ─── */}
            {orderedCategories.length > 0 && (
                <div className="relative flex items-center gap-1 mb-8">
                    <button
                        onClick={() => scrollPills(-1)}
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border cursor-pointer transition-colors hover:opacity-80"
                        style={{ background: bg, borderColor: border, color: muted }}
                    >
                        <ChevronLeft size={14} />
                    </button>

                    <div
                        ref={pillsRef}
                        className="flex items-center gap-2 overflow-x-auto flex-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <button
                            onClick={() => setActive(ALL_KEY)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap"
                            style={activeCat === ALL_KEY
                                ? { background: pillActive, color: pillActiveTxt, borderColor: pillActive }
                                : { background: 'transparent', color: text, borderColor: border }
                            }
                        >
                            Todos
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold"
                                style={{ background: activeCat === ALL_KEY ? 'rgba(255,255,255,0.25)' : inputBg }}>
                                {catCount(ALL_KEY)}
                            </span>
                        </button>

                        {orderedCategories.map(cat => {
                            const isActive = activeCat === cat.nombre;
                            const count = catCount(cat.nombre);
                            if (count === 0) return null;
                            return (
                                <button
                                    key={cat.nombre}
                                    onClick={() => setActive(cat.nombre)}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap"
                                    style={isActive
                                        ? { background: pillActive, color: pillActiveTxt, borderColor: pillActive }
                                        : { background: 'transparent', color: text, borderColor: border }
                                    }
                                >
                                    {cat.nombre}
                                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold"
                                        style={{ background: isActive ? 'rgba(255,255,255,0.25)' : inputBg }}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => scrollPills(1)}
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border cursor-pointer transition-colors hover:opacity-80"
                        style={{ background: bg, borderColor: border, color: muted }}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}

            {/* ─── Service cards — premium vertical layout ─── */}
            {filtered.length === 0 ? (
                <div className="py-20 text-center" style={{ color: muted }}>
                    <Scissors size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-base font-medium mb-1" style={{ color: text }}>No se encontraron servicios</p>
                    <p className="text-sm">{search ? `No hay resultados para "${search}"` : 'Agrega servicios desde el panel de administración'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((s, i) => {
                        const isPopular = popularIds.includes(s._id || s.id);
                        const isDestacado = s.destacado;
                        return (
                            <div
                                key={s._id || s.id || i}
                                className="group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                style={{ background: card, borderColor: border }}
                                onClick={() => onBook?.(s)}
                            >
                                {/* ── Image section ── */}
                                <div className="relative overflow-hidden" style={{ height: '200px' }}>
                                    {s.imagen ? (
                                        <img
                                            src={s.imagen}
                                            alt={s.nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                                            style={{ background: `linear-gradient(135deg, ${inputBg} 0%, ${border} 100%)` }}>
                                            <Scissors size={36} style={{ color: muted, opacity: 0.4 }} />
                                        </div>
                                    )}

                                    {/* Price badge — floating top-right */}
                                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-sm font-black backdrop-blur-md shadow-lg"
                                        style={{ background: 'rgba(0,0,0,0.75)', color: '#fff' }}>
                                        {formatPrice(s.precio)}
                                    </div>

                                    {/* Badges — floating top-left */}
                                    {(isPopular || isDestacado) && (
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            {isPopular && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md shadow-sm"
                                                    style={{ background: 'rgba(234,179,8,0.9)', color: '#422006' }}>
                                                    <Star size={10} className="fill-current" /> Popular
                                                </span>
                                            )}
                                            {isDestacado && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md shadow-sm"
                                                    style={{ background: `${accent}dd`, color: '#fff' }}>
                                                    <Sparkles size={10} /> Recomendado
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Category tag — bottom-left on image */}
                                    {s.categoria && s.categoria !== 'General' && (
                                        <div className="absolute bottom-3 left-3">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                                                style={{ background: 'rgba(255,255,255,0.85)', color: text }}>
                                                {s.categoria}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Content section ── */}
                                <div className="p-5">
                                    {/* Service name */}
                                    <h3 className="font-bold text-base leading-tight mb-1.5 line-clamp-2 group-hover:opacity-80 transition-opacity"
                                        style={{ color: text }}>
                                        {s.nombre}
                                    </h3>

                                    {/* Description */}
                                    {s.descripcion && (
                                        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: muted }}>
                                            {s.descripcion}
                                        </p>
                                    )}

                                    {/* Bottom row: duration + CTA */}
                                    <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${border}` }}>
                                        {s.duracion ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: muted }}>
                                                <Clock size={13} /> {s.duracion} min
                                            </span>
                                        ) : <span />}

                                        <button
                                            onClick={e => { e.stopPropagation(); onBook?.(s); }}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group-hover:gap-2.5"
                                            style={{ background: accent, color: pillActiveTxt }}
                                        >
                                            Reservar <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
