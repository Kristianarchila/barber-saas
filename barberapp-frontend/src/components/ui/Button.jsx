import PropTypes from 'prop-types';

/**
 * Button Component - Botón reutilizable con múltiples variantes
 * 
 * @param {string} variant - Variante del botón: 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium-primary' | 'premium-secondary' | 'premium-gold'
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
        ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200',
        danger: 'bg-error-500 text-white hover:bg-error-600 hover:shadow-lg focus:ring-error-500/30',
        success: 'gradient-success text-white hover:shadow-glow-success hover:scale-105 active:scale-95 focus:ring-success-500/30',
        outline: 'bg-transparent text-gray-600 border border-gray-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-100',
        'premium-primary': 'bg-black text-white hover:bg-black/90 hover:scale-[1.02] active:scale-[0.98] focus:ring-black/20 font-black uppercase tracking-[0.2em] text-sm',
        'premium-secondary': 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white focus:ring-black/20 font-black uppercase tracking-[0.2em] text-sm',
        'premium-gold': 'bg-[#C9A961] text-black hover:bg-[#B89551] hover:scale-[1.02] active:scale-[0.98] focus:ring-[#C9A961]/20 font-black uppercase tracking-[0.2em] text-sm',
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
    variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'ghost', 'danger', 'success', 'outline', 'premium-primary', 'premium-secondary', 'premium-gold']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

