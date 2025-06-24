import apiClient from './apiClient'; // Import object chứa các instance

// --- HÀM CHO TRANG QUẢN LÝ CỦA ADMIN ---

/**
 * Lấy danh sách danh mục có phân trang, tìm kiếm cho trang admin.
 * Sử dụng apiClient.admin để gửi request với scope 'admin'.
 * @param {object} params - Các tham số như page, limit, search, sort.
 * @returns {Promise}
 */
export const getAdminCategories = (params) => {
    // Gọi đến endpoint /admin mới mà chúng ta đã tạo
    return apiClient.admin.get('/categories/admin', { params });
};

/**
 * Tạo một danh mục mới.
 * Chỉ admin mới có quyền này.
 * @param {object} data - Dữ liệu của danh mục mới (ví dụ: { name, status }).
 * @returns {Promise}
 */
export const createCategory = (data) => {
    return apiClient.admin.post('/categories', data);
};

/**
 * Cập nhật một danh mục.
 * Chỉ admin mới có quyền này.
 * @param {string|number} id - ID của danh mục cần cập nhật.
 * @param {object} data - Dữ liệu cần cập nhật.
 * @returns {Promise}
 */
export const updateCategory = (id, data) => {
    return apiClient.admin.patch(`/categories/${id}`, data);
};

/**
 * Xóa một danh mục.
 * Chỉ admin mới có quyền này.
 * @param {string|number} id - ID của danh mục cần xóa.
 * @returns {Promise}
 */
export const deleteCategory = (id) => {
    return apiClient.admin.delete(`/categories/${id}`);
};


// --- HÀM CÔNG KHAI / DÙNG CHUNG ---

/**
 * Lấy danh sách tất cả danh mục (phiên bản đơn giản, không phân trang).
 * Dùng cho các nơi công khai như thanh điều hướng, trang sản phẩm của khách hàng.
 * Sử dụng apiClient.user để gửi request, có thể được xử lý bởi middleware checkUser.
 * @returns {Promise}
 */
export const getAllPublicCategories = () => {
    // Gọi đến endpoint GET /categories gốc
    return apiClient.user.get('/categories');
};