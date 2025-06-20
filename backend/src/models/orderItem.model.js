const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class OrderItem extends Model { }

OrderItem.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'order_id',
    },
    // productId có thể là NULL trong trường hợp sản phẩm gốc bị xóa vĩnh viễn
    // nhưng chúng ta vẫn giữ lại thông tin đơn hàng
    productId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: 'product_id',
    },
    quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },

    // ===== Dữ liệu "Snapshot" tại thời điểm mua hàng =====
    productName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'product_name',
    },
    productImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'product_image',
    },
    categoryName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'category_name',
    },
    productPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'product_price',
    },
}, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    // Bảng này chỉ có created_at, không có updated_at
    timestamps: true,
    updatedAt: false, // Tắt updatedAt
    underscored: true,
    createdAt: 'created_at',
});

module.exports = OrderItem;