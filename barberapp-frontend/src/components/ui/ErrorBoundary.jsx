import { Component } from 'react';
import { motion } from 'framer-motion';

/**
 * ErrorBoundary - Captura errores de React y muestra UI de fallback elegante
 * 
 * Uso:
 * <ErrorBoundary>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md w-full text-center"
                    >
                        <div className="mb-8">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
                                <span className="text-4xl">⚠️</span>
                            </div>
                            <h1 className="text-3xl font-serif italic text-white mb-4">
                                Algo salió mal
                            </h1>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Ocurrió un error inesperado. Por favor, intenta recargar la página.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-gold/10 border border-gold/30 text-gold rounded-full text-sm uppercase tracking-widest font-bold hover:bg-gold hover:text-black transition-all duration-300"
                        >
                            Recargar Página
                        </button>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400">
                                    Detalles del error (solo en desarrollo)
                                </summary>
                                <pre className="mt-4 p-4 bg-neutral-900 rounded-lg text-xs text-red-400 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
