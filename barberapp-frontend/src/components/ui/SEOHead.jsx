import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEOHead - Componente para SEO dinámico por barbería
 * Actualiza el <title> y <meta> tags según la barbería actual
 * 
 * @param {Object} barberia - Datos de la barbería
 */
export const SEOHead = ({ barberia }) => {
    const location = useLocation();

    useEffect(() => {
        if (!barberia) return;

        // Actualizar título
        const title = barberia.configuracion?.seoTitle || `${barberia.nombre} - Reserva tu cita online`;
        document.title = title;

        // Actualizar meta description
        const description = barberia.configuracion?.seoDescription
            || barberia.configuracion?.mensajeBienvenida
            || `Reserva tu cita en ${barberia.nombre}. Cortes profesionales y servicios de barbería de calidad.`;

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = description;

        // Actualizar Favicon
        if (barberia.configuracion?.faviconUrl) {
            let favicon = document.querySelector('link[rel="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = barberia.configuracion.faviconUrl;
        }

        // Open Graph tags para redes sociales
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:type', 'website');
        updateMetaTag('og:url', window.location.href);

        if (barberia.configuracion?.logoUrl) {
            updateMetaTag('og:image', barberia.configuracion.logoUrl);
        }

        // Twitter Card
        updateMetaTag('twitter:card', 'summary_large_image', 'name');
        updateMetaTag('twitter:title', title, 'name');
        updateMetaTag('twitter:description', description, 'name');

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.href;

    }, [barberia, location]);

    return null; // Este componente no renderiza nada
};

/**
 * Helper para actualizar o crear meta tags
 */
function updateMetaTag(property, content, attribute = 'property') {
    let meta = document.querySelector(`meta[${attribute}="${property}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
    }
    meta.content = content;
}
