// src/controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');
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

exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Vui lòng cung cấp email và mật khẩu!', 400));
        }

        const user = await User.scope('withPassword').findOne({ where: { email } });

        if (!user || !(await user.correctPassword(password))) {
            return next(new AppError('Email hoặc mật khẩu không chính xác.', 401));
        }

        // --- ĐIỂM KHÁC BIỆT QUAN TRỌNG ---
        // KIỂM TRA VAI TRÒ (ROLE)
        if (!['admin', 'staff'].includes(user.role)) {
            return next(new AppError('Bạn không có quyền truy cập trang quản trị.', 403)); // 403 Forbidden
        }

        if (user.status !== 'active') {
            return next(new AppError('Tài khoản của bạn đã bị khóa.', 403));
        }

        const token = signToken(user.id);

        // Đặt tên cookie khác để không ghi đè lên cookie của user
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };

        // Đặt tên cookie là 'jwt_admin'
        res.cookie('jwt_admin', token, cookieOptions);

        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token, // Vẫn trả về token để frontend có thể lưu vào LocalStorage nếu cần
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Hàm logout của admin cũng nên xóa cookie admin
exports.logoutAdmin = (req, res) => {
    res.cookie('jwt_admin', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success', message: 'Đăng xuất admin thành công' });
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

        const cookieOptions = {
            // Cookie sẽ hết hạn sau số ngày được cấu hình trong .env
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            // HttpOnly: Ngăn JavaScript phía client truy cập vào cookie -> Chống XSS
            httpOnly: true,
            // Secure: Chỉ gửi cookie qua kết nối HTTPS.
            // Bật cờ này khi deploy lên môi trường production.
            secure: process.env.NODE_ENV === 'production'
        };

        res.cookie('jwt_user', token, cookieOptions);

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

exports.logout = (req, res) => {
    // Nếu bạn lưu token trong cookie, hãy xóa nó
    res.cookie('jwt_user', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // Hết hạn sau 10s
        httpOnly: true
    });

    // Trả về một thông báo thành công
    res.status(200).json({ status: 'success', message: 'Đăng xuất thành công' });
};
// Bạn có thể thêm các chức năng khác vào đây trong tương lai
// exports.protect = ...
// exports.restrictTo = ...