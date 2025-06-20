const express = require('express');
const orderController = require('../controllers/order.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// Tất cả các route đơn hàng đều yêu cầu đăng nhập
router.use(protect);

// API để tạo đơn hàng mới
router.post('/', orderController.createOrder);

// Các API khác trong tương lai:
// router.get('/', orderController.getMyOrders); // Lấy danh sách đơn hàng của tôi
// router.get('/:id', orderController.getOrderDetails); // Lấy chi tiết một đơn hàng

module.exports = router;