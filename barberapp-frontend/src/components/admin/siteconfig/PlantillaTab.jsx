// Tab: Plantilla Web
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAvailableTemplates } from '../../../config/templateRegistry';

export default function PlantillaTab({ config, setConfig }) {
    const plan = 'pro'; // TODO: pull from useBarberia context
    const templates = getAvailableTemplates(plan);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6">
            <div className="mb-8">
                <h2 className="heading-2">Plantilla Web</h2>
                <p className="body-small text-gray-600 mt-1">Elige el diseño que mejor representa a tu barbería</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {templates.map(t => (
                    <button
                        key={t.key}
                        type="button"
                        disabled={t.locked}
                        onClick={() => {
                            if (t.locked) { toast(`🔒 Requiere ${t.plan === 'pro' ? 'Plan Pro' : 'Plan Premium'}`, { icon: '🚀' }); return; }
                            setConfig(prev => ({ ...prev, template: t.key }));
                            toast.success(`Plantilla "${t.name}" seleccionada. Guarda los cambios para aplicarla.`);
                        }}
                        className={`relative text-left border-2 rounded-2xl p-5 transition-all ${
                            config.template === t.key ? 'border-blue-600 bg-blue-50 shadow-md'
                            : t.locked ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-blue-400 hover:shadow-sm cursor-pointer'
                        }`}
                    >
                        <div className="w-full h-28 rounded-xl mb-4 flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                            <span>{t.emoji}</span>
                            {config.template === t.key && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-[10px]">✓</span>
                                </div>
                            )}
                            {t.locked && (
                                <div className="absolute inset-0 bg-gray-200/60 flex items-center justify-center">
                                    <Lock size={24} className="text-gray-500" />
                                </div>
                            )}
                        </div>
                        <p className="font-black text-sm mb-1">{t.name}</p>
                        <p className="text-xs text-gray-500 leading-snug mb-3">{t.description}</p>
                        <div className="flex flex-wrap gap-1">
                            {t.locked ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                    🔒 {t.plan === 'pro' ? 'Plan Pro' : 'Plan Premium'}
                                </span>
                            ) : (
                                t.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                                ))
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                    💡 Plantilla actual: <strong>{config.template || 'modern'}</strong>. Los cambios se aplican al guardar.
                </p>
            </div>
        </motion.div>
    );
}
