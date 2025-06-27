// src/controllers/config.controller.js (Tạo file mới)

const catchAsync = require('../utils/catchAsync');
const { createAndGetPublicSearchKey } = require('../services/meiliSearchService');

/**
 * Cung cấp các cấu hình cần thiết cho phía client.
 */
exports.getClientConfig = catchAsync(async (req, res, next) => {
    // Lấy Public Search Key
    const meiliSearchKey = await createAndGetPublicSearchKey();

    res.status(200).json({
        status: 'success',
        data: {
            // Gửi key này về cho client
            meiliSearchKey: meiliSearchKey,
            // Bạn cũng có thể gửi các thông tin khác ở đây
            meiliSearchHost: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
            meiliProductIndex: 'products',
        }
    });
});