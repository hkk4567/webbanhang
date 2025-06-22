import apiClient from './apiClient';
// Hàm gọi API đăng nhập
export const loginUserApi = (email, password) => {
    return apiClient.user.post('/auth/login', { email, password });
};
export const logoutUserApi = () => {
    return apiClient.user.get('/auth/logout');
};
export const getMeUserApi = () => {
    return apiClient.user.get('/users/me');
};


// --- ADMIN AUTH APIS ---
export const loginAdminApi = (email, password) => {
    return apiClient.admin.post('/auth/admin/login', { email, password });
};
export const logoutAdminApi = () => {
    return apiClient.admin.get('/auth/admin/logout');
};
export const getMeAdminApi = () => {
    // Gọi đến endpoint mới của admin
    return apiClient.admin.get('/users/admin/me');
};
