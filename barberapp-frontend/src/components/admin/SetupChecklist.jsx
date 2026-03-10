import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    CheckCircle2, ChevronDown, ChevronUp, X,
    ImageIcon, Phone, Scissors, Wrench, Image, Sparkles, ArrowRight
} from 'lucide-react';
import barberiaService from '../../services/barberiaService';
import API from '../../services/api';

const STEPS = [
    { id: 'logo', icon: ImageIcon, title: 'Sube tu logo', desc: 'Aparece en tu web y como icono de la app', action: 'Subir logo', tab: 'site-config', accent: '#6366f1' },
    { id: 'telefono', icon: Phone, title: 'Agrega tu WhatsApp', desc: 'Tus clientes te escriben directo', action: 'Agregar', tab: 'site-config', accent: '#22c55e' },
    { id: 'barberos', icon: Scissors, title: 'Crea tu primer barbero', desc: 'Los clientes eligen con quién atenderse', action: 'Crear barbero', tab: 'barberos', accent: '#f59e0b' },
    { id: 'servicios', icon: Wrench, title: 'Agrega tus servicios', desc: 'Corte, barba, coloración — lo que ofreces', action: 'Crear servicio', tab: 'servicios', accent: '#ec4899' },
    { id: 'fotos', icon: Image, title: 'Fotos de tu barbería', desc: 'El fondo visual de tu página web', action: 'Subir fotos', tab: 'site-config', accent: '#14b8a6' },
    { id: 'titulo', icon: Sparkles, title: 'Personaliza el texto hero', desc: 'El título grande que ven tus clientes', action: 'Editar texto', tab: 'site-config', accent: '#8b5cf6' },
];

export default function SetupChecklist() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [collapsed, setCollapsed] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [states, setStates] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (localStorage.getItem('setup_collapsed') === 'true') setCollapsed(true);
        if (localStorage.getItem('setup_dismissed') === 'true') setDismissed(true);
        loadChecklist();
    }, []);

    const loadChecklist = async () => {
        try {
            const [barberiaRes, serviciosRes, barberosRes] = await Promise.all([
                barberiaService.getMiBarberia().catch(() => null),
                slug ? API.get(`/barberias/${slug}/admin/servicios`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                slug ? API.get(`/barberias/${slug}/barbero`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
            ]);
            const b = barberiaRes?.barberia;
            const cfg = b?.configuracion || {};

            const next = {
                logo: !!cfg.logoUrl,
                telefono: !!b?.telefono,
                // GET /barberias/:slug/barbero → { barberos: [...] }
                barberos: (barberosRes?.data?.barberos ?? []).length > 0,
                // GET /barberias/:slug/admin/servicios → { servicios: [...] }
                servicios: (serviciosRes?.data?.servicios ?? []).length > 0,
                fotos: (cfg.galeria || []).length > 0,
                titulo: !!(cfg.heroTitle && cfg.heroTitle !== 'REDEFINIENDO EL ESTILO MASCULINO'),
            };
            setStates(next);
            if (Object.values(next).every(Boolean)) {
                localStorage.setItem('setup_dismissed', 'true');
                setDismissed(true);
            }
        } catch (e) {
            console.error('[SetupChecklist]', e);
        } finally {
            setLoading(false);
        }
    };

    if (dismissed || loading) return null;

    const doneCount = STEPS.filter(s => states[s.id]).length;
    const pct = Math.round((doneCount / STEPS.length) * 100);

    const toggleCollapse = () => {
        const v = !collapsed; setCollapsed(v);
        localStorage.setItem('setup_collapsed', String(v));
    };

    return (
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">

            {/* Gradient top bar */}
            <div className="h-1" style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">

                    {/* Circular SVG progress */}
                    <div className="relative w-11 h-11 flex-shrink-0">
                        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                            <circle
                                cx="22" cy="22" r="18"
                                fill="none"
                                stroke="url(#cpg)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 18}`}
                                strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
                                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)' }}
                            />
                            <defs>
                                <linearGradient id="cpg" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-700">
                            {pct}%
                        </span>
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-0.5">
                            Inicio rápido
                        </p>
                        <h2 className="text-gray-900 font-bold text-[15px] leading-tight">
                            Configura tu barbería
                        </h2>
                        <p className="text-gray-400 text-xs mt-0.5">
                            {doneCount} de {STEPS.length} pasos completos
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {doneCount === STEPS.length && (
                        <button onClick={() => { localStorage.setItem('setup_dismissed', 'true'); setDismissed(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <X size={14} />
                        </button>
                    )}
                    <button onClick={toggleCollapse}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </div>

            {/* Steps */}
            {!collapsed && (
                <div className="px-4 pb-4 space-y-1">
                    {STEPS.map((step, idx) => {
                        const done = states[step.id];
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.id}
                                onClick={() => !done && navigate(`/${slug}/admin/${step.tab}`)}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${done
                                        ? 'opacity-50 cursor-default'
                                        : 'hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                {/* Icon / Check */}
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    {done ? (
                                        <CheckCircle2 size={20} className="text-green-500" />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 group-hover:scale-110"
                                            style={{ background: step.accent + '18', border: `1.5px solid ${step.accent}30` }}
                                        >
                                            <Icon size={14} style={{ color: step.accent }} />
                                        </div>
                                    )}
                                </div>

                                {/* Number + text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-gray-300 tabular-nums w-4">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <span className={`text-sm font-semibold ${done ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {!done && (
                                        <p className="text-[11px] text-gray-400 mt-0.5 ml-5">{step.desc}</p>
                                    )}
                                </div>

                                {/* CTA */}
                                {!done && (
                                    <div
                                        className="flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150 group-hover:shadow-sm"
                                        style={{
                                            color: step.accent,
                                            background: step.accent + '12',
                                            border: `1px solid ${step.accent}25`,
                                        }}
                                    >
                                        {step.action}
                                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
