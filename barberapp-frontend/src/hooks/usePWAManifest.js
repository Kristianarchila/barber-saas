import { useEffect, useRef } from 'react';

/**
 * usePWAManifest — Inyecta manifest dinámico + favicon dinámico en el <head>
 *
 * • manifest → apunta al backend que genera el manifest específico de la barbería
 * • favicon  → cambia el ícono del tab del navegador al logo de la barbería
 *
 * Ambos se restauran al salir de la ruta pública.
 *
 * @param {string|null}  slug     - Slug de la barbería activa
 * @param {boolean}      ready    - Solo actuar cuando los datos estén listos
 * @param {string|null}  logoUrl  - URL del logo (Cloudinary u otro). Opcional.
 */
export function usePWAManifest(slug, ready = true, logoUrl = null) {
    const previousManifestHref = useRef(null);
    const previousFaviconHref = useRef(null);
    const injectedFavicon = useRef(null);

    // ── Manifest dinámico ────────────────────────────────────────────────────
    useEffect(() => {
        if (!slug || !ready) return;

        const manifestUrl = `/api/public/barberias/${slug}/manifest.json`;
        let linkEl = document.querySelector('link[rel="manifest"]');

        if (linkEl) {
            if (!previousManifestHref.current) {
                previousManifestHref.current = linkEl.getAttribute('href');
            }
            linkEl.setAttribute('href', manifestUrl);
        } else {
            linkEl = document.createElement('link');
            linkEl.rel = 'manifest';
            linkEl.href = manifestUrl;
            document.head.appendChild(linkEl);
        }

        return () => {
            const el = document.querySelector('link[rel="manifest"]');
            if (el && previousManifestHref.current) {
                el.setAttribute('href', previousManifestHref.current);
            }
            previousManifestHref.current = null;
        };
    }, [slug, ready]);

    // ── Favicon dinámico ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!logoUrl || !ready) return;

        // Buscar favicon existente (varios selectores comunes)
        let faviconEl = document.querySelector(
            'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
        );

        if (faviconEl) {
            if (!previousFaviconHref.current) {
                previousFaviconHref.current = faviconEl.getAttribute('href');
            }
            faviconEl.setAttribute('href', logoUrl);
        } else {
            // Crear nuevo si no existe
            faviconEl = document.createElement('link');
            faviconEl.rel = 'icon';
            faviconEl.type = 'image/png';
            faviconEl.href = logoUrl;
            document.head.appendChild(faviconEl);
            injectedFavicon.current = faviconEl;
        }

        return () => {
            // Restaurar favicon original al salir
            if (injectedFavicon.current) {
                document.head.removeChild(injectedFavicon.current);
                injectedFavicon.current = null;
            } else {
                const el = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
                if (el && previousFaviconHref.current) {
                    el.setAttribute('href', previousFaviconHref.current);
                }
            }
            previousFaviconHref.current = null;
        };
    }, [logoUrl, ready]);
}
