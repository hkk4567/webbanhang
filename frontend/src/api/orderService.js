import apiClient from './apiClient';

// user APIs orders
export const createOrderApi = (orderData) => {
    // Luôn dùng apiClient của user vì đây là hành động của người dùng
    return apiClient.user.post('/orders', orderData);
};

// admin APIs for managing orders
export const getOrders = (params) => {
    return apiClient.admin.get('/orders', { params });
};

export const getOrderById = (id) => {
    return apiClient.admin.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, status) => {
    return apiClient.admin.patch(`/orders/${id}/status`, { status });
};