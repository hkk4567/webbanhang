// src/services/apiService.js
import axios from 'axios';

// Tạo một instance của axios với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // Lấy URL từ biến môi trường
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // << RẤT QUAN TRỌNG: để gửi và nhận cookie
});

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

export default apiClient;