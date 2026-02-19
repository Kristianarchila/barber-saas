import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * LazyImage - Componente para carga lazy de imágenes con blur placeholder
 * 
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS adicionales
 * @param {string} fallback - URL de imagen fallback si falla la carga
 * @param {function} onLoad - Callback cuando la imagen se carga
 * @param {function} onError - Callback cuando hay error
 */
export const LazyImage = ({
    src,
    alt = '',
    className = '',
    fallback = '/placeholder.jpg',
    onLoad,
    onError,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        // Intersection Observer para lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setImageSrc(src);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Cargar 50px antes de que sea visible
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
        setImageSrc(fallback);
        onError?.();
    };

    return (
        <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
            {/* Blur placeholder mientras carga */}
            {isLoading && (
                <div className="absolute inset-0 bg-neutral-900 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                </div>
            )}

            {/* Imagen real */}
            {imageSrc && (
                <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoading ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    src={imageSrc}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={className}
                    {...props}
                />
            )}

            {/* Indicador de error (opcional) */}
            {hasError && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                    <span className="text-neutral-600 text-xs">📷</span>
                </div>
            )}
        </div>
    );
};
