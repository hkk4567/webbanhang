import apiClient from './apiClient';

export const getOrders = (params) => {
    return apiClient.admin.get('/orders', { params });
};

export const getOrderById = (id) => {
    return apiClient.admin.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, status) => {
    return apiClient.admin.patch(`/orders/${id}/status`, { status });
};