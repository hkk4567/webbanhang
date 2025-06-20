// src/utils/catchAsync.js

/**
 * Hàm này nhận vào một hàm controller (fn) và trả về một hàm mới.
 * Hàm mới này sẽ bắt bất kỳ lỗi nào xảy ra trong hàm controller (fn)
 * và chuyển nó đến middleware xử lý lỗi toàn cục thông qua `next()`.
 *
 * @param {Function} fn - Hàm controller bất đồng bộ (async).
 * @returns {Function} - Một hàm mới có khả năng bắt lỗi.
 */
const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err));
    };
};

module.exports = catchAsync;