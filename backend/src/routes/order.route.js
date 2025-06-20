const express = require('express');
const orderController = require('../controllers/order.controller.js');
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Tất cả các route đơn hàng đều yêu cầu đăng nhập
router.use(protect);

// API để tạo đơn hàng mới
router.post('/', orderController.createOrder);

// --- CÁC ROUTE CỦA ADMIN/STAFF ---

// Lấy tất cả đơn hàng (chỉ admin/staff được xem)
router.get('/', restrictTo('admin', 'staff'), orderController.getAllOrders);

// Cập nhật trạng thái của một đơn hàng
router.patch(
    '/:id/status', // Endpoint rõ ràng cho việc cập nhật status
    restrictTo('admin', 'staff'),
    orderController.updateOrderStatus
);

module.exports = router;