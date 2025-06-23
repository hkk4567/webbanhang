import apiClient from './apiClient';

// =============================================
// === API CHO TRANG CÔNG KHAI (PUBLIC) ===
// =============================================

/**
 * Lấy danh sách sản phẩm công khai (chỉ các sản phẩm active).
 * @param {object} params - Các tham số lọc, sắp xếp, phân trang.
 * Ví dụ: { categoryId: 1, sort: 'price-asc', page: 2 }
 */
export const getProducts = (params) => {
    // Gọi đến endpoint GET /products
    return apiClient.user.get('/products', { params });
};

/**
 * Lấy chi tiết một sản phẩm công khai.
 * @param {string|number} id - ID của sản phẩm.
 */
export const getProductById = (id) => {
    // Gọi đến endpoint GET /products/:id
    return apiClient.user.get(`/products/${id}`);
};


// =============================================
// === API CHO TRANG QUẢN TRỊ (ADMIN) ===
// =============================================

/**
 * Lấy danh sách sản phẩm cho trang quản trị (lấy tất cả các trạng thái).
 * @param {object} params - Các tham số lọc, sắp xếp, phân trang.
 * Ví dụ: { status: 'inactive', search: 'áo', page: 1 }
 */
export const getAdminProducts = (params) => {
    // Gọi đến endpoint GET /products/admin mà chúng ta đã tạo
    return apiClient.admin.get('/products', { params });
};

/**
 * Tạo một sản phẩm mới.
 * @param {FormData} formData - Dữ liệu sản phẩm, bao gồm cả file ảnh.
 */
export const createProduct = (formData) => {
    // Endpoint POST /products được bảo vệ cho admin
    return apiClient.admin.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Cập nhật một sản phẩm.
 * @param {string|number} id - ID của sản phẩm cần cập nhật.
 * @param {FormData} formData - Dữ liệu sản phẩm, bao gồm cả file ảnh (nếu có).
 */
export const updateProduct = (id, formData) => {
    // Endpoint PATCH /products/:id được bảo vệ cho admin
    return apiClient.admin.patch(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Xóa một sản phẩm.
 * @param {string|number} id - ID của sản phẩm cần xóa.
 */
export const deleteProduct = (id) => {
    // Endpoint DELETE /products/:id được bảo vệ cho admin
    return apiClient.admin.delete(`/products/${id}`);
};


// =============================================
// === API CHUNG (PUBLIC) ===
// =============================================

/**
 * Lấy danh sách tất cả các danh mục.
 */
export const getCategories = (scope = 'user') => {
    // Kiểm tra xem scope có hợp lệ không, nếu không thì mặc định là 'user'
    const client = apiClient[scope] || apiClient.user;

    // Gọi API bằng client đã được chọn
    return client.get('/categories');
};