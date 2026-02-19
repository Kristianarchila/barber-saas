/**
 * Comprime una imagen antes de subirla a Cloudinary
 * @param {File} file - Archivo de imagen original
 * @param {Object} options - Opciones de compresión
 * @param {number} options.maxSizeMB - Tamaño máximo en MB (default: 8)
 * @param {number} options.maxWidthOrHeight - Dimensión máxima (default: 1920)
 * @param {number} options.quality - Calidad de compresión 0-1 (default: 0.8)
 * @returns {Promise<File>} - Archivo comprimido
 */
export async function compressImage(file, options = {}) {
    const {
        maxSizeMB = 8,
        maxWidthOrHeight = 1920,
        quality = 0.8
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar si excede el máximo
                if (width > height) {
                    if (width > maxWidthOrHeight) {
                        height = (height * maxWidthOrHeight) / width;
                        width = maxWidthOrHeight;
                    }
                } else {
                    if (height > maxWidthOrHeight) {
                        width = (width * maxWidthOrHeight) / height;
                        height = maxWidthOrHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a blob con compresión
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Error al comprimir la imagen'));
                            return;
                        }

                        // Si aún es muy grande, reducir calidad
                        const sizeMB = blob.size / 1024 / 1024;
                        if (sizeMB > maxSizeMB && quality > 0.5) {
                            // Reintentar con menor calidad
                            compressImage(file, { ...options, quality: quality - 0.1 })
                                .then(resolve)
                                .catch(reject);
                            return;
                        }

                        // Crear nuevo archivo
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        console.log(`📦 Compresión: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Error al cargar la imagen'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Valida que el archivo sea una imagen
 */
export function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
        throw new Error('Formato no válido. Solo se permiten JPG, PNG y WebP');
    }

    const maxSize = 50 * 1024 * 1024; // 50MB antes de comprimir
    if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande (máx. 50MB)');
    }

    return true;
}
