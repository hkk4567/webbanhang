// src/models/user.model.js - PHIÊN BẢN SỬA LỖI VÀ CHẮC CHẮN HOẠT ĐỘNG

const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {
    /**
     * Phương thức kiểm tra mật khẩu.
     * @param {string} candidatePassword - Mật khẩu người dùng gửi lên.
     * @returns {Promise<boolean>} - Trả về true nếu mật khẩu đúng.
     */
    async correctPassword(candidatePassword) {
        // `this.password` là mật khẩu đã được hash trong DB
        return bcrypt.compare(candidatePassword, this.password);
    }
}

User.init({
    // ---- Khóa chính ----
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    // ---- Thông tin cá nhân ----
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'full_name',
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
    },
    // ---- Địa chỉ ----
    streetAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'street_address',
    },
    ward: { type: DataTypes.STRING(100), allowNull: true },
    district: { type: DataTypes.STRING(100), allowNull: true },
    province: { type: DataTypes.STRING(100), allowNull: true },

    // ---- Bảo mật & Phân quyền ----
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin', 'staff'),
        allowNull: false,
        defaultValue: 'customer',
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'banned'),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,

    // Mặc định không trả về mật khẩu
    defaultScope: {
        attributes: { exclude: ['password'] },
    },
    scopes: {
        // Scope để lấy mật khẩu khi cần (lúc đăng nhập)
        withPassword: {
            attributes: { include: [] }, // Bao gồm tất cả các trường
        },
    },

    hooks: {
        // Tự động hash mật khẩu trước khi lưu
        beforeSave: async (user, options) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

module.exports = User;