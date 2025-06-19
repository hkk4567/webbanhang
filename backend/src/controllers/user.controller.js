// src/controllers/user.controller.js

const User = require('../models/user.model');

/**
 * Xử lý lỗi validation từ Sequelize một cách gọn gàng.
 * @param {Error} error - Đối tượng lỗi từ Sequelize.
 * @param {Response} res - Đối tượng response của Express.
 */
const handleSequelizeError = (error, res) => {
    // Lấy ra các thông báo lỗi từ mảng errors của Sequelize
    const errors = error.errors.map(e => e.message);
    return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không hợp lệ.',
        errors: errors,
    });
};


// 1. Chức năng ĐỌC: Lấy tất cả người dùng
const getAllUsers = async (req, res, next) => {
    try {
        // Không cần `attributes: { exclude: ['password'] }` nữa!
        // Vì `defaultScope` trong model đã tự động làm việc này.
        const users = await User.findAll();
        res.status(200).json({
            status: 'success',
            data: { users },
        });
    } catch (error) {
        // Chuyển lỗi đến errorHandler tập trung
        next(error);
    }
};

// 2. Chức năng ĐỌC: Lấy một người dùng theo ID
const getUserById = async (req, res, next) => {
    try {
        // `defaultScope` cũng hoạt động với findByPk
        const user = await User.findByPk(req.params.id);
        if (!user) {
            // Tạo một lỗi và chuyển đi, thay vì trả về response trực tiếp
            const error = new Error('Không tìm thấy người dùng');
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// 3. Chức năng THÊM: Tạo người dùng mới (Đăng ký)
const createUser = async (req, res, next) => {
    try {
        // Lấy tất cả các trường từ body
        const {
            fullName, email, phone, streetAddress, ward, district, province,
            password, role, status
        } = req.body;

        // `User.create` sẽ tự động hash mật khẩu nhờ `hooks` trong model
        const newUser = await User.create({
            fullName, email, phone, streetAddress, ward, district, province,
            password, role, status
        });

        // Không cần `delete newUser.password` nữa, vì `defaultScope` đã làm việc này!
        res.status(201).json({
            status: 'success',
            message: 'Tạo người dùng thành công',
            data: { user: newUser },
        });
    } catch (error) {
        // Xử lý lỗi validation và unique một cách chuyên nghiệp
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return handleSequelizeError(error, res);
        }
        // Chuyển các lỗi khác (ví dụ lỗi server) đến errorHandler
        next(error);
    }
};

// 4. Chức năng SỬA: Cập nhật thông tin người dùng
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            const error = new Error('Không tìm thấy người dùng');
            error.statusCode = 404;
            return next(error);
        }

        // Lấy các trường có thể cập nhật từ body
        const {
            fullName, email, phone, streetAddress, ward, district, province,
            password, role, status
        } = req.body;

        // `user.update` sẽ tự động hash mật khẩu nếu `password` được thay đổi
        await user.update({
            fullName, email, phone, streetAddress, ward, district, province,
            password, role, status
        });

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật người dùng thành công',
            data: { user },
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return handleSequelizeError(error, res);
        }
        next(error);
    }
};

// 5. Chức năng XÓA: Xóa một người dùng
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            const error = new Error('Không tìm thấy người dùng');
            error.statusCode = 404;
            return next(error);
        }

        await user.destroy();
        // Trả về status 204 No Content là một chuẩn RESTful cho việc xóa thành công
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};