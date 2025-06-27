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
                const index = getProductIndex();
                console.log(`[Meili Hook] Kích hoạt afterSave cho sản phẩm ID: ${product.id}`);

                // Chuyển instance Sequelize thành JSON đơn giản.
                const productJson = product.toJSON();

                // Chuẩn bị dữ liệu để gửi đi.
                // Chúng ta sẽ lấy object `category` trực tiếp từ instance `product` nếu nó đã được `include`.
                const dataForMeili = {
                    ...productJson,
                    price: parseFloat(productJson.price) || 0,
                    // Dòng này sẽ lấy object `category` nếu nó tồn tại trong instance `product`,
                    // nếu không nó sẽ là undefined, và Meilisearch sẽ bỏ qua.
                    category: product.category ? product.category.toJSON() : undefined
                };

                // Nếu `category` chưa có (ví dụ: chỉ cập nhật tên sản phẩm), 
                // và chúng ta có `categoryId`, hãy thử lấy lại nó.
                if (!dataForMeili.category && product.categoryId) {
                    console.log(`[Meili Hook] Category chưa được nạp, đang tìm category ID: ${product.categoryId}...`);
                    // Sử dụng một cách an toàn để truy cập model Category
                    const CategoryModel = sequelize.models.Category;
                    const categoryData = await CategoryModel.findByPk(product.categoryId, {
                        attributes: ['id', 'name'],
                        transaction: options.transaction
                    });
                    if (categoryData) {
                        dataForMeili.category = categoryData.toJSON();
                    }
                }

                console.log(`[Meili Hook] Đang gửi dữ liệu ID: ${product.id} lên Meilisearch.`);
                await index.addDocuments([dataForMeili], { primaryKey: 'id' });

                console.log(`[Meili Hook] Đồng bộ hóa thành công sản phẩm ID: ${product.id}`);

            } catch (error) {
                console.error(`[Meili Hook] Lỗi khi đồng bộ hóa sản phẩm ID ${product.id} (afterSave):`, error.message);
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