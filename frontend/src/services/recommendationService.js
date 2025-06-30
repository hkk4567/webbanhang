// src/services/recommendationService.js

import axios from 'axios';

// Cấu hình địa chỉ gốc của API.
// Thay đổi nếu API của bạn chạy trên một địa chỉ khác.
// 'http://127.0.0.1:5000' là địa chỉ mặc định khi bạn chạy Flask trên máy local.
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Lấy danh sách sản phẩm gợi ý cho một người dùng cụ thể.
 * @param {object} params - Các tham số cho yêu cầu.
 * @param {number} params.userId - ID của người dùng.
 * @param {number} [params.numRecs=5] - Số lượng sản phẩm gợi ý muốn nhận.
 * @param {number} [params.alpha=0.5] - Trọng số cho mô hình (0.0 đến 1.0).
 * @returns {Promise<Array>} - Một promise trả về một mảng các đối tượng sản phẩm.
 */
export const getRecommendationsForUser = async ({ userId, numRecs = 5, alpha = 0.5 }) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/recommendations/user`, {
            params: {
                user_id: userId,
                num_recs: numRecs,
                alpha: alpha,
            },
        });
        // axios trả về dữ liệu trong thuộc tính 'data'
        return response.data;
    } catch (error) {
        // Xử lý lỗi một cách chi tiết hơn
        console.error("Error fetching user recommendations:", error.response ? error.response.data : error.message);
        // Trả về một mảng rỗng hoặc ném lỗi để component có thể xử lý
        return [];
    }
};

/**
 * Lấy danh sách các sản phẩm tương tự với một sản phẩm cho trước.
 * @param {object} params - Các tham số cho yêu cầu.
 * @param {number} params.productId - ID của sản phẩm.
 * @param {number} [params.numSimilar=3] - Số lượng sản phẩm tương tự muốn nhận.
 * @returns {Promise<Array>} - Một promise trả về một mảng các đối tượng sản phẩm.
 */
export const getSimilarProducts = async ({ productId, numSimilar = 3 }) => {
    if (!productId) {
        throw new Error("Product ID is required.");
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/recommendations/item`, {
            params: {
                product_id: productId,
                num_similar: numSimilar,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching similar products:", error.response ? error.response.data : error.message);
        return [];
    }
};