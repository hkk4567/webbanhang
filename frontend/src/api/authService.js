import apiClient from './apiClient';
// Hàm gọi API đăng nhập
export const loginApi = (email, password) => {
    return apiClient.post('/auth/login', { email, password });
};

// Hàm gọi API đăng xuất
export const logoutApi = () => {
    return apiClient.get('/auth/logout');
};

// Hàm lấy thông tin người dùng hiện tại (để kiểm tra session)
export const getMeApi = () => {
    return apiClient.get('/users/me');
};
