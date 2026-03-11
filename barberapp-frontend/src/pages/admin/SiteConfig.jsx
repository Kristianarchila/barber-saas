// === ARCHIVO: pages/admin/SiteConfig.jsx ===
// Refactored: 1291 lines → ~80 lines. Lógica en useSiteConfig, UI en siteconfig/*.jsx
import { useState } from 'react';
import { Save, Globe, Palette, Monitor, Layout, Mail, BarChart2, Settings, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { useSiteConfig } from '../../hooks/useSiteConfig';
import { themePresets } from '../../config/themePresets';
import ThemePreview from '../../components/admin/ThemePreview';

import BrandingTab  from '../../components/admin/siteconfig/BrandingTab';
import DesignTab    from '../../components/admin/siteconfig/DesignTab';
import PlantillaTab from '../../components/admin/siteconfig/PlantillaTab';
import ContentTab   from '../../components/admin/siteconfig/ContentTab';
import ReviewsTab   from '../../components/admin/siteconfig/ReviewsTab';
import EmailsTab    from '../../components/admin/siteconfig/EmailsTab';
import AdvancedTab  from '../../components/admin/siteconfig/AdvancedTab';

const TABS = [
    { id: 'branding',  label: 'Identidad', icon: Globe    },
    { id: 'design',    label: 'Diseño',    icon: Palette  },
    { id: 'plantilla', label: 'Plantilla', icon: Monitor  },
    { id: 'content',   label: 'Contenido', icon: Layout   },
    { id: 'emails',    label: 'Emails',    icon: Mail     },
    { id: 'reviews',   label: 'Reseñas',   icon: BarChart2},
    { id: 'advanced',  label: 'Avanzado',  icon: Settings },
];

export default function SiteConfig() {
    const [activeTab, setActiveTab] = useState('branding');

    const {
        loading, saving, config, setConfig,
        newImageUrl, setNewImageUrl,
        uploadingLogo, uploadingGallery,
        showThemeSelector, setShowThemeSelector, selectedTheme,
        logoInputRef, galleryInputRef, emailBannerInputRef,
        handleSave, handleLogoUpload, handleGalleryUpload, handleEmailBannerUpload,
        addGalleryImage, removeGalleryImage, applyTheme
    } = useSiteConfig();

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="space-y-6">
            {/* Hidden file inputs */}
            <input type="file" ref={logoInputRef}        onChange={handleLogoUpload}       className="hidden" accept="image/*" />
            <input type="file" ref={galleryInputRef}     onChange={handleGalleryUpload}    className="hidden" accept="image/*" />
            <input type="file" ref={emailBannerInputRef} onChange={handleEmailBannerUpload} className="hidden" accept="image/*" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Configuración Web</h1>
                    <p className="body text-gray-600 mt-2">Personaliza la experiencia de tu barbería</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 bg-white/50 sticky top-0 z-20 backdrop-blur-md -mx-6 px-6">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'}`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[60vh]">
                {activeTab === 'branding'  && <BrandingTab  config={config} setConfig={setConfig} logoInputRef={logoInputRef} uploadingLogo={uploadingLogo} />}
                {activeTab === 'design'    && <DesignTab    config={config} setConfig={setConfig} onOpenThemeSelector={() => setShowThemeSelector(true)} />}
                {activeTab === 'plantilla' && <PlantillaTab config={config} setConfig={setConfig} />}
                {activeTab === 'content'   && <ContentTab   config={config} setConfig={setConfig} newImageUrl={newImageUrl} setNewImageUrl={setNewImageUrl} addGalleryImage={addGalleryImage} removeGalleryImage={removeGalleryImage} galleryInputRef={galleryInputRef} uploadingGallery={uploadingGallery} />}
                {activeTab === 'reviews'   && <ReviewsTab   config={config} setConfig={setConfig} />}
                {activeTab === 'emails'    && <EmailsTab    config={config} setConfig={setConfig} emailBannerInputRef={emailBannerInputRef} handleEmailBannerUpload={handleEmailBannerUpload} />}
                {activeTab === 'advanced'  && <AdvancedTab  config={config} setConfig={setConfig} />}
            </div>

            {/* Theme Selector Modal */}
            <AnimatePresence>
                {showThemeSelector && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowThemeSelector(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="modal-content max-w-5xl">
                            <div className="modal-header">
                                <div>
                                    <h2 className="modal-title flex items-center gap-2"><Sparkles className="text-blue-600" size={20} /> Temas Predefinidos</h2>
                                    <p className="body-small text-gray-600 mt-1">Selecciona un esquema de colores para tu barbería</p>
                                </div>
                                <button onClick={() => setShowThemeSelector(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                            </div>
                            <div className="modal-body">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {themePresets.map(theme => <ThemePreview key={theme.id} theme={theme} isSelected={selectedTheme?.id === theme.id} onSelect={applyTheme} />)}
                                </div>
                            </div>
                            <div className="modal-footer justify-center">
                                <p className="body-small text-gray-500">💡 Puedes personalizar los colores manualmente después de aplicar un tema</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
