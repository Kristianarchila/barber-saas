// === HOOK: hooks/useSiteConfig.js ===
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import barberiaService from '../services/barberiaService';
import uploadService from '../services/uploadService';
import { compressImage, validateImageFile } from '../utils/imageCompression';

const DEFAULT_CONFIG = {
    nombre: '', direccion: '', telefono: '', logoUrl: '',
    colorPrincipal: '#3B82F6', colorAccent: '#2563EB', colorSuccess: '#10B981',
    colorWarning: '#F59E0B', colorLight: '#F9FAFB', colorDark: '#111827',
    fontFamily: 'Inter', fontHeading: 'Inter',
    mensajeBienvenida: '', heroTitle: '', badge: 'ESTUDIO Y EXCELENCIA',
    ctaPrimary: 'Reservar Turno', ctaSecondary: 'Ver Servicios', yearEstablished: '2026',
    instagram: '', facebook: '', googleMapsUrl: '',
    seoTitle: '', seoDescription: '', faviconUrl: '', analyticsId: '', pixelId: '',
    template: 'modern', galeria: [],
    politicasCancelacion: { horasMinimas: 24, limiteMensual: 3, diasBloqueo: 7 },
    emailConfig: { enviarConfirmacion: true, enviarRecordatorio: true, horasAntesRecordatorio: 24, solicitarResena: true },
    configuracionResenas: { habilitadas: true, moderacionAutomatica: false, calificacionMinima: 1, permitirRespuestas: true, mostrarEnWeb: true },
    emailDesign: 'modern', emailBannerUrl: ''
};

export function useSiteConfig() {
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [config, setConfig]     = useState(DEFAULT_CONFIG);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [uploadingLogo, setUploadingLogo]       = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [selectedTheme, setSelectedTheme]         = useState(null);

    const logoInputRef        = useRef(null);
    const galleryInputRef     = useRef(null);
    const emailBannerInputRef = useRef(null);

    useEffect(() => { fetchConfig(); }, []);

    const fetchConfig = async () => {
        try {
            const data = await barberiaService.getMiBarberia();
            if (data.barberia) {
                const b = data.barberia;
                const c = b.configuracion || {};
                setConfig({
                    nombre: b.nombre || '', direccion: b.direccion || '', telefono: b.telefono || '',
                    logoUrl: c.logoUrl || '', colorPrincipal: c.colorPrincipal || '#3B82F6',
                    colorAccent: c.colorAccent || '#2563EB', colorSuccess: c.colorSuccess || '#10B981',
                    colorWarning: c.colorWarning || '#F59E0B', colorLight: c.colorLight || '#F9FAFB',
                    colorDark: c.colorDark || '#111827', fontFamily: c.fontFamily || 'Inter',
                    fontHeading: c.fontHeading || 'Inter', mensajeBienvenida: c.mensajeBienvenida || '',
                    heroTitle: c.heroTitle || '', badge: c.badge || 'ESTUDIO Y EXCELENCIA',
                    ctaPrimary: c.ctaPrimary || 'Reservar Turno', ctaSecondary: c.ctaSecondary || 'Ver Servicios',
                    yearEstablished: c.yearEstablished || '2026', instagram: c.instagram || '',
                    facebook: c.facebook || '', googleMapsUrl: c.googleMapsUrl || '',
                    seoTitle: c.seoTitle || '', seoDescription: c.seoDescription || '',
                    faviconUrl: c.faviconUrl || '', analyticsId: c.analyticsId || '',
                    pixelId: c.pixelId || '', template: c.template || 'modern',
                    galeria: c.galeria || [],
                    politicasCancelacion: b.politicasCancelacion || { horasMinimas: 24, limiteMensual: 3, diasBloqueo: 7 },
                    emailConfig: b.emailConfig || { enviarConfirmacion: true, enviarRecordatorio: true, horasAntesRecordatorio: 24, solicitarResena: true },
                    configuracionResenas: c.configuracionResenas || { habilitadas: true, moderacionAutomatica: false, calificacionMinima: 1, permitirRespuestas: true, mostrarEnWeb: true },
                    emailDesign: c.emailDesign || 'modern', emailBannerUrl: c.emailBannerUrl || ''
                });
            }
        } catch (error) {
            console.error('Error al cargar la configuración:', error);
            toast.error('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e?.preventDefault();
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

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingLogo(true);
        try {
            validateImageFile(file);
            const compressed = await compressImage(file, { maxSizeMB: 8, maxWidthOrHeight: 800 });
            const data = await uploadService.uploadLogo(compressed);
            if (data.success) { setConfig(prev => ({ ...prev, logoUrl: data.url })); toast.success('Logo subido exitosamente'); }
        } catch (error) {
            toast.error(error.message || 'Error al subir el logo.');
        } finally { setUploadingLogo(false); }
    };

    const handleGalleryUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingGallery(true);
        try {
            validateImageFile(file);
            const compressed = await compressImage(file, { maxSizeMB: 8, maxWidthOrHeight: 1920 });
            const data = await uploadService.uploadGallery(compressed);
            if (data.success) { setConfig(prev => ({ ...prev, galeria: [...prev.galeria, data.url] })); toast.success('Imagen agregada a la galería'); }
        } catch (error) {
            toast.error(error.message || 'Error al subir la imagen.');
        } finally { setUploadingGallery(false); }
    };

    const handleEmailBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSaving(true);
        try {
            validateImageFile(file);
            const compressed = await compressImage(file, { maxSizeMB: 2, maxWidthOrHeight: 1200 });
            const data = await uploadService.uploadGallery(compressed);
            if (data.success) { setConfig(prev => ({ ...prev, emailBannerUrl: data.url })); toast.success('Banner de email actualizado'); }
        } catch (error) {
            toast.error(error.message || 'Error al subir el banner.');
        } finally { setSaving(false); }
    };

    const addGalleryImage = () => {
        if (!newImageUrl) return;
        if (!/^https?:\/\/.+/.test(newImageUrl)) { toast.error('URL de imagen no válida'); return; }
        setConfig(prev => ({ ...prev, galeria: [...prev.galeria, newImageUrl] }));
        setNewImageUrl('');
        toast.success('Imagen agregada');
    };

    const removeGalleryImage = (index) => setConfig(prev => ({ ...prev, galeria: prev.galeria.filter((_, i) => i !== index) }));

    const applyTheme = (theme) => {
        setConfig(prev => ({
            ...prev,
            colorPrincipal: theme.colorPrimary, colorAccent: theme.colorAccent,
            colorSuccess: theme.colorSuccess || '#10B981', colorWarning: theme.colorWarning || '#F59E0B',
            colorLight: theme.colorLight || '#F9FAFB', colorDark: theme.colorDark || '#111827',
            fontFamily: theme.fontFamily || 'Inter', fontHeading: theme.fontHeading || 'Inter'
        }));
        setSelectedTheme(theme);
        setShowThemeSelector(false);
    };

    return {
        loading, saving, config, setConfig, newImageUrl, setNewImageUrl,
        uploadingLogo, uploadingGallery,
        showThemeSelector, setShowThemeSelector, selectedTheme,
        logoInputRef, galleryInputRef, emailBannerInputRef,
        handleSave, handleLogoUpload, handleGalleryUpload, handleEmailBannerUpload,
        addGalleryImage, removeGalleryImage, applyTheme
    };
}
