// src/utils/appError.js

class AppError extends Error {
    /**
     * @param {string} message - Thông báo lỗi cho client
     * @param {number} statusCode - Mã trạng thái HTTP (ví dụ: 400, 404, 500)
     */
    constructor(message, statusCode) {
        // Gọi constructor của lớp cha (Error) với message
        super(message);

        this.statusCode = statusCode;
        // Xác định trạng thái dựa trên statusCode
        // 4xx là 'fail' (lỗi từ client), 5xx là 'error' (lỗi từ server)
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Đánh dấu đây là một lỗi vận hành (operational error)
        // để phân biệt với các lỗi lập trình hoặc lỗi hệ thống khác.
        this.isOperational = true;

        // Ghi lại stack trace để debug, nhưng không bao gồm hàm constructor này
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;