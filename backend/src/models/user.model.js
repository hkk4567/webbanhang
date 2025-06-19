// src/models/user.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    // ---- Khóa chính ----
    id: {
        type: DataTypes.INTEGER.UNSIGNED, // Thêm UNSIGNED để khớp với DB
        autoIncrement: true,
        primaryKey: true,
    },

    // ---- Thông tin cá nhân ----
    fullName: {
        type: DataTypes.STRING(100), // Thêm độ dài để khớp với VARCHAR(100)
        allowNull: false,
        field: 'full_name' // Ánh xạ tới cột full_name trong DB
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            name: 'users_email_unique', // Đặt tên cho ràng buộc unique
            msg: 'Email này đã được sử dụng.' // Thông báo lỗi tùy chỉnh
        },
        validate: {
            isEmail: {
                msg: 'Vui lòng nhập một địa chỉ email hợp lệ.'
            }
        },
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true, // Cho phép để trống
        unique: {
            name: 'users_phone_unique',
            msg: 'Số điện thoại này đã được sử dụng.'
        }
    },

    // ---- Địa chỉ mặc định ----
    streetAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'street_address'
    },
    ward: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    district: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    province: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },

    // ---- Bảo mật & Phân quyền ----
    password: {
        type: DataTypes.STRING(255), // Độ dài 255 để khớp với cột DB
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

    // createdAt và updatedAt sẽ được Sequelize quản lý tự động
    // createdAt: {
    //   type: DataTypes.DATE,
    //   field: 'created_at'
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   field: 'updated_at'
    // }

}, {
    // ---- Tùy chọn cho Model ----
    tableName: 'users',
    timestamps: true, // Bật timestamps (created_at, updated_at)
    underscored: true, // Sử dụng snake_case cho các cột tự động (createdAt -> created_at)

    // ---- Hooks (Hành động tự động) ----
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    },

    // ---- Scopes (Tùy chọn) ----
    // Định nghĩa các "scope" để tái sử dụng các câu query phức tạp
    // Ví dụ: một scope để loại bỏ mật khẩu khi truy vấn
    scopes: {
        // Mặc định sẽ luôn loại bỏ trường password
        defaultScope: {
            attributes: { exclude: ['password'] },
        },
        // Một scope khác để lấy cả password (ví dụ khi cần xác thực đăng nhập)
        withPassword: {
            attributes: { include: ['password'] },
        }
    }
});

module.exports = User;