import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create Stripe Checkout Session
 * @param {Object} data - Checkout data
 * @param {string} data.planId - Plan ID (basico, pro, premium)
 * @param {string} data.email - Customer email
 * @param {string} data.nombre - Barbershop name
 */
export const createCheckoutSession = async (data) => {
    const response = await axios.post(`${API_URL}/subscriptions/checkout`, data);
    return response.data;
};

/**
 * Get Current Subscription
 * Returns the current subscription details for the logged-in barbershop
 */
export const getCurrentSubscription = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/subscriptions/current`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

/**
 * Change Subscription Plan
 * @param {string} newPlanId - New plan ID
 */
export const changePlan = async (newPlanId) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${API_URL}/subscriptions/change-plan`,
        { newPlanId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

/**
 * Cancel Subscription
 * Cancels the subscription at the end of the current period
 */
export const cancelSubscription = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${API_URL}/subscriptions/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

/**
 * Reactivate Subscription
 * Reactivates a canceled subscription before period end
 */
export const reactivateSubscription = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${API_URL}/subscriptions/reactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

/**
 * Get Payment History
 * Returns list of invoices
 */
export const getInvoices = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/subscriptions/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export default {
    createCheckoutSession,
    getCurrentSubscription,
    changePlan,
    cancelSubscription,
    reactivateSubscription,
    getInvoices
};
