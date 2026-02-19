const cloudinary = require('cloudinary').v2;

// Cloudinary se configura automáticamente con CLOUDINARY_URL
// pero también puedes hacerlo manualmente:
cloudinary.config({
  cloud_name: 'kristian',
  api_key: '726787262184725',
  api_secret: 'VVcGOLDIRCqLVz3Ea-VxnU1XzOg'
});

module.exports = cloudinary;