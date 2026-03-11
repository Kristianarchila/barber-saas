// Tab: Contenido (Hero + Galería)
import { motion } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

export default function ContentTab({ config, setConfig, newImageUrl, setNewImageUrl, addGalleryImage, removeGalleryImage, galleryInputRef, uploadingGallery }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Messages */}
            <div className="card card-padding">
                <h2 className="heading-3 mb-6">Mensajes del Hero</h2>
                <div className="space-y-4">
                    <div>
                        <label className="label mb-2 block">Título Principal</label>
                        <input type="text" value={config.heroTitle} onChange={e => setConfig(p => ({ ...p, heroTitle: e.target.value }))} placeholder="Ej: CALIDAD Y ESTILO" className="input" />
                    </div>
                    <div>
                        <label className="label mb-2 block">Badge</label>
                        <input type="text" value={config.badge} onChange={e => setConfig(p => ({ ...p, badge: e.target.value }))} className="input" />
                    </div>
                    <div>
                        <label className="label mb-2 block">Mensaje de Bienvenida</label>
                        <textarea value={config.mensajeBienvenida} onChange={e => setConfig(p => ({ ...p, mensajeBienvenida: e.target.value }))} rows={4} className="input textarea" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                        <div>
                            <label className="label mb-2 block">Año de Fundación</label>
                            <input type="text" value={config.yearEstablished} onChange={e => setConfig(p => ({ ...p, yearEstablished: e.target.value }))} placeholder="2026" className="input text-sm font-mono" />
                            <p className="caption text-gray-400 mt-1">EST. {config.yearEstablished}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                        <div>
                            <label className="label mb-2 block">Botón 1</label>
                            <input type="text" value={config.ctaPrimary} onChange={e => setConfig(p => ({ ...p, ctaPrimary: e.target.value }))} className="input text-sm" />
                        </div>
                        <div>
                            <label className="label mb-2 block">Botón 2</label>
                            <input type="text" value={config.ctaSecondary} onChange={e => setConfig(p => ({ ...p, ctaSecondary: e.target.value }))} className="input text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className="lg:col-span-2 card card-padding">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="heading-3">Galería del Hero</h2>
                    <span className="caption bg-gray-100 px-3 py-1 rounded-full">{config.galeria.length} / 10 Fotos</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 flex gap-2">
                        <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Pega la URL de una imagen..." className="input flex-1" />
                        <button onClick={addGalleryImage} className="btn btn-ghost"><Plus size={20} /></button>
                    </div>
                    <button onClick={() => galleryInputRef.current.click()} disabled={uploadingGallery} className="btn btn-primary">
                        {uploadingGallery ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        Subir Foto
                    </button>
                </div>
                {config.galeria.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
                        <ImageIcon size={32} className="mb-3 opacity-50" />
                        <p className="caption">Galería Vacía</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {config.galeria.map((url, index) => (
                            <motion.div layout key={index} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={url} alt={`Hero ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => removeGalleryImage(index)} className="bg-red-600 p-2 rounded-lg text-white hover:bg-red-700">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
