import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner Component - Spinner centrado para estados de carga
 * 
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} color - 'primary' | 'white' | 'slate'
 * @param {string} label - Texto opcional debajo del spinner
 * @param {boolean} fullPage - Si debe ocupar toda la pantalla
 */
export default function LoadingSpinner({
    size = 'md',
    color = 'primary',
    label,
    fullPage = false
}) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
        xl: 'w-24 h-24 border-4',
    };

    const colorClasses = {
        primary: 'border-primary-500/30 border-t-primary-500',
        white: 'border-white/30 border-t-white',
        slate: 'border-slate-700 border-t-indigo-500',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div className={`rounded-full animate-spin transition-all ${sizeClasses[size]} ${colorClasses[color]}`} />
            {label && (
                <p className="text-slate-400 font-medium text-sm animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8 w-full">
            {spinner}
        </div>
    );
}

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    color: PropTypes.oneOf(['primary', 'white', 'slate']),
    label: PropTypes.string,
    fullPage: PropTypes.bool,
};
