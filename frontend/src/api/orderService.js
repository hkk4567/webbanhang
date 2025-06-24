import apiClient from './apiClient';

// user APIs orders
export const createOrderApi = (orderData) => {
    // Luôn dùng apiClient của user vì đây là hành động của người dùng
    return apiClient.user.post('/orders', orderData);
};

export const getMyOrdersApi = (params) => {
    // Luôn dùng apiClient của user vì đây là hành động của người dùng
    // Giả sử endpoint là /orders/my-orders
    return apiClient.user.get('/orders/my-orders', { params });
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
export const getOrdersByUserId = (userId, params) => {
    // Gọi đến endpoint mới đã tạo
    return apiClient.admin.get(`/orders/user/${userId}`, { params });
};