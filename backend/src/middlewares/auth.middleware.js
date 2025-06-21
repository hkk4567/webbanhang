// src/middlewares/auth.middleware.js

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync'); // Dùng lại catchAsync nếu có

/**
 * Middleware để bảo vệ các route.
 * 1. Kiểm tra xem token có tồn tại không.
 * 2. Xác thực token.
 * 3. Kiểm tra xem người dùng của token đó còn tồn tại không.
 * 4. (Tùy chọn) Kiểm tra xem người dùng có đổi mật khẩu sau khi token được cấp không.
 */
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Lấy token và kiểm tra xem nó có tồn tại không
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Dành cho Mobile App hoặc các client gửi qua Header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        // Dành cho Web Browser gửi qua Cookie
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401)
        );
    }

    // 2) Xác thực token (Verification)
    // jwt.verify là hàm đồng bộ, nhưng ta dùng promisify để biến nó thành async/await cho nhất quán
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Kiểm tra xem người dùng có còn tồn tại trong DB không
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('Người dùng sở hữu token này không còn tồn tại.', 401)
        );
    }

    // 4) (Nâng cao) Kiểm tra xem người dùng có đổi mật khẩu sau khi token được cấp không
    //    Để làm được điều này, model User của bạn cần có một trường `passwordChangedAt`
    //    if (currentUser.changedPasswordAfter(decoded.iat)) {
    //        return next(
    //            new AppError('Mật khẩu đã được thay đổi gần đây. Vui lòng đăng nhập lại.', 401)
    //        );
    //    }

    // CẤP QUYỀN TRUY CẬP
    // Gắn thông tin người dùng đã được xác thực vào đối tượng `req`
    // để các middleware hoặc controller sau đó có thể sử dụng.
    req.user = currentUser;
    next(); // Nếu mọi thứ đều ổn, đi đến middleware/controller tiếp theo
});

// Middleware này giống hệt `protect`, nhưng nếu không có token, nó chỉ đơn giản là next()
// mà không báo lỗi. Điều này cho phép các route sau đó kiểm tra `if (req.user)`...
exports.checkUser = catchAsync(async (req, res, next) => {
    // 1) Lấy token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // Nếu không có token, cứ đi tiếp
    if (!token) {
        return next();
    }

    try {
        // 2) Xác thực token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Tìm user
        const currentUser = await User.findByPk(decoded.id);
        if (!currentUser) {
            return next();
        }

        // 4) Gắn user vào request
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    } catch (err) {
        // Nếu token không hợp lệ, cũng cứ đi tiếp
        return next();
    }
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // `req.user` được tạo ra từ middleware `protect` chạy trước đó.
        // `roles` là một mảng: ['admin', 'staff'].
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('Bạn không có quyền thực hiện hành động này.', 403) // 403 Forbidden
            );
        }
        next();
    };
};