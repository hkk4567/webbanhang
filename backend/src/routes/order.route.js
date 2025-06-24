const express = require('express');
const orderController = require('../controllers/order.controller.js');
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Tất cả các route đơn hàng đều yêu cầu đăng nhập
router.use(protect);
router.get('/my-orders', orderController.getMyOrders);
// API để tạo đơn hàng mới
router.post('/', orderController.createOrder);

// [GET] /api/orders/:id -> Lấy chi tiết một đơn hàng CỦA CHÍNH MÌNH
// Logic kiểm tra chủ sở hữu đơn hàng sẽ nằm trong controller
router.get('/:id', orderController.getOrderById);

// --- CÁC ROUTE CỦA ADMIN/STAFF ---
// Lấy tất cả đơn hàng (chỉ admin/staff được xem)
router.get('/', restrictTo('admin', 'staff'), orderController.getAllOrders);
router.get('/user/:userId', orderController.getOrdersByUserId);
// Cập nhật trạng thái của một đơn hàng
router.patch(
    '/:id/status', // Endpoint rõ ràng cho việc cập nhật status
    restrictTo('admin', 'staff'),
    orderController.updateOrderStatus
);

module.exports = router;