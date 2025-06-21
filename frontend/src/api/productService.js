import apiClient from './apiClient';

// Lấy danh sách sản phẩm với các tham số
export const getProducts = (params) => {
    return apiClient.get('/products', { params });
};

// Lấy danh sách danh mục (để dùng cho bộ lọc)
export const getCategories = () => {
    return apiClient.get('/categories');
};

// Tạo sản phẩm mới (dữ liệu là FormData vì có ảnh)
export const createProduct = (formData) => {
    return apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Cập nhật sản phẩm (dữ liệu là FormData)
export const updateProduct = (id, formData) => {
    return apiClient.patch(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Xóa sản phẩm (logic xóa mềm/cứng ở backend)
export const deleteProduct = (id) => {
    return apiClient.delete(`/products/${id}`);
};