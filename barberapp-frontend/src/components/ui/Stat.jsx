import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Stat Component - Tarjeta de estadística con valor, cambio y tendencia
 * 
 * @param {string} title - Título de la métrica
 * @param {string|number} value - Valor principal
 * @param {string} change - Cambio porcentual (ej: "+15%")
 * @param {string} trend - Tendencia: 'up' | 'down' | 'neutral'
 * @param {React.ReactNode} icon - Emoji o icono (componente Lucide o string)
 * @param {string} subtitle - Texto secundario bajo el valor
 * @param {string} badge - Texto destacado en un badge
 * @param {string} color - Color: 'primary' | 'secondary' | 'success' | 'warning'
 * @param {string} variant - Variante: 'default' | 'premium'
 * @param {string} className - Clases adicionales
 */
export default function Stat({
    title,
    value,
    change,
    trend = 'neutral',
    icon,
    subtitle,
    badge,
    color = 'primary',
    variant = 'default',
    className = '',
}) {
    // Premium variant
    if (variant === 'premium') {
        return (
            <div className={`bg-white border border-black/5 rounded-[2rem] p-8 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${className}`}>
                {/* Icon - Subtle background */}
                {icon && (
                    <div className="absolute top-6 right-6 text-black/5 group-hover:text-black/10 transition-colors duration-300">
                        {typeof icon === 'string' ? (
                            <span className="text-4xl">{icon}</span>
                        ) : (
                            <div className="[&>svg]:w-8 [&>svg]:h-8 [&>svg]:stroke-[1]">
                                {icon}
                            </div>
                        )}
                    </div>
                )}

                {/* Value - Giant number */}
                <div className="relative z-10">
                    <p className="text-[4rem] font-black text-black leading-none tracking-tighter mb-2">
                        {value}
                    </p>

                    {/* Title - Small uppercase */}
                    <p className="text-xs font-light text-black/40 uppercase tracking-[0.2em]">
                        {title}
                    </p>

                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-sm text-black/60 mt-2 font-serif italic">
                            {subtitle}
                        </p>
                    )}

                    {/* Change indicator */}
                    {change && (
                        <div className={`flex items-center gap-1 text-xs font-medium mt-3 ${trend === 'up' ? 'text-green-600' :
                                trend === 'down' ? 'text-red-600' :
                                    'text-black/40'
                            }`}>
                            {trend === 'up' && <TrendingUp size={14} strokeWidth={2} />}
                            {trend === 'down' && <TrendingDown size={14} strokeWidth={2} />}
                            <span>{change}</span>
                        </div>
                    )}

                    {/* Badge */}
                    {badge && (
                        <span className="inline-block mt-3 px-3 py-1 rounded-full border border-black/10 text-xs font-medium uppercase tracking-wide text-black/60">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Default variant (existing design)
    const colors = {
        primary: 'from-primary-600 to-primary-700',
        secondary: 'from-secondary-600 to-secondary-700',
        success: 'from-success-600 to-success-700',
        warning: 'from-warning-600 to-warning-700',
        accent: 'from-accent-600 to-accent-700',
    };

    const trendColors = {
        up: 'text-success-300',
        down: 'text-error-300',
        neutral: 'text-white/60',
    };

    return (
        <div
            className={`bg-gradient-to-br ${colors[color]} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${className} relative overflow-hidden group`}
        >
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 [&>svg]:w-24 [&>svg]:h-24">
                {icon}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-3 relative z-10">
                <p className="text-white/80 text-sm font-bold uppercase tracking-wider">{title}</p>
                {icon && <div className="text-white/40">{icon}</div>}
            </div>

            {/* Value & Badge */}
            <div className="flex items-end justify-between relative z-10">
                <div>
                    <p className="text-3xl font-black text-white">{value}</p>
                    {subtitle && <p className="text-white/60 text-xs mt-1 font-medium">{subtitle}</p>}
                </div>
                {badge && (
                    <span className="bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                        {badge}
                    </span>
                )}
            </div>

            {/* Change Tendency */}
            {change && (
                <div className={`flex items-center gap-1 text-xs font-bold mt-4 relative z-10 ${trendColors[trend]}`}>
                    {trend === 'up' && <TrendingUp size={14} />}
                    {trend === 'down' && <TrendingDown size={14} />}
                    <span>{change}</span>
                </div>
            )}
        </div>
    );
}

Stat.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    change: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down', 'neutral']),
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    subtitle: PropTypes.string,
    badge: PropTypes.string,
    color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'accent']),
    variant: PropTypes.oneOf(['default', 'premium']),
    className: PropTypes.string,
};

