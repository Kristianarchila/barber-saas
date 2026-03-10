import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Palette, Layout, Instagram, Facebook, Search, BarChart2, Loader2, Upload, MapPin, Phone, Sparkles, Globe, Settings, Smartphone, X, Lock, Monitor, Mail, Check, Image, UploadCloud, Info } from 'lucide-react';
import barberiaService from '../../services/barberiaService';
import uploadService from '../../services/uploadService';
import { compressImage, validateImageFile } from '../../utils/imageCompression';
import { motion } from 'framer-motion';
import { themePresets } from '../../config/themePresets';
import ThemePreview from '../../components/admin/ThemePreview';
import { toast } from 'react-hot-toast';
import { getAvailableTemplates } from '../../config/templateRegistry';

export default function SiteConfig() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        logoUrl: '',
        colorPrincipal: '#3B82F6',
        colorAccent: '#2563EB',
        colorSuccess: '#10B981',
        colorWarning: '#F59E0B',
        colorLight: '#F9FAFB',
        colorDark: '#111827',
        fontFamily: 'Inter',
        fontHeading: 'Inter',
        mensajeBienvenida: '',
        heroTitle: '',
        badge: 'ESTUDIO Y EXCELENCIA',
        ctaPrimary: 'Reservar Turno',
        ctaSecondary: 'Ver Servicios',
        yearEstablished: '2026',
        instagram: '',
        facebook: '',
        googleMapsUrl: '',
        seoTitle: '',
        seoDescription: '',
        faviconUrl: '',
        analyticsId: '',
        pixelId: '',
        template: 'modern',
        galeria: [],
        politicasCancelacion: {
            horasMinimas: 24,
            limiteMensual: 3,
            diasBloqueo: 7
        },
        emailConfig: {
            enviarConfirmacion: true,
            enviarRecordatorio: true,
            horasAntesRecordatorio: 24,
            solicitarResena: true
        },
        configuracionResenas: {
            habilitadas: true,
            moderacionAutomatica: false,
            calificacionMinima: 1,
            permitirRespuestas: true,
            mostrarEnWeb: true
        },
        emailDesign: 'modern',
        emailBannerUrl: ''
    });

    const [newImageUrl, setNewImageUrl] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [activeTab, setActiveTab] = useState('branding');

    const logoInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const emailBannerInputRef = useRef(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            validateImageFile(file);
            const compressedFile = await compressImage(file, { maxSizeMB: 8, maxWidthOrHeight: 800 });
            const data = await uploadService.uploadLogo(compressedFile);
            if (data.success) {
                setConfig({ ...config, logoUrl: data.url });
                toast.success('Logo subido exitosamente');
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error(error.message || 'Error al subir el logo. Verifica que Cloudinary esté configurado.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingGallery(true);
        try {
            validateImageFile(file);
            const compressedFile = await compressImage(file, { maxSizeMB: 8, maxWidthOrHeight: 1920 });
            const data = await uploadService.uploadGallery(compressedFile);
            if (data.success) {
                setConfig({ ...config, galeria: [...config.galeria, data.url] });
                toast.success('Imagen agregada a la galería');
            }
        } catch (error) {
            console.error('Error uploading gallery image:', error);
            toast.error(error.message || 'Error al subir la imagen. Verifica que Cloudinary esté configurado.');
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleEmailBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSaving(true);
        try {
            validateImageFile(file);
            const compressedFile = await compressImage(file, { maxSizeMB: 2, maxWidthOrHeight: 1200 });
            const data = await uploadService.uploadGallery(compressedFile); // Reuse gallery upload logic
            if (data.success) {
                setConfig(prev => ({ ...prev, emailBannerUrl: data.url }));
                toast.success('Banner de email actualizado');
            }
        } catch (error) {
            console.error('Error uploading email banner:', error);
            toast.error(error.message || 'Error al subir el banner.');
        } finally {
            setSaving(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const data = await barberiaService.getMiBarberia();
            if (data.barberia) {
                setConfig({
                    nombre: data.barberia.nombre || '',
                    direccion: data.barberia.direccion || '',
                    telefono: data.barberia.telefono || '',
                    logoUrl: data.barberia.configuracion?.logoUrl || '',
                    colorPrincipal: data.barberia.configuracion?.colorPrincipal || '#3B82F6',
                    colorAccent: data.barberia.configuracion?.colorAccent || '#2563EB',
                    colorSuccess: data.barberia.configuracion?.colorSuccess || '#10B981',
                    colorWarning: data.barberia.configuracion?.colorWarning || '#F59E0B',
                    colorLight: data.barberia.configuracion?.colorLight || '#F9FAFB',
                    colorDark: data.barberia.configuracion?.colorDark || '#111827',
                    fontFamily: data.barberia.configuracion?.fontFamily || 'Inter',
                    fontHeading: data.barberia.configuracion?.fontHeading || 'Inter',
                    mensajeBienvenida: data.barberia.configuracion?.mensajeBienvenida || '',
                    heroTitle: data.barberia.configuracion?.heroTitle || '',
                    badge: data.barberia.configuracion?.badge || 'ESTUDIO Y EXCELENCIA',
                    ctaPrimary: data.barberia.configuracion?.ctaPrimary || 'Reservar Turno',
                    ctaSecondary: data.barberia.configuracion?.ctaSecondary || 'Ver Servicios',
                    yearEstablished: data.barberia.configuracion?.yearEstablished || '2026',
                    instagram: data.barberia.configuracion?.instagram || '',
                    facebook: data.barberia.configuracion?.facebook || '',
                    googleMapsUrl: data.barberia.configuracion?.googleMapsUrl || '',
                    seoTitle: data.barberia.configuracion?.seoTitle || '',
                    seoDescription: data.barberia.configuracion?.seoDescription || '',
                    faviconUrl: data.barberia.configuracion?.faviconUrl || '',
                    analyticsId: data.barberia.configuracion?.analyticsId || '',
                    pixelId: data.barberia.configuracion?.pixelId || '',
                    template: data.barberia.configuracion?.template || 'modern',
                    galeria: data.barberia.configuracion?.galeria || [],
                    politicasCancelacion: data.barberia.politicasCancelacion || {
                        horasMinimas: 24,
                        limiteMensual: 3,
                        diasBloqueo: 7
                    },
                    emailConfig: data.barberia.emailConfig || {
                        enviarConfirmacion: true,
                        enviarRecordatorio: true,
                        horasAntesRecordatorio: 24,
                        solicitarResena: true
                    },
                    configuracionResenas: data.barberia.configuracion?.configuracionResenas || {
                        habilitadas: true,
                        moderacionAutomatica: false,
                        calificacionMinima: 1,
                        permitirRespuestas: true,
                        mostrarEnWeb: true
                    },
                    emailDesign: data.barberia.configuracion?.emailDesign || 'modern',
                    emailBannerUrl: data.barberia.configuracion?.emailBannerUrl || ''
                });
            }
        } catch (error) {
            console.error('Error al cargar la configuración:', error);
            alert('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await barberiaService.updateConfiguracion(config);
            toast.success('Configuración actualizada correctamente');
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const addGalleryImage = () => {
        if (!newImageUrl) return;
        if (!/^https?:\/\/.+/.test(newImageUrl)) {
            toast.error('URL de imagen no válida');
            return;
        }
        setConfig(prev => ({
            ...prev,
            galeria: [...prev.galeria, newImageUrl]
        }));
        setNewImageUrl('');
        toast.success('Imagen agregada');
    };

    const removeGalleryImage = (index) => {
        setConfig(prev => ({
            ...prev,
            galeria: prev.galeria.filter((_, i) => i !== index)
        }));
    };

    const applyTheme = (theme) => {
        setConfig(prev => ({
            ...prev,
            colorPrincipal: theme.colorPrimary,
            colorAccent: theme.colorAccent,
            colorSuccess: theme.colorSuccess || '#10B981',
            colorWarning: theme.colorWarning || '#F59E0B',
            colorLight: theme.colorLight || '#F9FAFB',
            colorDark: theme.colorDark || '#111827',
            fontFamily: theme.fontFamily || 'Inter',
            fontHeading: theme.fontHeading || 'Inter'
        }));
        setSelectedTheme(theme);
        setShowThemeSelector(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
            <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" accept="image/*" />

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-1">Configuración Web</h1>
                    <p className="body text-gray-600 mt-2">Personaliza la experiencia de tu barbería</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* TABS */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 bg-white/50 sticky top-0 z-20 backdrop-blur-md -mx-6 px-6">
                {[
                    { id: 'branding', label: 'Identidad', icon: Globe },
                    { id: 'design', label: 'Diseño', icon: Palette },
                    { id: 'plantilla', label: 'Plantilla', icon: Monitor },
                    { id: 'content', label: 'Contenido', icon: Layout },
                    { id: 'emails', label: 'Emails', icon: Mail },
                    { id: 'reviews', label: 'Reseñas', icon: BarChart2 },
                    { id: 'advanced', label: 'Avanzado', icon: Settings }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="min-h-[60vh]">
                {/* BRANDING TAB */}
                {activeTab === 'branding' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6"
                    >
                        {/* Información Principal */}
                        <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                            <h2 className="heading-3 mb-8 flex items-center gap-2">
                                <Globe size={20} className="text-blue-600" />
                                Información Principal
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="label mb-2 block">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        value={config.nombre}
                                        onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Dirección Física</label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={config.direccion}
                                            onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                                            className="input"
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label mb-2 flex items-center gap-2">
                                        Teléfono
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-200">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.133 1.535 5.854L0 24l6.27-1.517A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.368l-.359-.213-3.724.9.945-3.632-.234-.374A9.818 9.818 0 1112 21.818z" /></svg>
                                            WhatsApp
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={config.telefono}
                                            onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                                            className="input"
                                            placeholder="+56912345678"
                                            style={{ paddingLeft: '2.5rem' }}
                                        />
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
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current.click()}
                                    disabled={uploadingLogo}
                                    className="btn btn-secondary w-full"
                                >
                                    <Upload size={16} />
                                    {uploadingLogo ? 'Subiendo...' : 'Subir Logo'}
                                </button>
                                <input
                                    type="text"
                                    value={config.logoUrl}
                                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                                    placeholder="O pega la URL aquí..."
                                    className="input text-sm"
                                />
                                <p className="body-small text-gray-500">Recomendado: PNG transparente, 1:1 o horizontal</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* DESIGN TAB */}
                {activeTab === 'design' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="card card-padding">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="heading-2">Estilo Visual</h2>
                                    <p className="body-small text-gray-600 mt-1">Define la paleta cromática y tipografía</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowThemeSelector(true)}
                                    className="btn btn-secondary"
                                >
                                    <Sparkles size={16} />
                                    Explorar Temas
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Paleta de Colores */}
                                <div>
                                    <h3 className="caption text-gray-500 mb-4">Paleta de Colores</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Principal', key: 'colorPrincipal' },
                                            { label: 'Acento', key: 'colorAccent' },
                                            { label: 'Éxito', key: 'colorSuccess' },
                                            { label: 'Alerta', key: 'colorWarning' },
                                            { label: 'Fondo Claro', key: 'colorLight' },
                                            { label: 'Fondo Oscuro', key: 'colorDark' }
                                        ].map((color) => (
                                            <div key={color.key} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                                <label className="caption text-gray-600 mb-3 block">{color.label}</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={config[color.key]}
                                                        onChange={(e) => setConfig({ ...config, [color.key]: e.target.value })}
                                                        className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={config[color.key]}
                                                        onChange={(e) => setConfig({ ...config, [color.key]: e.target.value })}
                                                        className="flex-1 input text-sm font-mono uppercase"
                                                    />
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
                                                {['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Outfit', 'Playfair Display'].map(font => (
                                                    <button
                                                        key={font}
                                                        type="button"
                                                        onClick={() => setConfig({ ...config, fontFamily: font })}
                                                        className={`px-3 py-2 rounded text-xs font-medium transition-all ${config.fontFamily === font
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        {font}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <label className="caption text-gray-600 mb-3 block">Fuente Títulos</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Inter', 'Bebas Neue', 'Oswald', 'Anton', 'Montserrat', 'Playfair Display'].map(font => (
                                                    <button
                                                        key={font}
                                                        type="button"
                                                        onClick={() => setConfig({ ...config, fontHeading: font })}
                                                        className={`px-3 py-2 rounded text-xs font-medium transition-all ${config.fontHeading === font
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        {font}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        <div className="p-4 bg-white rounded-md border border-gray-200">
                                            <p className="caption text-gray-500 mb-3">Vista Previa</p>
                                            <h4 className="text-2xl mb-2" style={{ fontFamily: config.fontHeading }}>Título de Ejemplo</h4>
                                            <p className="text-sm text-gray-600" style={{ fontFamily: config.fontFamily }}>
                                                Este es un ejemplo de cómo se verá el texto en tu sitio web.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* PLANTILLA TAB */}
                {activeTab === 'plantilla' && (() => {
                    const plan = 'pro'; // TODO: get from barberia.plan via useBarberia context
                    const templates = getAvailableTemplates(plan);
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-6"
                        >
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
                                            if (t.locked) {
                                                toast(`🚀 Requiere ${t.plan === 'pro' ? 'Plan Pro' : 'Plan Premium'} para activar esta plantilla`, { icon: '🔒' });
                                                return;
                                            }
                                            setConfig(prev => ({ ...prev, template: t.key }));
                                            toast.success(`Plantilla "${t.name}" seleccionada. Guarda los cambios para aplicarla.`);
                                        }}
                                        className={`relative text-left border-2 rounded-2xl p-5 transition-all ${config.template === t.key
                                            ? 'border-blue-600 bg-blue-50 shadow-md'
                                            : t.locked
                                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                : 'border-gray-200 hover:border-blue-400 hover:shadow-sm cursor-pointer'
                                            }`}
                                    >
                                        {/* Preview placeholder */}
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
                                                    <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                        {tag}
                                                    </span>
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
                })()}

                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Hero Messages */}
                        <div className="card card-padding">
                            <h2 className="heading-3 mb-6">Mensajes del Hero</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="label mb-2 block">Título Principal</label>
                                    <input
                                        type="text"
                                        value={config.heroTitle}
                                        onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                                        placeholder="Ej: CALIDAD Y ESTILO"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Badge</label>
                                    <input
                                        type="text"
                                        value={config.badge}
                                        onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Mensaje de Bienvenida</label>
                                    <textarea
                                        value={config.mensajeBienvenida}
                                        onChange={(e) => setConfig({ ...config, mensajeBienvenida: e.target.value })}
                                        rows={4}
                                        className="input textarea"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                                    <div>
                                        <label className="label mb-2 block">Año de Fundación</label>
                                        <input
                                            type="text"
                                            value={config.yearEstablished}
                                            onChange={(e) => setConfig({ ...config, yearEstablished: e.target.value })}
                                            placeholder="Ej: 2026"
                                            className="input text-sm font-mono"
                                        />
                                        <p className="caption text-gray-400 mt-1">Se muestra como EST. {config.yearEstablished}</p>
                                    </div>
                                    <div className="opacity-0 pointer-events-none">
                                        <label className="label mb-2 block">Space</label>
                                        <input className="input" disabled />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                                    <div>
                                        <label className="label mb-2 block">Botón 1</label>
                                        <input
                                            type="text"
                                            value={config.ctaPrimary}
                                            onChange={(e) => setConfig({ ...config, ctaPrimary: e.target.value })}
                                            className="input text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="label mb-2 block">Botón 2</label>
                                        <input
                                            type="text"
                                            value={config.ctaSecondary}
                                            onChange={(e) => setConfig({ ...config, ctaSecondary: e.target.value })}
                                            className="input text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="lg:col-span-2 card card-padding">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="heading-3">Galería del Hero</h2>
                                <span className="caption bg-gray-100 px-3 py-1 rounded-full">
                                    {config.galeria.length} / 10 Fotos
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder="Pega la URL de una imagen..."
                                        className="input flex-1"
                                    />
                                    <button
                                        onClick={addGalleryImage}
                                        className="btn btn-ghost"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => galleryInputRef.current.click()}
                                    disabled={uploadingGallery}
                                    className="btn btn-primary"
                                >
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
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6"
                    >
                        <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                            <h2 className="heading-3 mb-8 flex items-center gap-2">
                                <BarChart2 size={20} className="text-blue-600" />
                                Configuración de Reseñas
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900">Habilitar Reseñas</p>
                                        <p className="text-xs text-gray-500">Permite que los clientes califiquen tus servicios</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({
                                            ...config,
                                            configuracionResenas: { ...config.configuracionResenas, habilitadas: !config.configuracionResenas.habilitadas }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.configuracionResenas.habilitadas ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.configuracionResenas.habilitadas ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900">Mostrar en Web Pública</p>
                                        <p className="text-xs text-gray-500">Muestra la sección de reseñas en tu sitio web</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({
                                            ...config,
                                            configuracionResenas: { ...config.configuracionResenas, mostrarEnWeb: !config.configuracionResenas.mostrarEnWeb }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.configuracionResenas.mostrarEnWeb ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.configuracionResenas.mostrarEnWeb ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900">Moderación Automática</p>
                                        <p className="text-xs text-gray-500">Aprobar automáticamente todas las reseñas nuevas</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({
                                            ...config,
                                            configuracionResenas: { ...config.configuracionResenas, moderacionAutomatica: !config.configuracionResenas.moderacionAutomatica }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.configuracionResenas.moderacionAutomatica ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.configuracionResenas.moderacionAutomatica ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900">Permitir Respuestas</p>
                                        <p className="text-xs text-gray-500">Habilita la posibilidad de responder a reseñas desde el panel</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({
                                            ...config,
                                            configuracionResenas: { ...config.configuracionResenas, permitirRespuestas: !config.configuracionResenas.permitirRespuestas }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${config.configuracionResenas.permitirRespuestas ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.configuracionResenas.permitirRespuestas ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                            <h2 className="heading-3 mb-8 flex items-center gap-2">
                                <Sparkles size={20} className="text-blue-600" />
                                Políticas de Publicación
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="label mb-2 block">Calificación mínima para mostrar automáticamente</label>
                                    <select
                                        value={config.configuracionResenas.calificacionMinima}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            configuracionResenas: { ...config.configuracionResenas, calificacionMinima: parseInt(e.target.value) }
                                        })}
                                        className="input"
                                    >
                                        <option value={1}>Mostrar todas (1+ estrellas)</option>
                                        <option value={2}>Mínimo 2 estrellas</option>
                                        <option value={3}>Mínimo 3 estrellas</option>
                                        <option value={4}>Mínimo 4 estrellas</option>
                                        <option value={5}>Solo 5 estrellas</option>
                                    </select>
                                    <p className="caption text-gray-500 mt-2 italic">
                                        * Solo aplica si la moderación automática está activada.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-800 font-medium">
                                        💡 Tip: Puedes gestionar, aprobar y responder a las reseñas directamente desde la sección <strong>Marketing &gt; Reseñas</strong> en el menú lateral.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* EMAILS TAB */}
                {activeTab === 'emails' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6"
                    >
                        {/* Design Selection */}
                        <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                            <h2 className="heading-3 mb-8 flex items-center gap-2">
                                <Mail size={20} className="text-blue-600" />
                                Estilo de Emails
                            </h2>
                            <p className="text-sm text-gray-500 mb-6 font-medium">
                                Elige cómo verán tus clientes los correos de recuperación de contraseña y notificaciones.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { id: 'modern', name: 'Modern', desc: 'Limpio, degradados vibrantes, estilo tech.', preview: '✂️' },
                                    { id: 'vintage', name: 'Vintage', desc: 'Clásico, tonos sepia, estilo tradicional.', preview: '💈' },
                                    { id: 'luxury', name: 'Luxury', desc: 'Minimalista, dorado y negro, muy elegante.', preview: '💎' }
                                ].map((design) => (
                                    <button
                                        key={design.id}
                                        onClick={() => setConfig({ ...config, emailDesign: design.id })}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${config.emailDesign === design.id
                                            ? 'border-blue-600 bg-blue-50/50 shadow-md'
                                            : 'border-gray-100 hover:border-blue-200'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-lg text-2xl ${design.id === 'modern' ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' :
                                            design.id === 'vintage' ? 'bg-[#f5f1e9] text-[#d4af37] border border-[#d4af37]' :
                                                'bg-black text-[#c5a059]'
                                            }`}>
                                            {design.preview}
                                        </div>
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

                        {/* Banner & Branding */}
                        <div className="card card-padding shadow-sm ring-1 ring-gray-100 border-none">
                            <h2 className="heading-3 mb-8 flex items-center gap-2">
                                <Image size={20} className="text-blue-600" />
                                Imagen de Cabecera
                            </h2>
                            <p className="text-sm text-gray-500 mb-6 font-medium">
                                Esta imagen aparecerá en la parte superior de tus correos. Recomendamos usar tu logo o una foto de tu equipo.
                            </p>

                            <div className="space-y-6">
                                <div className="p-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 aspect-[2/1] relative overflow-hidden group">
                                    {config.emailBannerUrl ? (
                                        <>
                                            <img
                                                src={config.emailBannerUrl}
                                                alt="Email Banner"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => emailBannerInputRef.current?.click()}
                                                    className="p-2 bg-white rounded-full text-gray-900 hover:bg-blue-50"
                                                >
                                                    <Upload size={20} />
                                                </button>
                                                <button
                                                    onClick={() => setConfig({ ...config, emailBannerUrl: '' })}
                                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => emailBannerInputRef.current?.click()}
                                            className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-white transition-all"
                                        >
                                            <UploadCloud size={48} className="mb-2" />
                                            <span className="text-sm font-bold">Subir Banner</span>
                                            <span className="text-xs">JPG, PNG o WEBP (Máx 2MB)</span>
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={emailBannerInputRef}
                                        onChange={handleEmailBannerUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                    <Info size={20} className="text-amber-600 shrink-0" />
                                    <p className="text-xs text-amber-800 italic">
                                        Consejo: Los diseños <strong>Modern</strong> y <strong>Luxury</strong> funcionan mejor con logos en fondo transparente. El diseño <strong>Vintage</strong> luce genial con fotos cuadradas del equipo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {activeTab === 'advanced' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* SEO */}
                        <div className="card card-padding">
                            <h2 className="heading-3 mb-6">SEO y Metadatos</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="label mb-2 block">Título SEO</label>
                                    <input
                                        type="text"
                                        value={config.seoTitle}
                                        onChange={(e) => setConfig({ ...config, seoTitle: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Meta Descripción</label>
                                    <textarea
                                        value={config.seoDescription}
                                        onChange={(e) => setConfig({ ...config, seoDescription: e.target.value })}
                                        rows={3}
                                        className="input textarea"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-2 block">URL Favicon</label>
                                    <input
                                        type="text"
                                        value={config.faviconUrl}
                                        onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                                        className="input font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social & Analytics */}
                        <div className="space-y-6">
                            <div className="card card-padding">
                                <h2 className="heading-3 mb-6">Redes Sociales</h2>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="label mb-2 block">Instagram</label>
                                        <input
                                            type="text"
                                            value={config.instagram}
                                            onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                                            className="input text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="label mb-2 block">Facebook</label>
                                        <input
                                            type="text"
                                            value={config.facebook}
                                            onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                                            className="input text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label mb-2 block">Google Maps</label>
                                    <textarea
                                        value={config.googleMapsUrl}
                                        onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
                                        rows={2}
                                        className="input textarea text-sm"
                                    />
                                </div>
                            </div>

                            <div className="card card-padding">
                                <h2 className="heading-3 mb-6">Analítica</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label mb-2 block">Google Analytics</label>
                                        <input
                                            type="text"
                                            value={config.analyticsId}
                                            onChange={(e) => setConfig({ ...config, analyticsId: e.target.value })}
                                            placeholder="G-XXXXXXXXXX"
                                            className="input font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="label mb-2 block">Facebook Pixel</label>
                                        <input
                                            type="text"
                                            value={config.pixelId}
                                            onChange={(e) => setConfig({ ...config, pixelId: e.target.value })}
                                            placeholder="123456789..."
                                            className="input font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Políticas */}
                        <div className="card card-padding">
                            <h2 className="heading-3 mb-6">Políticas de Cancelación</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="label mb-2 block">Horas Mínimas para Cancelar</label>
                                    <input
                                        type="number"
                                        value={config.politicasCancelacion?.horasMinimas || 24}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            politicasCancelacion: {
                                                ...config.politicasCancelacion,
                                                horasMinimas: parseInt(e.target.value)
                                            }
                                        })}
                                        min={1}
                                        max={168}
                                        className="input"
                                    />
                                    <p className="body-small text-gray-500 mt-1">Tiempo mínimo antes de la cita</p>
                                </div>
                                <div>
                                    <label className="label mb-2 block">Límite Mensual de Cancelaciones</label>
                                    <input
                                        type="number"
                                        value={config.politicasCancelacion?.limiteMensual || 3}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            politicasCancelacion: {
                                                ...config.politicasCancelacion,
                                                limiteMensual: parseInt(e.target.value)
                                            }
                                        })}
                                        min={1}
                                        max={20}
                                        className="input"
                                    />
                                    <p className="body-small text-gray-500 mt-1">Máximo de cancelaciones por mes</p>
                                </div>
                                <div>
                                    <label className="label mb-2 block">Días de Bloqueo</label>
                                    <input
                                        type="number"
                                        value={config.politicasCancelacion?.diasBloqueo || 7}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            politicasCancelacion: {
                                                ...config.politicasCancelacion,
                                                diasBloqueo: parseInt(e.target.value)
                                            }
                                        })}
                                        min={1}
                                        max={365}
                                        className="input"
                                    />
                                    <p className="body-small text-gray-500 mt-1">Días de bloqueo al exceder límite</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Config */}
                        <div className="card card-padding">
                            <h2 className="heading-3 mb-6">Notificaciones por Email</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                                    <div>
                                        <label className="label">Emails de Confirmación</label>
                                        <p className="body-small text-gray-500 mt-1">Enviar al crear reserva</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={config.emailConfig?.enviarConfirmacion !== false}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            emailConfig: {
                                                ...config.emailConfig,
                                                enviarConfirmacion: e.target.checked
                                            }
                                        })}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                                    <div>
                                        <label className="label">Recordatorios Automáticos</label>
                                        <p className="body-small text-gray-500 mt-1">Enviar antes de la cita</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={config.emailConfig?.enviarRecordatorio !== false}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            emailConfig: {
                                                ...config.emailConfig,
                                                enviarRecordatorio: e.target.checked
                                            }
                                        })}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>

                                {config.emailConfig?.enviarRecordatorio !== false && (
                                    <div>
                                        <label className="label mb-2 block">Horas Antes del Recordatorio</label>
                                        <input
                                            type="number"
                                            value={config.emailConfig?.horasAntesRecordatorio || 24}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                emailConfig: {
                                                    ...config.emailConfig,
                                                    horasAntesRecordatorio: parseInt(e.target.value)
                                                }
                                            })}
                                            min={1}
                                            max={168}
                                            className="input"
                                        />
                                        <p className="body-small text-gray-500 mt-1">Default: 24 horas</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                                    <div>
                                        <label className="label">Solicitar Reseñas</label>
                                        <p className="body-small text-gray-500 mt-1">Pedir reseña post-servicio</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={config.emailConfig?.solicitarResena !== false}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            emailConfig: {
                                                ...config.emailConfig,
                                                solicitarResena: e.target.checked
                                            }
                                        })}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Theme Selector Modal */}
            {showThemeSelector && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay"
                    onClick={() => setShowThemeSelector(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="modal-content max-w-5xl"
                    >
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title flex items-center gap-2">
                                    <Sparkles className="text-blue-600" size={20} />
                                    Temas Predefinidos
                                </h2>
                                <p className="body-small text-gray-600 mt-1">
                                    Selecciona un esquema de colores para tu barbería
                                </p>
                            </div>
                            <button
                                onClick={() => setShowThemeSelector(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {themePresets.map((theme) => (
                                    <ThemePreview
                                        key={theme.id}
                                        theme={theme}
                                        isSelected={selectedTheme?.id === theme.id}
                                        onSelect={applyTheme}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer justify-center">
                            <p className="body-small text-gray-500">
                                💡 Puedes personalizar los colores manualmente después de aplicar un tema
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
