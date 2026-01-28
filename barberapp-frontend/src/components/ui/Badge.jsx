import PropTypes from 'prop-types';

/**
 * Badge Component - Badge reutilizable con variantes semánticas
 * 
 * @param {string} variant - Variante: 'success' | 'warning' | 'error' | 'info' | 'neutral'
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {ReactNode} children - Contenido del badge
 * @param {string} className - Clases adicionales
 */
export default function Badge({
    variant = 'neutral',
    size = 'md',
    children,
    className = '',
}) {
    const baseClasses = 'inline-flex items-center gap-1 rounded-full font-semibold';

    const variants = {
        success: 'bg-success-500/20 text-success-500 border border-success-500/30',
        warning: 'bg-warning-500/20 text-warning-500 border border-warning-500/30',
        error: 'bg-error-500/20 text-error-500 border border-error-500/30',
        info: 'bg-info-500/20 text-info-500 border border-info-500/30',
        neutral: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
        primary: 'bg-primary-500/20 text-primary-500 border border-primary-500/30',
        outline: 'bg-transparent text-slate-500 border border-slate-800',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
}

Badge.propTypes = {
    variant: PropTypes.oneOf(['success', 'warning', 'error', 'info', 'neutral', 'primary', 'outline']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    children: PropTypes.node,
    className: PropTypes.string,
};
