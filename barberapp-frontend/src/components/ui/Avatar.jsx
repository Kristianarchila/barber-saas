import PropTypes from 'prop-types';

/**
 * Avatar Component - Avatar de usuario con iniciales o imagen
 * 
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} name - Nombre para generar iniciales
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} className - Clases adicionales
 */
export default function Avatar({
    src,
    alt,
    name,
    size = 'md',
    className = '',
}) {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    return (
        <div
            className={`${sizes[size]} rounded-full flex items-center justify-center font-bold overflow-hidden ${className}`}
        >
            {src ? (
                <img src={src} alt={alt || name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center text-white">
                    {getInitials(name)}
                </div>
            )}
        </div>
    );
}

Avatar.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    name: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    className: PropTypes.string,
};
