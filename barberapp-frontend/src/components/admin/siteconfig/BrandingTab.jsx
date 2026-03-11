// Tab: Identidad (Branding)
import { Globe, Image as ImageIcon, MapPin, Phone, Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * BrandingTab
 * Props: config, setConfig, logoInputRef, uploadingLogo
 */
export default function BrandingTab({ config, setConfig, logoInputRef, uploadingLogo }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
            {/* Información Principal */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                <h2 className="heading-3 mb-8 flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    Información Principal
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="label mb-2 block">Nombre Comercial</label>
                        <input type="text" value={config.nombre} onChange={e => setConfig(p => ({ ...p, nombre: e.target.value }))} className="input" />
                    </div>
                    <div>
                        <label className="label mb-2 block">Dirección Física</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={config.direccion} onChange={e => setConfig(p => ({ ...p, direccion: e.target.value }))} className="input" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                    </div>
                    <div>
                        <label className="label mb-2 flex items-center gap-2">
                            Teléfono
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-200">
                                WhatsApp
                            </span>
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={config.telefono} onChange={e => setConfig(p => ({ ...p, telefono: e.target.value }))} className="input" placeholder="+56912345678" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <p className="caption text-gray-400 mt-1.5 flex items-center gap-1">
                            <span className="text-green-500 font-bold">●</span>
                            Este número activa el botón de WhatsApp en tu página web
                        </p>
                    </div>
                </div>
            </div>

            {/* Logo */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none flex flex-col items-center">
                <h2 className="heading-3 mb-8 self-start flex items-center gap-2">
                    <ImageIcon size={20} className="text-blue-600" />
                    Identidad Visual
                </h2>
                <div className="relative group w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center mb-6 hover:border-blue-500 transition-colors">
                    {config.logoUrl ? (
                        <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <ImageIcon size={32} className="mb-2" />
                            <span className="caption">Sin Logo</span>
                        </div>
                    )}
                    {uploadingLogo && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
                <div className="w-full max-w-xs space-y-3">
                    <button type="button" onClick={() => logoInputRef.current.click()} disabled={uploadingLogo} className="btn btn-secondary w-full">
                        <Upload size={16} />
                        {uploadingLogo ? 'Subiendo...' : 'Subir Logo'}
                    </button>
                    <input type="text" value={config.logoUrl} onChange={e => setConfig(p => ({ ...p, logoUrl: e.target.value }))} placeholder="O pega la URL aquí..." className="input text-sm" />
                    <p className="body-small text-gray-500">Recomendado: PNG transparente, 1:1 o horizontal</p>
                </div>
            </div>
        </motion.div>
    );
}
