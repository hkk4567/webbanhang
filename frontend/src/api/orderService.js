import apiClient from './apiClient';

export const getOrders = (params) => {
    return apiClient.get('/orders', { params });
};

export const getOrderById = (id) => {
    return apiClient.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, status) => {
    return apiClient.patch(`/orders/${id}/status`, { status });
};