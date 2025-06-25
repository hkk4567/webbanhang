const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Order extends Model { }

Order.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'user_id',
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    totalPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'total_price',
    },
    // --- Thông tin giao hàng ---
    shippingName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'shipping_name',
    },
    shippingPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'shipping_phone',
    },
    shippingStreet: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'shipping_street',
    },
    shippingWard: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'shipping_ward',
    },
    shippingDistrict: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'shipping_district',
    },
    shippingProvince: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'shipping_province',
    },
    // --- Thông tin khác ---
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'payment_method',
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_read', // Tên cột trong CSDL
    },
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Order;