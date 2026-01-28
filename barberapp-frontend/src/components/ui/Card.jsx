import PropTypes from 'prop-types';

/**
 * Card Component - Tarjeta reutilizable con variantes
 * 
 * @param {string} variant - Variante: 'default' | 'glass' | 'gradient'
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
        default: 'bg-neutral-900 border border-neutral-800 shadow-lg',
        glass: 'glass shadow-xl',
        gradient: 'gradient-dark border border-neutral-800 shadow-2xl',
    };

    const hoverClasses = hover
        ? 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer'
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
    variant: PropTypes.oneOf(['default', 'glass', 'gradient']),
    hover: PropTypes.bool,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
