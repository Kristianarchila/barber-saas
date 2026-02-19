/**
 * Theme-aware Tailwind utility classes
 * 
 * This file provides utility functions to generate Tailwind classes
 * that use CSS variables for dynamic theming
 */

/**
 * Get theme-aware color classes
 * @param {string} type - Type of color (primary, accent, success, warning)
 * @param {string} property - CSS property (bg, text, border)
 * @returns {string} Tailwind class using CSS variable
 */
export const themeColor = (type = 'primary', property = 'bg') => {
    const varMap = {
        primary: '--color-primary',
        accent: '--color-accent',
        success: '--color-success',
        warning: '--color-warning',
        light: '--color-light',
        dark: '--color-dark',
    };

    const cssVar = varMap[type] || varMap.primary;

    // Return inline style object for use with style prop
    const propertyMap = {
        bg: 'backgroundColor',
        text: 'color',
        border: 'borderColor',
    };

    return { [propertyMap[property]]: `var(${cssVar})` };
};

/**
 * Get primary color for inline styles
 */
export const primaryColor = () => 'var(--color-primary)';
export const accentColor = () => 'var(--color-accent)';
export const successColor = () => 'var(--color-success)';
export const warningColor = () => 'var(--color-warning)';
export const lightColor = () => 'var(--color-light)';
export const darkColor = () => 'var(--color-dark)';

/**
 * Get gradient using theme colors
 */
export const themeGradient = (from = 'primary', to = 'accent') => {
    return `linear-gradient(to right, var(--color-${from}), var(--color-${to}))`;
};
