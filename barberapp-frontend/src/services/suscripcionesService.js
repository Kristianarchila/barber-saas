import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Suscripciones Service
 * Handles all subscription-related API calls
 */

// ==========================================
// SUPERADMIN - MANUAL SUBSCRIPTION MANAGEMENT
// ==========================================

/**
 * Change subscription plan manually
 * @param {string} barberiaId 
 * @param {string} newPlan - 'FREE', 'BASIC', or 'PRO'
 * @param {string} reason 
 * @returns {Promise}
 */
export const changePlanManually = async (barberiaId, newPlan, reason = '') => {
    const response = await axios.post(
        `${API_URL}/superadmin/subscriptions/${barberiaId}/change-plan`,
        { newPlan, reason }
    );
    return response.data;
};

/**
 * Extend subscription period manually
 * @param {string} barberiaId 
 * @param {number} months 
 * @param {string} reason 
 * @returns {Promise}
 */
export const extendPeriodManually = async (barberiaId, months, reason = '') => {
    const response = await axios.post(
        `${API_URL}/superadmin/subscriptions/${barberiaId}/extend`,
        { months, reason }
    );
    return response.data;
};

/**
 * Activate subscription manually
 * @param {string} barberiaId 
 * @param {string} reason 
 * @returns {Promise}
 */
export const activateManually = async (barberiaId, reason = '') => {
    const response = await axios.post(
        `${API_URL}/superadmin/subscriptions/${barberiaId}/activate`,
        { reason }
    );
    return response.data;
};

/**
 * Deactivate subscription manually
 * @param {string} barberiaId 
 * @param {string} reason 
 * @returns {Promise}
 */
export const deactivateManually = async (barberiaId, reason = '') => {
    const response = await axios.post(
        `${API_URL}/superadmin/subscriptions/${barberiaId}/deactivate`,
        { reason }
    );
    return response.data;
};

/**
 * Record manual payment
 * @param {string} barberiaId 
 * @param {number} amount 
 * @param {string} concept 
 * @param {Object} metadata 
 * @returns {Promise}
 */
export const recordPaymentManually = async (barberiaId, amount, concept, metadata = {}) => {
    const response = await axios.post(
        `${API_URL}/superadmin/subscriptions/${barberiaId}/record-payment`,
        { amount, concept, metadata }
    );
    return response.data;
};

/**
 * Get subscription history
 * @param {string} barberiaId 
 * @returns {Promise}
 */
export const getSubscriptionHistory = async (barberiaId) => {
    const response = await axios.get(
        `${API_URL}/superadmin/subscriptions/${barberiaId}/history`
    );
    return response.data;
};

// ==========================================
// REGULAR SUBSCRIPTION OPERATIONS
// ==========================================

/**
 * Get current subscription
 * @returns {Promise}
 */
export const getCurrentSubscription = async () => {
    const response = await axios.get(`${API_URL}/subscriptions/current`);
    return response.data;
};

/**
 * Get available plans
 * @returns {Promise}
 */
export const getPlans = async () => {
    const response = await axios.get(`${API_URL}/subscriptions/plans`);
    return response.data;
};

/**
 * Get plan limits
 * @returns {Promise}
 */
export const getPlanLimits = async () => {
    const response = await axios.get(`${API_URL}/subscriptions/limits`);
    return response.data;
};

/**
 * Create subscription
 * @param {string} planId 
 * @param {string} paymentMethodId 
 * @returns {Promise}
 */
export const createSubscription = async (planId, paymentMethodId) => {
    const response = await axios.post(`${API_URL}/subscriptions/create`, {
        planId,
        paymentMethodId
    });
    return response.data;
};

/**
 * Update subscription (change plan)
 * @param {string} newPlanId 
 * @returns {Promise}
 */
export const updateSubscription = async (newPlanId) => {
    const response = await axios.post(`${API_URL}/subscriptions/update`, {
        newPlanId
    });
    return response.data;
};

/**
 * Cancel subscription
 * @param {boolean} immediately 
 * @returns {Promise}
 */
export const cancelSubscription = async (immediately = false) => {
    const response = await axios.post(`${API_URL}/subscriptions/cancel`, {
        immediately
    });
    return response.data;
};

export default {
    // Manual management
    changePlanManually,
    extendPeriodManually,
    activateManually,
    deactivateManually,
    recordPaymentManually,
    getSubscriptionHistory,
    // Regular operations
    getCurrentSubscription,
    getPlans,
    getPlanLimits,
    createSubscription,
    updateSubscription,
    cancelSubscription
};
