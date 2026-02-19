import api from './api';

/**
 * Waiting List Service
 * Handles all API calls related to the waiting list feature
 */
const waitingListService = {
    /**
     * Join the waiting list
     */
    join: async (data) => {
        const response = await api.post('/waiting-list/join', data);
        return response.data;
    },

    /**
     * Convert waiting list entry to reservation using token
     */
    convert: async (token) => {
        const response = await api.post(`/waiting-list/convert/${token}`);
        return response.data;
    },

    /**
     * Get waiting list entries for a barberia
     */
    getByBarberia: async (barberiaId, filters = {}) => {
        const response = await api.get(`/waiting-list/${barberiaId}`, {
            params: filters
        });
        return response.data;
    },

    /**
     * Cancel a waiting list entry
     */
    cancel: async (entryId) => {
        const response = await api.delete(`/waiting-list/${entryId}`);
        return response.data;
    },

    /**
     * Manually notify a waiting list entry (admin only)
     */
    manualNotify: async (entryId) => {
        const response = await api.post(`/waiting-list/${entryId}/notify`);
        return response.data;
    }
};

export default waitingListService;
