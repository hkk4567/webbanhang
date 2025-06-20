const express = require('express');
const cartController = require('../controllers/cart.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// Tất cả các route giỏ hàng đều yêu cầu đăng nhập
router.use(protect);

router.route('/')
    .get(cartController.getCart)      // Lấy chi tiết giỏ hàng
    .post(cartController.addToCart)   // Thêm sản phẩm vào giỏ hàng
    .delete(cartController.clearCart); // Xóa sạch giỏ hàng

// Xóa một sản phẩm cụ thể khỏi giỏ hàng
router.route('/:productId')
    .delete(cartController.removeFromCart);

module.exports = router;