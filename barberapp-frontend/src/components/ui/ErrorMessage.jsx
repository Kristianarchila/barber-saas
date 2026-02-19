import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * ErrorMessage Component - Display errors with retry option
 * 
 * @param {string} title - Error title
 * @param {string} message - Detailed error message
 * @param {function} onRetry - Callback for retry button
 * @param {string} variant - 'error' | 'warning' | 'info'
 */
export default function ErrorMessage({
    title = 'Algo salió mal',
    message = 'Hubo un problema al cargar los datos. Por favor, intenta de nuevo.',
    onRetry,
    variant = 'error'
}) {
    const variants = {
        error: {
            container: 'bg-error-500/10 border-error-500/20',
            icon: 'text-error-500',
            btn: 'danger'
        },
        warning: {
            container: 'bg-amber-500/10 border-amber-500/20',
            icon: 'text-amber-500',
            btn: 'primary'
        },
        info: {
            container: 'bg-indigo-500/10 border-indigo-500/20',
            icon: 'text-indigo-500',
            btn: 'outline'
        }
    };

    const current = variants[variant] || variants.error;

    return (
        <div className={`p-6 rounded-2xl border ${current.container} flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-300 max-w-md mx-auto my-8`}>
            <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center ${current.icon}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>

            <div>
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-slate-400 text-sm">{message}</p>
            </div>

            {onRetry && (
                <Button
                    variant={current.btn}
                    size="sm"
                    onClick={onRetry}
                    className="mt-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Reintentar
                </Button>
            )}
        </div>
    );
}

ErrorMessage.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    onRetry: PropTypes.func,
    variant: PropTypes.oneOf(['error', 'warning', 'info']),
};
