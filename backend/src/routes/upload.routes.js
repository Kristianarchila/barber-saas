const express = require('express');
const router = express.Router();
const { protect } = require('../config/middleware/auth.middleware');
const { uploadLogo, uploadGallery, uploadService } = require('../config/cloudinary');
const uploadController = require('../controllers/upload.controller');

// Subir Logo
router.post('/logo', protect, uploadLogo.single('image'), uploadController.uploadImage);

// Subir Imagen a Galería
router.post('/gallery', protect, uploadGallery.single('image'), uploadController.uploadImage);

// Subir Imagen de Servicio
router.post('/service', protect, uploadService.single('image'), uploadController.uploadImage);

module.exports = router;
