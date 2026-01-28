import PropTypes from 'prop-types';

/**
 * Button Component - Botón reutilizable con múltiples variantes
 * 
 * @param {string} variant - Variante del botón: 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Estado de carga
 * @param {boolean} disabled - Estado deshabilitado
 * @param {ReactNode} children - Contenido del botón
 * @param {string} className - Clases adicionales
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    className = '',
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'gradient-primary text-white hover:shadow-glow-primary hover:scale-105 active:scale-95 focus:ring-primary-500/30',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-glow-secondary focus:ring-secondary-500/30',
        accent: 'gradient-accent text-white hover:shadow-glow-accent hover:scale-105 active:scale-95 focus:ring-accent-500/30',
        ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white focus:ring-neutral-700/30',
        danger: 'bg-error-500 text-white hover:bg-error-600 hover:shadow-lg focus:ring-error-500/30',
        success: 'gradient-success text-white hover:shadow-glow-success hover:scale-105 active:scale-95 focus:ring-success-500/30',
        outline: 'bg-transparent text-slate-400 border border-slate-800 hover:border-indigo-500 hover:text-white hover:bg-slate-900 focus:ring-slate-700/30',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'ghost', 'danger', 'success', 'outline']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
