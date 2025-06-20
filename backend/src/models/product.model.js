const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

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
});

module.exports = Product;