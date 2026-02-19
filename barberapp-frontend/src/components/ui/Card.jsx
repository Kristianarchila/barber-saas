import PropTypes from 'prop-types';

/**
 * Card Component - Tarjeta reutilizable con variantes
 * 
 * @param {string} variant - Variante: 'default' | 'glass' | 'gradient' | 'premium' | 'premium-metric'
 * @param {boolean} hover - Efecto hover
 * @param {ReactNode} children - Contenido de la tarjeta
 * @param {string} className - Clases adicionales
 */
export default function Card({
    variant = 'default',
    hover = false,
    children,
    className = '',
    ...props
}) {
    const baseClasses = 'rounded-2xl p-6 transition-all duration-200';

    const variants = {
        default: 'bg-white border border-gray-100 shadow-sm',
        glass: 'glass shadow-xl',
        gradient: 'gradient-dark border border-neutral-800 shadow-2xl',
        premium: 'bg-white border border-black/5 shadow-sm',
        dark: 'bg-neutral-900 border border-neutral-800 shadow-lg',
        'premium-metric': 'bg-white border border-black/5 p-8 relative overflow-hidden',
    };

    const hoverClasses = hover
        ? variant.includes('premium')
            ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
            : 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer'
        : '';

    return (
        <div
            className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

Card.propTypes = {
    variant: PropTypes.oneOf(['default', 'glass', 'gradient', 'premium', 'premium-metric']),
    hover: PropTypes.bool,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

