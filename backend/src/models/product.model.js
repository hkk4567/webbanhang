const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { getProductIndex } = require('../services/meiliSearchService');
class Product extends Model { }

Product.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true, field: 'image_url' },
    categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'category_id' },
    status: { type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'), defaultValue: 'active' },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        /**
         * Hook này sẽ chạy sau khi một record được TẠO hoặc CẬP NHẬT thành công trong DB.
         * @param {Product} product - Instance của sản phẩm vừa được lưu.
         * @param {object} options - Các tùy chọn của query (bao gồm transaction nếu có).
         */
        afterSave: async (product, options) => {
            try {
                const fullProductData = await Product.findByPk(product.id, {
                    include: {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                });

                if (!fullProductData) return;
                // Lấy ra index 'products' từ Meilisearch
                const index = getProductIndex();
                console.log(`[Meili Hook] Đang đồng bộ hóa sản phẩm ID: ${product.id} (afterSave)`);

                // 1. Chuyển instance Sequelize thành JSON đơn giản
                const productData = fullProductData.toJSON();

                // 2. Chuẩn hóa dữ liệu trước khi gửi (QUAN TRỌNG)
                const dataForMeili = {
                    ...productData,
                    price: parseFloat(productData.price) || 0
                };

                // 3. Gửi dữ liệu đã được chuẩn hóa
                // primaryKey không cần thiết ở đây vì index đã được tạo với khóa chính rồi
                await index.addDocuments([dataForMeili]);
                console.log(`[Meili Hook] Đồng bộ hóa thành công sản phẩm ID: ${product.id}`);
            } catch (error) {
                // Log lỗi ra để debug mà không làm sập ứng dụng
                console.error(`[Meili Hook] Lỗi khi đồng bộ hóa sản phẩm ID ${product.id} (afterSave):`, error);
            }
        },

        /**
         * Hook này sẽ chạy sau khi một record bị XÓA thành công khỏi DB.
         * @param {Product} product - Instance của sản phẩm vừa bị xóa.
         * @param {object} options - Các tùy chọn của query.
         */
        afterDestroy: async (product, options) => {
            try {
                // Lấy ra index 'products' từ Meilisearch
                const index = getProductIndex();
                console.log(`[Meili Hook] Đang xóa sản phẩm ID: ${product.id} (afterDestroy)`);

                // Gửi lệnh xóa document có id tương ứng khỏi Meilisearch
                await index.deleteDocument(product.id);

            } catch (error) {
                // Log lỗi ra để debug
                console.error(`[Meili Hook] Lỗi khi xóa sản phẩm ID ${product.id} (afterDestroy):`, error);
            }
        },
    }
});

module.exports = Product;