// src/middlewares/errorHandler.js

/**
 * Middleware xử lý lỗi tập trung.
 * Nó phải có 4 tham số (err, req, res, next) để Express nhận diện là middleware xử lý lỗi.
 */
const errorHandler = (err, req, res, next) => {
    // Lấy status code từ lỗi (nếu có), nếu không thì mặc định là 500 (Lỗi Server)
    const statusCode = err.statusCode || 500;

    // Log lỗi ra console ở môi trường phát triển để dễ debug
    if (process.env.NODE_ENV === 'development') {
        console.error('---------------------------------');
        console.error(`Lỗi tại: ${req.method} ${req.originalUrl}`);
        console.error(err.stack); // In ra toàn bộ stack trace của lỗi
        console.error('---------------------------------');
    }

    // Trả về một response lỗi chuẩn cho client
    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        // Chỉ trả về message lỗi. Không trả về err.stack ở production để tránh lộ thông tin.
        message: err.message || 'Đã có lỗi xảy ra trên server.',
    });
};

module.exports = errorHandler;