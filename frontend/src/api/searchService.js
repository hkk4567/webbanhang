// src/services/searchService.js

import { MeiliSearch } from 'meilisearch';
// ===> THAY ĐỔI 1: Import instance axios đã được cấu hình sẵn
// Vui lòng điều chỉnh đường dẫn này cho phù hợp với cấu trúc dự án của bạn
import { publicApiClient } from '../api/apiClient';

// Biến để lưu trữ client sau khi khởi tạo (giữ nguyên)
// Đây là một dạng "singleton" pattern để đảm bảo client chỉ được khởi tạo một lần.
let meiliClient = null;
let productIndex = null;

// Hàm để lấy cấu hình từ backend và khởi tạo client
const initializeSearchClient = async () => {
    // Nếu đã khởi tạo, trả về ngay lập tức để tối ưu hiệu năng (giữ nguyên)
    if (meiliClient) {
        return { client: meiliClient, index: productIndex };
    }

    try {
        console.log("Đang lấy cấu hình tìm kiếm từ server...");

        // ===> THAY ĐỔI 2: Sử dụng publicApiClient để gọi API
        // Không cần truyền URL đầy đủ, chỉ cần endpoint
        const response = await publicApiClient.get('/config/client');

        const { meiliSearchHost, meiliSearchKey, meiliProductIndex } = response.data.data;

        // Khởi tạo client với thông tin nhận được (giữ nguyên)
        meiliClient = new MeiliSearch({
            host: meiliSearchHost,
            apiKey: meiliSearchKey,
        });

        productIndex = meiliClient.index(meiliProductIndex);

        console.log("Khởi tạo Meilisearch client thành công!");
        return { client: meiliClient, index: productIndex };

    } catch (error) {
        // Xử lý lỗi một cách chi tiết hơn
        console.error("Không thể khởi tạo Meilisearch client:", error.response ? error.response.data : error.message);
        return { client: null, index: null };
    }
};

// Hàm tìm kiếm sản phẩm (giữ nguyên, không cần thay đổi)
// Nó sẽ tự động được hưởng lợi từ `initializeSearchClient` đã được cập nhật.
export const searchProducts = async (query, options = {}) => {
    // Đảm bảo client đã được khởi tạo
    const { index } = await initializeSearchClient();

    if (!index) {
        console.error("Search index chưa sẵn sàng.");
        return { hits: [], estimatedTotalHits: 0 }; // Trả về kết quả rỗng
    }

    return index.search(query, options);
};