import React from 'react';
import { AlertCircle, WifiOff, RefreshCw, X } from 'lucide-react';

/**
 * Error Alert Component
 * Displays inline error messages with retry functionality
 */
export function ErrorAlert({
    title = 'Error',
    message,
    onRetry,
    onDismiss,
    variant = 'error' // 'error' | 'warning' | 'info'
}) {
    const variants = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'text-red-600',
            text: 'text-red-800',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: 'text-yellow-600',
            text: 'text-yellow-800',
            button: 'bg-yellow-600 hover:bg-yellow-700'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: 'text-blue-600',
            text: 'text-blue-800',
            button: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const style = variants[variant];

    return (
        <div className={`${style.bg} border ${style.border} rounded-lg p-4 mb-4`}>
            <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />

                <div className="flex-1">
                    <h3 className={`font-semibold ${style.text} mb-1`}>
                        {title}
                    </h3>
                    <p className={`text-sm ${style.text}`}>
                        {message}
                    </p>
                </div>

                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={`${style.icon} hover:opacity-70 transition-opacity`}
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className={`mt-3 ${style.button} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
                >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                </button>
            )}
        </div>
    );
}

/**
 * Network Error Component
 * Displays when network connection is lost
 */
export function NetworkError({ onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <WifiOff className="w-10 h-10 text-gray-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Sin conexión a internet
            </h2>

            <p className="text-gray-600 text-center max-w-md mb-6">
                No pudimos conectarnos al servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Reintentar
                </button>
            )}
        </div>
    );
}

/**
 * Empty State Component
 * Displays when no data is available
 */
export function EmptyState({
    icon: Icon = AlertCircle,
    title = 'No hay datos',
    message = 'No se encontraron resultados',
    action,
    actionLabel = 'Recargar'
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            <p className="text-gray-600 text-center max-w-md mb-6">
                {message}
            </p>

            {action && (
                <button
                    onClick={action}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ size = 'md', message }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
            {message && (
                <p className="text-gray-600 mt-4 text-sm">
                    {message}
                </p>
            )}
        </div>
    );
}

/**
 * Skeleton Loader Component
 */
export function SkeletonLoader({ count = 3, height = 'h-20' }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`${height} bg-gray-200 rounded-lg animate-pulse`}
                />
            ))}
        </div>
    );
}
