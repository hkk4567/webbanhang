// src/services/meiliSearchService.js (hoặc một tên tương tự)

const { MeiliSearch } = require('meilisearch');

// Khởi tạo client
const client = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
    apiKey: process.env.MEILI_MASTER_KEY, // Dùng Master Key ở backend
});
let publicSearchKey = null;
// Định nghĩa một hàm để lấy index
const getProductIndex = () => {
    return client.index('products'); // 'products' là tên chỉ mục của bạn
};

// Cấu hình chỉ mục (chạy một lần)
// Đây là nơi bạn dạy cho Meilisearch cách xử lý dữ liệu của bạn
const configureProductIndex = async () => {
    try {
        const index = getProductIndex();
        console.log('[Meili Service] Đang cấu hình chỉ mục "products"...');

        // Gửi yêu cầu cập nhật settings và không chờ đợi
        await index.updateSettings({
            // Các cấu hình settings chung
            filterableAttributes: ['categoryId', 'status', 'price'],
            sortableAttributes: ['price', 'name', 'createdAt'],
            searchableAttributes: [
                'name',
                'description',
                'category.name'
            ],
            displayedAttributes: [
                'id',
                'name',
                'price',
                'imageUrl',
                'categoryId',
                'status',
                'quantity',
                'description',
                'category'
            ],
            rankingRules: [
                "words", "typo", "proximity", "attribute", "sort", "exactness",
                "createdAt:desc"
            ]
        });

        // ===> XÓA HOẶC COMMENT DÒNG GÂY LỖI NÀY
        // await index.waitForTask(task.taskUid); // Gây lỗi, tạm thời xóa
        // await client.waitForTask(task.taskUid); // Cũng gây lỗi

        console.log('[Meili Service] Đã gửi yêu cầu cấu hình chỉ mục "products". Tác vụ sẽ được xử lý dưới nền.');
    } catch (error) {
        // Thêm khối try...catch để server không bị crash nếu có lỗi ở đây
        console.error("[Meili Service] Lỗi khi gửi yêu cầu cấu hình settings:", error);
        // Không ném lỗi ra ngoài để server có thể tiếp tục khởi động
    }
};

const createAndGetPublicSearchKey = async () => {
    // Nếu đã có key, trả về ngay lập tức để tránh gọi API không cần thiết
    if (publicSearchKey) {
        return publicSearchKey;
    }

    console.log('[Meili Service] Đang tạo hoặc lấy Public Search Key...');

    // 1. Lấy tất cả các key hiện có
    const { results: allKeys } = await client.getKeys();

    // 2. Tìm xem có key nào đã được tạo cho frontend chưa
    // Chúng ta sẽ dùng 'description' để nhận diện key của mình
    const searchKeyDescription = 'Frontend Public Search Key';
    let existingKey = allKeys.find(key => key.description === searchKeyDescription);

    // 3. Nếu key đã tồn tại, lưu và trả về nó
    if (existingKey) {
        console.log('[Meili Service] Đã tìm thấy Public Search Key có sẵn.');
        publicSearchKey = existingKey.key;
        return publicSearchKey;
    }

    // 4. Nếu không, tạo một key mới
    console.log('[Meili Service] Public Search Key chưa tồn tại, đang tạo key mới...');
    const newKey = await client.createKey({
        description: searchKeyDescription,
        // Chỉ cho phép hành động 'search'
        actions: ['search'],
        // Chỉ trên các index được chỉ định (an toàn)
        indexes: ['products'],
        // Không bao giờ hết hạn (bạn có thể đặt ngày hết hạn nếu muốn)
        expiresAt: null,
    });

    console.log('[Meili Service] Đã tạo Public Search Key thành công.');
    publicSearchKey = newKey.key;
    return publicSearchKey;
};

module.exports = {
    getProductIndex,
    configureProductIndex,
    createAndGetPublicSearchKey,
};