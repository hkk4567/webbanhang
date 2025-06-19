// src/controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError'); // Bạn nên có file này để tạo lỗi chuẩn hóa

/**
 * Hàm tạo và ký một JSON Web Token
 * @param {string} id - ID của người dùng
 * @returns {string} - JWT đã được ký
 */
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra xem email và password có tồn tại không
        if (!email || !password) {
            return next(new AppError('Vui lòng cung cấp email và mật khẩu!', 400));
        }

        // 2. Tìm người dùng trong DB và lấy cả mật khẩu
        //    Sử dụng scope 'withPassword' để ghi đè defaultScope!
        const user = await User.scope('withPassword').findOne({ where: { email } });

        // 3. Nếu không có user hoặc mật khẩu sai, báo lỗi
        //    Sử dụng phương thức `correctPassword` chúng ta vừa thêm vào model
        if (!user || !(await user.correctPassword(password))) {
            return next(new AppError('Email hoặc mật khẩu không chính xác.', 401));
        }

        // 4. Kiểm tra xem tài khoản có bị khóa không
        if (user.status !== 'active') {
            return next(new AppError('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.', 403));
        }

        // 5. Nếu mọi thứ đều đúng, tạo và gửi token cho client
        const token = signToken(user.id);

        // Quan trọng: Sau khi đã xác thực xong, loại bỏ mật khẩu khỏi đối tượng user
        // trước khi gửi về cho client.
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Bạn có thể thêm các chức năng khác vào đây trong tương lai
// exports.protect = ...
// exports.restrictTo = ...