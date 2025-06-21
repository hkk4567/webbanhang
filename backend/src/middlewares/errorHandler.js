// src/middlewares/errorHandler.js

const AppError = require('../utils/appError');

/**
 * Xử lý lỗi Sequelize Unique Constraint (lỗi dữ liệu bị trùng lặp).
 * @param {object} err - Đối tượng lỗi từ Sequelize.
 * @returns {AppError} - Một đối tượng AppError mới với thông báo thân thiện.
 */
const handleUniqueConstraintError = (err) => {
    const errors = err.errors.map(el =>
        `Giá trị '${el.value}' cho trường '${el.path}' đã tồn tại.`
    );
    const message = `Dữ liệu không hợp lệ. ${errors.join(' ')}`;
    return new AppError(message, 400); // 400: Bad Request
};

/**
 * Xử lý lỗi Sequelize Validation (ví dụ: email không đúng định dạng, trường bắt buộc bị thiếu).
 * @param {object} err - Đối tượng lỗi từ Sequelize.
 * @returns {AppError} - Một đối tượng AppError mới.
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Dữ liệu nhập vào không hợp lệ. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/**
 * Xử lý lỗi JWT không hợp lệ.
 * @returns {AppError} - AppError với thông báo lỗi xác thực.
 */
const handleJWTError = () => new AppError('Token không hợp lệ. Vui lòng đăng nhập lại!', 401);

/**
 * Xử lý lỗi JWT đã hết hạn.
 * @returns {AppError} - AppError với thông báo lỗi xác thực.
 */
const handleJWTExpiredError = () => new AppError('Token đã hết hạn. Vui lòng đăng nhập lại!', 401);

// Hàm gửi lỗi trong môi trường Development
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

// Hàm gửi lỗi trong môi trường Production
const sendErrorProd = (err, res) => {
    // A) Lỗi có thể dự đoán (operational), gửi thông báo cho client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // B) Lỗi lập trình hoặc lỗi không xác định: không rò rỉ chi tiết
    } else {
        // 1) Log lỗi ra console để dev biết
        console.error('💥 ERROR 💥', err);

        // 2) Gửi một thông báo chung chung cho client
        res.status(500).json({
            status: 'error',
            message: 'Đã có lỗi xảy ra trên server.',
        });
    }
};

// Middleware xử lý lỗi chính
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        console.error(`Lỗi tại: ${req.method} ${req.originalUrl}`);
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // Tạo một bản sao của lỗi để không thay đổi lỗi gốc
        let error = { ...err, name: err.name, message: err.message, errors: err.errors };

        // Xử lý các loại lỗi cụ thể và chuyển chúng thành lỗi operational
        if (error.name === 'SequelizeUniqueConstraintError') error = handleUniqueConstraintError(error);
        if (error.name === 'SequelizeValidationError') error = handleValidationError(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};