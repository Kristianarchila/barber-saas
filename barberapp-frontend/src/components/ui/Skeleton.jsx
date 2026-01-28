/**
 * Skeleton Component - Loading placeholder con animación shimmer
 * 
 * @param {string} variant - Variante: 'text' | 'circular' | 'rectangular'
 * @param {string} width - Ancho (ej: 'w-full', 'w-32')
 * @param {string} height - Alto (ej: 'h-4', 'h-20')
 * @param {string} className - Clases adicionales
 */
export default function Skeleton({
    variant = 'rectangular',
    width = 'w-full',
    height = 'h-4',
    className = '',
}) {
    const baseClasses = 'bg-neutral-800 animate-shimmer';

    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={`${baseClasses} ${variants[variant]} ${width} ${height} ${className}`}
            aria-label="Loading..."
        />
    );
}
