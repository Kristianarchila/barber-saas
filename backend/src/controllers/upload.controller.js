/**
 * Upload Controller (Hexagonal Architecture Version)
 */
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No se subió ningún archivo"
            });
        }

        res.status(200).json({
            success: true,
            url: req.file.path,
            public_id: req.file.filename
        });
    } catch (error) {
        console.error("Error en uploadImage:", error);
        res.status(500).json({
            success: false,
            message: "Error al procesar la imagen"
        });
    }
};
