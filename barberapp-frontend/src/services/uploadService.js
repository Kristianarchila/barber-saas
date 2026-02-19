import api from './api';

const uploadService = {
    /**
     * Sube un logo a Cloudinary
     * @param {File} file 
     */
    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await api.post('/upload/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    /**
     * Sube una imagen a la galería
     * @param {File} file 
     */
    uploadGallery: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await api.post('/upload/gallery', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    /**
     * Sube una imagen de servicio
     * @param {File} file 
     */
    uploadServiceImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await api.post('/upload/service', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    /**
     * Sube el avatar del barbero
     * @param {File} file - Archivo de imagen
     */
    uploadBarberoAvatar: async (file) => {
        const slug = window.location.pathname.split('/')[1];
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await api.post(`/barberias/${slug}/barbero/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    }
};

export default uploadService;
