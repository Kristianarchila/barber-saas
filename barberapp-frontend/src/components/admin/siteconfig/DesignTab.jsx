// Tab: Diseño (Colores + Tipografía)
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const COLORS = [
    { label: 'Principal', key: 'colorPrincipal' }, { label: 'Acento', key: 'colorAccent' },
    { label: 'Éxito', key: 'colorSuccess' }, { label: 'Alerta', key: 'colorWarning' },
    { label: 'Fondo Claro', key: 'colorLight' }, { label: 'Fondo Oscuro', key: 'colorDark' }
];
const BODY_FONTS    = ['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Outfit', 'Playfair Display'];
const HEADING_FONTS = ['Inter', 'Bebas Neue', 'Oswald', 'Anton', 'Montserrat', 'Playfair Display'];

export default function DesignTab({ config, setConfig, onOpenThemeSelector }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="card card-padding">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="heading-2">Estilo Visual</h2>
                        <p className="body-small text-gray-600 mt-1">Define la paleta cromática y tipografía</p>
                    </div>
                    <button type="button" onClick={onOpenThemeSelector} className="btn btn-secondary">
                        <Sparkles size={16} /> Explorar Temas
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Colores */}
                    <div>
                        <h3 className="caption text-gray-500 mb-4">Paleta de Colores</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {COLORS.map(color => (
                                <div key={color.key} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <label className="caption text-gray-600 mb-3 block">{color.label}</label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={config[color.key]} onChange={e => setConfig(p => ({ ...p, [color.key]: e.target.value }))} className="w-12 h-12 rounded border border-gray-300 cursor-pointer" />
                                        <input type="text" value={config[color.key]} onChange={e => setConfig(p => ({ ...p, [color.key]: e.target.value }))} className="flex-1 input text-sm font-mono uppercase" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tipografía */}
                    <div>
                        <h3 className="caption text-gray-500 mb-4">Tipografía</h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <label className="caption text-gray-600 mb-3 block">Fuente Principal</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {BODY_FONTS.map(font => (
                                        <button key={font} type="button" onClick={() => setConfig(p => ({ ...p, fontFamily: font }))}
                                            className={`px-3 py-2 rounded text-xs font-medium transition-all ${config.fontFamily === font ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                                            {font}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <label className="caption text-gray-600 mb-3 block">Fuente Títulos</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {HEADING_FONTS.map(font => (
                                        <button key={font} type="button" onClick={() => setConfig(p => ({ ...p, fontHeading: font }))}
                                            className={`px-3 py-2 rounded text-xs font-medium transition-all ${config.fontHeading === font ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                                            {font}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-white rounded-md border border-gray-200">
                                <p className="caption text-gray-500 mb-3">Vista Previa</p>
                                <h4 className="text-2xl mb-2" style={{ fontFamily: config.fontHeading }}>Título de Ejemplo</h4>
                                <p className="text-sm text-gray-600" style={{ fontFamily: config.fontFamily }}>Este es un ejemplo de cómo se verá el texto en tu sitio web.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
