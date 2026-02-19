import React from 'react';
import PropTypes from 'prop-types';

/**
 * Input Component - Input estilizado para el sistema premium
 * 
 * @param {string} type - Tipo de input
 * @param {string} placeholder - Placeholder
 * @param {string} value - Valor
 * @param {function} onChange - Handler de cambio
 * @param {ReactNode} icon - Icono opcional para el lado izquierdo
 * @param {string} className - Clases adicionales
 */
export default function Input({
    type = 'text',
    placeholder = '',
    value,
    onChange,
    icon,
    className = '',
    variant = 'light', // 'light' or 'dark'
    ...props
}) {
    const isDark = variant === 'dark';

    return (
        <div className={`relative w-full ${className}`}>
            {icon && (
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`
                    w-full rounded-2xl py-3 px-4 
                    transition-all outline-none
                    ${isDark
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                        : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                    }
                    ${icon ? 'pl-12' : ''}
                `}
                {...props}
            />
        </div>
    );
}

Input.propTypes = {
    type: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    icon: PropTypes.node,
    className: PropTypes.string,
};
