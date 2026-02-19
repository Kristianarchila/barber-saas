const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuración de Cloudinary
if (process.env.CLOUDINARY_URL) {
    // Si existe la URL completa, Cloudinary la detecta automáticamente
    cloudinary.config();
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Configuración del almacenamiento para Logos
const logoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberias/logos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'ico'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
});

// Configuración del almacenamiento para Galería
const galleryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberias/galeria',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1200, height: 720, crop: 'limit' }]
    },
});

// Configuración del almacenamiento para Servicios
const serviceStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberias/servicios',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    },
});

const uploadLogo = multer({ storage: logoStorage });
const uploadGallery = multer({ storage: galleryStorage });
const uploadService = multer({ storage: serviceStorage });

module.exports = {
    cloudinary,
    uploadLogo,
    uploadGallery,
    uploadService
};
