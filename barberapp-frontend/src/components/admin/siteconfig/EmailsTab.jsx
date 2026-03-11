// Tab: Emails (Diseño + Banner)
import { motion } from 'framer-motion';
import { Mail, Image, Upload, Trash2, UploadCloud, Check, Info } from 'lucide-react';

const EMAIL_DESIGNS = [
    { id: 'modern',  name: 'Modern',  desc: 'Limpio, degradados vibrantes, estilo tech.',        preview: '✂️' },
    { id: 'vintage', name: 'Vintage', desc: 'Clásico, tonos sepia, estilo tradicional.',          preview: '💈' },
    { id: 'luxury',  name: 'Luxury',  desc: 'Minimalista, dorado y negro, muy elegante.',         preview: '💎' }
];

export default function EmailsTab({ config, setConfig, emailBannerInputRef, handleEmailBannerUpload }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
            {/* Estilo */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                <h2 className="heading-3 mb-8 flex items-center gap-2">
                    <Mail size={20} className="text-blue-600" /> Estilo de Emails
                </h2>
                <p className="text-sm text-gray-500 mb-6 font-medium">Elige cómo verán tus clientes los correos de confirmación y notificaciones.</p>
                <div className="space-y-4">
                    {EMAIL_DESIGNS.map(design => (
                        <button key={design.id} onClick={() => setConfig(p => ({ ...p, emailDesign: design.id }))}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${config.emailDesign === design.id ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
                        >
                            <div className={`w-12 h-12 flex items-center justify-center rounded-lg text-2xl ${
                                design.id === 'modern'  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' :
                                design.id === 'vintage' ? 'bg-[#f5f1e9] text-[#d4af37] border border-[#d4af37]' :
                                'bg-black text-[#c5a059]'
                            }`}>{design.preview}</div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900">{design.name}</p>
                                <p className="text-xs text-gray-500">{design.desc}</p>
                            </div>
                            {config.emailDesign === design.id && (
                                <div className="ml-auto w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Banner */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                <h2 className="heading-3 mb-8 flex items-center gap-2">
                    <Image size={20} className="text-blue-600" /> Imagen de Cabecera
                </h2>
                <p className="text-sm text-gray-500 mb-6 font-medium">Aparecerá en la parte superior de tus correos. Logo o foto del equipo.</p>

                <div className="space-y-6">
                    <div className="p-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 aspect-[2/1] relative overflow-hidden group">
                        {config.emailBannerUrl ? (
                            <>
                                <img src={config.emailBannerUrl} alt="Email Banner" className="w-full h-full object-cover rounded-xl" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => emailBannerInputRef.current?.click()} className="p-2 bg-white rounded-full text-gray-900 hover:bg-blue-50"><Upload size={20} /></button>
                                    <button onClick={() => setConfig(p => ({ ...p, emailBannerUrl: '' }))} className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"><Trash2 size={20} /></button>
                                </div>
                            </>
                        ) : (
                            <button onClick={() => emailBannerInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-white transition-all">
                                <UploadCloud size={48} className="mb-2" />
                                <span className="text-sm font-bold">Subir Banner</span>
                                <span className="text-xs">JPG, PNG o WEBP (Máx 2MB)</span>
                            </button>
                        )}
                        <input type="file" ref={emailBannerInputRef} onChange={handleEmailBannerUpload} className="hidden" accept="image/*" />
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                        <Info size={20} className="text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 italic">
                            <strong>Modern</strong> y <strong>Luxury</strong> funcionan mejor con logos transparentes. <strong>Vintage</strong> luce genial con fotos del equipo.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
