import apiClient from './apiClient';

// Lấy chi tiết giỏ hàng hiện tại
export const getCart = () => {
    return apiClient.user.get('/cart');
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (productId, quantity) => {
    return apiClient.user.post('/cart', { productId, quantity });
};

// Xóa một sản phẩm khỏi giỏ hàng
export const removeFromCart = (productId) => {
    return apiClient.user.delete(`/cart/${productId}`);
};

// Xóa sạch giỏ hàng
export const clearCart = () => {
    return apiClient.user.delete('/cart');
};