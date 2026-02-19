import API from './api';

const barberiaService = {
    getMiBarberia: async () => {
        const response = await API.get('/barberias/me');
        return response.data;
    },

    updateConfiguracion: async (data) => {
        const response = await API.patch('/barberias/configuracion', data);
        return response.data;
    },

    getConfigEmail: async () => {
        const response = await API.get('/barberias/configuracion/email');
        return response.data;
    },

    updateConfigEmail: async (data) => {
        const response = await API.patch('/barberias/configuracion/email', data);
        return response.data;
    }
};

export default barberiaService;
