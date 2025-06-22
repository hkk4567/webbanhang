import apiClient from './apiClient';

// Lấy chi tiết giỏ hàng hiện tại
export const getCart = () => {
    return apiClient.get('/cart');
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (productId, quantity) => {
    return apiClient.post('/cart', { productId, quantity });
};

// Xóa một sản phẩm khỏi giỏ hàng
export const removeFromCart = (productId) => {
    return apiClient.delete(`/cart/${productId}`);
};

// Xóa sạch giỏ hàng
export const clearCart = () => {
    return apiClient.delete('/cart');
};