import { useEffect } from 'react';
import { loadGoogleFont } from '../../utils/fontLoader';

/**
 * ThemeInjector Component
 * 
 * Injects CSS variables into the document root for dynamic theming
 * and loads custom Google Fonts
 */
export default function ThemeInjector({ theme }) {
    useEffect(() => {
        if (!theme) return;

        // Load custom fonts if specified
        if (theme.fontFamily && theme.fontFamily !== 'Inter') {
            loadGoogleFont(theme.fontFamily, ['400', '600', '700', '900']);
        }
        if (theme.fontHeading && theme.fontHeading !== theme.fontFamily) {
            loadGoogleFont(theme.fontHeading, ['400', '700', '900']);
        }

        // Inject CSS variables into document root
        const root = document.documentElement;

        // Colors
        root.style.setProperty('--color-primary', theme.colorPrimary || '#cc2b2b');
        root.style.setProperty('--color-accent', theme.colorAccent || '#1e3a8a');
        root.style.setProperty('--color-success', theme.colorSuccess || '#059669');
        root.style.setProperty('--color-warning', theme.colorWarning || '#f59e0b');
        root.style.setProperty('--color-light', theme.colorLight || '#f8fafc');
        root.style.setProperty('--color-dark', theme.colorDark || '#0a0a0b');

        // Fonts
        root.style.setProperty('--font-body', theme.fontFamily || 'Inter, system-ui, sans-serif');
        root.style.setProperty('--font-heading', theme.fontHeading || theme.fontFamily || 'Inter, system-ui, sans-serif');

        // Cleanup function
        return () => {
            // Reset to defaults on unmount (optional)
            root.style.removeProperty('--color-primary');
            root.style.removeProperty('--color-accent');
            root.style.removeProperty('--color-success');
            root.style.removeProperty('--color-warning');
            root.style.removeProperty('--color-light');
            root.style.removeProperty('--color-dark');
            root.style.removeProperty('--font-body');
            root.style.removeProperty('--font-heading');
        };
    }, [theme]);

    // This component doesn't render anything
    return null;
}
