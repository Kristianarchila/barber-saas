const cloudinary = require('cloudinary').v2;

/**
 * CloudinaryAdapter - Hexagonal Architecture
 * 
 * Adapter para abstraer las operaciones de Cloudinary del resto de la aplicación.
 * Permite cambiar el proveedor de almacenamiento de imágenes sin afectar la lógica de negocio.
 */
class CloudinaryAdapter {
    constructor() {
        // Configuración de Cloudinary
        if (process.env.CLOUDINARY_URL) {
            cloudinary.config();
        } else {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
        }
    }

    /**
     * Sube una imagen a Cloudinary
     * @param {string|Buffer} file - Ruta del archivo o buffer
     * @param {string} folder - Carpeta en Cloudinary
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Object>} - Resultado de la subida
     */
    async uploadImage(file, folder = 'general', options = {}) {
        try {
            const uploadOptions = {
                folder: folder,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                ...options
            };

            const result = await cloudinary.uploader.upload(file, uploadOptions);

            return {
                publicId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes
            };
        } catch (error) {
            console.error('❌ Error uploading image to Cloudinary:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    /**
     * Elimina una imagen de Cloudinary
     * @param {string} publicId - ID público de la imagen
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result !== 'ok') {
                throw new Error(`Failed to delete image: ${result.result}`);
            }

            return {
                success: true,
                publicId: publicId,
                result: result.result
            };
        } catch (error) {
            console.error('❌ Error deleting image from Cloudinary:', error);
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }

    /**
     * Obtiene URL de imagen con transformaciones
     * @param {string} publicId - ID público de la imagen
     * @param {Object} transformations - Transformaciones a aplicar
     * @returns {string} - URL de la imagen transformada
     */
    getImageUrl(publicId, transformations = {}) {
        try {
            return cloudinary.url(publicId, {
                secure: true,
                ...transformations
            });
        } catch (error) {
            console.error('❌ Error generating image URL:', error);
            throw new Error(`Failed to generate image URL: ${error.message}`);
        }
    }

    /**
     * Sube múltiples imágenes
     * @param {Array<string|Buffer>} files - Array de archivos
     * @param {string} folder - Carpeta en Cloudinary
     * @returns {Promise<Array<Object>>} - Resultados de las subidas
     */
    async uploadMultipleImages(files, folder = 'general') {
        try {
            const uploadPromises = files.map(file =>
                this.uploadImage(file, folder)
            );

            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('❌ Error uploading multiple images:', error);
            throw new Error(`Failed to upload multiple images: ${error.message}`);
        }
    }

    /**
     * Elimina múltiples imágenes
     * @param {Array<string>} publicIds - Array de IDs públicos
     * @returns {Promise<Array<Object>>} - Resultados de las eliminaciones
     */
    async deleteMultipleImages(publicIds) {
        try {
            const deletePromises = publicIds.map(publicId =>
                this.deleteImage(publicId)
            );

            return await Promise.all(deletePromises);
        } catch (error) {
            console.error('❌ Error deleting multiple images:', error);
            throw new Error(`Failed to delete multiple images: ${error.message}`);
        }
    }

    /**
     * Obtiene información de una imagen
     * @param {string} publicId - ID público de la imagen
     * @returns {Promise<Object>} - Información de la imagen
     */
    async getImageInfo(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);

            return {
                publicId: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                createdAt: result.created_at
            };
        } catch (error) {
            console.error('❌ Error getting image info:', error);
            throw new Error(`Failed to get image info: ${error.message}`);
        }
    }

    /**
     * Sube logo de barbería
     * @param {string|Buffer} file - Archivo de logo
     * @param {string} barberiaId - ID de la barbería
     * @returns {Promise<Object>} - Resultado de la subida
     */
    async uploadLogo(file, barberiaId) {
        return this.uploadImage(file, 'logos', {
            public_id: `logo_${barberiaId}`,
            overwrite: true,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });
    }

    /**
     * Sube imagen de galería
     * @param {string|Buffer} file - Archivo de imagen
     * @param {string} barberiaId - ID de la barbería
     * @returns {Promise<Object>} - Resultado de la subida
     */
    async uploadGalleryImage(file, barberiaId) {
        return this.uploadImage(file, `gallery/${barberiaId}`, {
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });
    }

    /**
     * Sube imagen de servicio
     * @param {string|Buffer} file - Archivo de imagen
     * @param {string} barberiaId - ID de la barbería
     * @returns {Promise<Object>} - Resultado de la subida
     */
    async uploadServiceImage(file, barberiaId) {
        return this.uploadImage(file, `services/${barberiaId}`, {
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });
    }
}

module.exports = CloudinaryAdapter;
