// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Để gửi/nhận cookie
});

// (Nâng cao) Thêm interceptor để tự động đính kèm token hoặc xử lý lỗi tập trung
// apiClient.interceptors.request.use(config => { ... });
// apiClient.interceptors.response.use(response => response, error => { ... });

export default apiClient;