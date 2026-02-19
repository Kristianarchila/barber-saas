const cloudinaryService = require('../services/cloudinary.service');
const Logger = require('../shared/Logger');

/**
 * Subir imagen con resiliencia
 * Si Cloudinary falla, la operación no debe romper el flujo
 */
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No se subió ningún archivo"
            });
        }

        // Intentar subir a Cloudinary con circuit breaker
        const result = await cloudinaryService.uploadImage(
            req.file.buffer,
            {
                folder: req.body.folder || 'barberias',
                transformation: req.body.transformation ? JSON.parse(req.body.transformation) : []
            }
        );

        // Si Cloudinary falló (circuit breaker abierto o error)
        if (!result) {
            Logger.warn('UploadController', 'Cloudinary no disponible - Usando fallback', {
                filename: req.file.originalname,
                circuitState: cloudinaryService.getServiceStatus()
            });

            return res.status(503).json({
                success: false,
                message: "Servicio de imágenes temporalmente no disponible. Por favor intenta más tarde.",
                fallback: true,
                circuitBreakerState: cloudinaryService.getServiceStatus().state
            });
        }

        // Éxito
        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        });

    } catch (error) {
        Logger.error('UploadController', 'Error en uploadImage', error);

        res.status(500).json({
            success: false,
            message: "Error al procesar la imagen",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
