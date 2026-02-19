import { createContext, useContext } from 'react';

const BarberiaThemeContext = createContext(null);

export function BarberiaThemeProvider({ children, theme }) {
    // Generar tema completo con todos los valores necesarios
    const derivedTheme = {
        // Branding básico
        logo: theme?.logo || '',
        nombre: theme?.nombre || '',

        // Colores principales
        colorPrimary: theme?.colorPrimary || theme?.colorPrincipal || '#cc2b2b',
        colorAccent: theme?.colorAccent || '#1e3a8a',
        colorSuccess: theme?.colorSuccess || '#059669',
        colorWarning: theme?.colorWarning || '#f59e0b',
        colorLight: theme?.colorLight || '#f8fafc',
        colorDark: theme?.colorDark || '#0a0a0b',

        // Tipografía
        fontFamily: theme?.fontFamily || 'Inter',
        fontHeading: theme?.fontHeading || theme?.fontFamily || 'Inter',

        // Contenido del hero
        heroImages: theme?.heroImages || [],
        heroTitle: theme?.heroTitle || theme?.nombre || '',
        slogan: theme?.slogan || '',
        badge: theme?.badge || '',

        // CTAs
        ctaPrimary: theme?.ctaPrimary || 'RESERVAR AHORA',
        ctaSecondary: theme?.ctaSecondary || 'VER SERVICIOS',

        // Datos
        servicios: theme?.servicios || [],

        // Redes sociales
        instagram: theme?.instagram || '',
        facebook: theme?.facebook || '',
    };

    return (
        <BarberiaThemeContext.Provider value={derivedTheme}>
            {children}
        </BarberiaThemeContext.Provider>
    );
}

export function useBarberiaTheme() {
    const context = useContext(BarberiaThemeContext);
    if (!context) {
        throw new Error('useBarberiaTheme must be used within BarberiaThemeProvider');
    }
    return context;
}
