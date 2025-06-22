const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware để bảo vệ các route.
 * Phiên bản nâng cấp để xử lý 2 loại cookie: 'jwt_admin' và 'jwt_user'.
 */
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Lấy token và kiểm tra xem nó có tồn tại không
    let token;
    const scope = req.headers['x-auth-scope'];
    if (scope === 'admin') {
        token = req.cookies.jwt_admin;
        if (!token) {
            // Rõ ràng yêu cầu scope admin nhưng không có token admin -> lỗi
            return next(new AppError('Phiên đăng nhập quản trị không hợp lệ hoặc đã hết hạn.', 401));
        }
    } else if (scope === 'user') {
        token = req.cookies.jwt_user;
        if (!token) {
            // Yêu cầu scope user nhưng không có token user -> lỗi
            return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401));
        }
    } else {
        // Nếu không có header X-Auth-Scope, từ chối request
        return next(new AppError('Yêu cầu không hợp lệ, không thể xác định scope xác thực.', 400));
    }

    // 2) Xác thực token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Kiểm tra xem người dùng có còn tồn tại không
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser || currentUser.status !== 'active') { // Thêm kiểm tra status
        return next(new AppError('Người dùng sở hữu token này không còn tồn tại hoặc đã bị khóa.', 401));
    }

    // 4) (Nâng cao) Kiểm tra đổi mật khẩu
    // if (currentUser.changedPasswordAfter(decoded.iat)) { ... }

    // CẤP QUYỀN TRUY CẬP
    req.user = currentUser;
    res.locals.user = currentUser; // Gắn vào res.locals để có thể dùng trong template engine (nếu có)
    next();
});

/**
 * Middleware kiểm tra người dùng một cách "lỏng lẻo".
 * Nếu có token hợp lệ -> gắn req.user. Nếu không -> bỏ qua.
 * Phiên bản nâng cấp để xử lý 2 loại cookie.
 */
exports.checkUser = catchAsync(async (req, res, next) => {
    let token;
    // Tương tự, ưu tiên kiểm tra admin trước rồi đến user
    const scope = req.headers['x-auth-scope'];

    if (scope === 'admin') {
        token = req.cookies.jwt_admin;
    } else if (scope === 'user') {
        token = req.cookies.jwt_user;
    }

    if (!token) {
        return next(); // Không có token, đi tiếp
    }

    try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findByPk(decoded.id);

        if (currentUser && currentUser.status === 'active') {
            // Chỉ gắn user nếu họ tồn tại và tài khoản active
            req.user = currentUser;
            res.locals.user = currentUser;
        }
    } catch (err) {
        // Token không hợp lệ -> bỏ qua, không báo lỗi
    }

    return next();
});


/**
 * Middleware giới hạn quyền truy cập theo vai trò.
 * Không cần thay đổi. Nó hoạt động dựa trên req.user đã được 'protect' tạo ra.
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
        }
        next();
    };
};