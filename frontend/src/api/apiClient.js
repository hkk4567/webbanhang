import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// --- INSTANCE CÔNG KHAI / CHUNG ---
export const publicApiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// --- INSTANCE CHO USER ---
export const userApiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Interceptor của User sẽ thêm header 'X-Auth-Scope: user'
userApiClient.interceptors.request.use(
    (config) => {
        config.headers['X-Auth-Scope'] = 'user';
        // Không cần gửi token qua header nữa vì đã có cookie
        return config;
    },
    (error) => Promise.reject(error)
);

// --- INSTANCE CHO ADMIN ---
export const adminApiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Interceptor của Admin sẽ thêm header 'X-Auth-Scope: admin'
adminApiClient.interceptors.request.use(
    (config) => {
        config.headers['X-Auth-Scope'] = 'admin';
        return config;
    },
    (error) => Promise.reject(error)
);

// Gộp lại để các service khác có thể dùng chung
const apiClient = {
    // public: publicApiClient,
    user: userApiClient,
    admin: adminApiClient,
}

export default apiClient;