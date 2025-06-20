const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Category extends Model { }

Category.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Tên danh mục nên là duy nhất
    },
    // Khóa ngoại để tạo cây danh mục (cha-con)
    // Ví dụ: "Áo Sơ Mi" là con của "Thời Trang Nam"
    parentId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: 'parent_id',
        references: {
            model: 'categories', // Tham chiếu đến chính bảng 'categories'
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Category;