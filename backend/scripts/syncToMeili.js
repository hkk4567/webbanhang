// scripts/syncToMeili.js

const { Product, Category } = require('../src/models');
const { getProductIndex } = require('../src/services/meiliSearchService');
require('dotenv').config();

const sync = async () => {
    console.log('Bắt đầu đồng bộ toàn bộ sản phẩm từ MySQL tới Meilisearch...');

    // 1. Lấy dữ liệu sản phẩm KÈM THEO thông tin danh mục
    // KHÔNG dùng `raw: true` ở đây, vì chúng ta cần các instance của Sequelize để gọi .toJSON()
    const productsFromDb = await Product.findAll({
        include: {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        },
    });

    if (productsFromDb.length === 0) {
        console.log('Không có sản phẩm nào để đồng bộ.');
        return;
    }

    // 2. Chuẩn hóa dữ liệu (Bước QUAN TRỌNG)
    console.log('Đang chuẩn hóa dữ liệu (gọi toJSON và chuyển đổi price)...');

    // Dùng .map() để lặp qua từng instance của Sequelize
    const productsForMeili = productsFromDb.map(productInstance => {
        // Gọi .toJSON() để lấy một object JSON sạch, không có tham chiếu vòng tròn
        const productJson = productInstance.toJSON();

        // Bây giờ mới thực hiện các chuyển đổi khác trên object JSON sạch này
        return {
            ...productJson,
            price: productJson.price ? parseFloat(productJson.price) : 0
        };
    });

    // ... (Phần còn lại của file giữ nguyên)
    const index = getProductIndex();
    const options = { primaryKey: 'id' };
    const chunkSize = 500;
    for (let i = 0; i < productsForMeili.length; i += chunkSize) {
        const chunk = productsForMeili.slice(i, i + chunkSize);
        console.log(`Đang gửi ${chunk.length} sản phẩm (bắt đầu từ vị trí ${i})...`);
        await index.addDocuments(chunk, options);
    }
    console.log(`Đồng bộ thành công ${productsForMeili.length} sản phẩm!`);
    process.exit();
};

sync().catch(err => {
    console.error("Đồng bộ thất bại:", err);
    process.exit(1);
});