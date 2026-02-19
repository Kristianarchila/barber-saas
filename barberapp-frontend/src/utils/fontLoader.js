/**
 * Font Loader Utility
 * 
 * Dynamically loads Google Fonts into the document
 */

/**
 * Load a Google Font dynamically
 * @param {string} fontFamily - Font family name (e.g., 'Inter', 'Playfair Display')
 * @param {string[]} weights - Array of weights to load (e.g., ['400', '700', '900'])
 */
export const loadGoogleFont = (fontFamily, weights = ['400', '700', '900']) => {
    // Check if font is already loaded
    const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(fontId)) {
        return; // Font already loaded
    }

    // Create font weights string for Google Fonts API
    const weightsString = weights.map(w => `0,${w}`).join(';');

    // Build Google Fonts URL
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${weightsString}&display=swap`;

    // Create and append link element
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
};

/**
 * Load multiple Google Fonts
 * @param {Object[]} fonts - Array of font configurations
 * @example
 * loadMultipleFonts([
 *   { family: 'Inter', weights: ['400', '700', '900'] },
 *   { family: 'Playfair Display', weights: ['400', '700'] }
 * ])
 */
export const loadMultipleFonts = (fonts) => {
    fonts.forEach(({ family, weights }) => {
        loadGoogleFont(family, weights);
    });
};

/**
 * Preload common barber shop fonts
 */
export const POPULAR_BARBER_FONTS = {
    modern: [
        { family: 'Inter', weights: ['400', '700', '900'] },
        { family: 'Poppins', weights: ['400', '600', '700', '900'] },
        { family: 'Montserrat', weights: ['400', '700', '900'] },
    ],
    classic: [
        { family: 'Playfair Display', weights: ['400', '700', '900'] },
        { family: 'Merriweather', weights: ['400', '700', '900'] },
        { family: 'Lora', weights: ['400', '700'] },
    ],
    bold: [
        { family: 'Bebas Neue', weights: ['400'] },
        { family: 'Oswald', weights: ['400', '600', '700'] },
        { family: 'Anton', weights: ['400'] },
    ],
    elegant: [
        { family: 'Cormorant Garamond', weights: ['400', '600', '700'] },
        { family: 'Crimson Text', weights: ['400', '600', '700'] },
        { family: 'EB Garamond', weights: ['400', '700'] },
    ],
};
