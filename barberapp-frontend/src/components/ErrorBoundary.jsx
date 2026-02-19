import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // Log error to backend monitoring service
        this.logErrorToService(error, errorInfo);
    }

    logErrorToService = (error, errorInfo) => {
        try {
            // Send error to backend for logging
            fetch('/api/logs/frontend-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: error.toString(),
                    errorInfo: errorInfo.componentStack,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.error('Failed to log error:', err));
        } catch (err) {
            console.error('Error logging failed:', err);
        }
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorCount={this.state.errorCount}
                    onReset={this.handleReset}
                    onGoHome={this.handleGoHome}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Error Fallback UI
 * Displays when ErrorBoundary catches an error
 */
function ErrorFallback({ error, errorCount, onReset, onGoHome }) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    ¡Oops! Algo salió mal
                </h1>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                    Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando en solucionarlo.
                </p>

                {/* Error Count Warning */}
                {errorCount > 2 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Este error ha ocurrido {errorCount} veces. Te recomendamos volver al inicio.
                        </p>
                    </div>
                )}

                {/* Error Details (Development Only) */}
                {isDevelopment && error && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <p className="text-xs font-mono text-gray-700 break-all">
                            {error.toString()}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={onReset}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Intentar de nuevo
                    </button>

                    <button
                        onClick={onGoHome}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Volver al inicio
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    Si el problema persiste, por favor contacta a soporte.
                </p>
            </div>
        </div>
    );
}

export default ErrorBoundary;
