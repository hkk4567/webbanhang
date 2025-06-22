// src/api/userService.js
import apiClient from './apiClient';

export const registerUser = (userData) => {
    // API endpoint này ở backend không nên được bảo vệ bởi middleware `protect`
    return apiClient.user.post('/users/register', userData);
};
// === CÁC HÀNH ĐỘNG CỦA ADMIN QUẢN LÝ USER ===

// Lấy danh sách tất cả user (có phân trang, lọc...)
export const getUsers = (params) => {
    return apiClient.admin.get('/users', { params });
};
// Lấy chi tiết một user bất kỳ bằng ID
export const getUserById = (id) => {
    return apiClient.admin.get(`/users/${id}`);
};
// Admin tạo một tài khoản mới
export const createUser = (userData) => {
    return apiClient.admin.post('/users/register', userData);
};
// Admin cập nhật thông tin một user bất kỳ
export const updateUser = (id, userData) => {
    return apiClient.admin.patch(`/users/${id}`, userData);
};
// Admin xóa một user
export const deleteUser = (id) => {
    return apiClient.admin.delete(`/users/${id}`);
};