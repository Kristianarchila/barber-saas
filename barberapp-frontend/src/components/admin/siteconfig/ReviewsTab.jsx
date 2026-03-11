// Tab: Reseñas
import { motion } from 'framer-motion';
import { BarChart2, Sparkles } from 'lucide-react';

const Toggle = ({ checked, onChange }) => (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'right-1' : 'left-1'}`} />
    </button>
);

const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
            <p className="font-bold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <Toggle checked={checked} onChange={onChange} />
    </div>
);

export default function ReviewsTab({ config, setConfig }) {
    const r = config.configuracionResenas;
    const upd = (patch) => setConfig(p => ({ ...p, configuracionResenas: { ...p.configuracionResenas, ...patch } }));

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                <h2 className="heading-3 mb-8 flex items-center gap-2">
                    <BarChart2 size={20} className="text-blue-600" /> Configuración de Reseñas
                </h2>
                <div className="space-y-4">
                    <ToggleRow label="Habilitar Reseñas" desc="Permite que los clientes califiquen tus servicios" checked={r.habilitadas} onChange={() => upd({ habilitadas: !r.habilitadas })} />
                    <ToggleRow label="Mostrar en Web Pública" desc="Muestra la sección de reseñas en tu sitio web" checked={r.mostrarEnWeb} onChange={() => upd({ mostrarEnWeb: !r.mostrarEnWeb })} />
                    <ToggleRow label="Moderación Automática" desc="Aprobar automáticamente todas las reseñas nuevas" checked={r.moderacionAutomatica} onChange={() => upd({ moderacionAutomatica: !r.moderacionAutomatica })} />
                    <ToggleRow label="Permitir Respuestas" desc="Habilita la posibilidad de responder a reseñas desde el panel" checked={r.permitirRespuestas} onChange={() => upd({ permitirRespuestas: !r.permitirRespuestas })} />
                </div>
            </div>

            <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                <h2 className="heading-3 mb-8 flex items-center gap-2">
                    <Sparkles size={20} className="text-blue-600" /> Políticas de Publicación
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="label mb-2 block">Calificación mínima para mostrar automáticamente</label>
                        <select value={r.calificacionMinima} onChange={e => upd({ calificacionMinima: parseInt(e.target.value) })} className="input">
                            <option value={1}>Mostrar todas (1+ estrellas)</option>
                            <option value={2}>Mínimo 2 estrellas</option>
                            <option value={3}>Mínimo 3 estrellas</option>
                            <option value={4}>Mínimo 4 estrellas</option>
                            <option value={5}>Solo 5 estrellas</option>
                        </select>
                        <p className="caption text-gray-500 mt-2 italic">* Solo aplica si la moderación automática está activada.</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-800 font-medium">
                            💡 Tip: Gestiona, aprueba y responde reseñas desde <strong>Marketing &gt; Reseñas</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
