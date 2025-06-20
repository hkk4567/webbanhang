// src/routes/product.route.js
const express = require('express');
const productController = require('../controllers/product.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const { upload } = require('../utils/cloudinary.js'); // Import middleware upload

const router = express.Router();

// --- ROUTE CÔNG KHAI ---
// [GET] /api/products -> Lấy danh sách tất cả sản phẩm đang bán
router.get('/', authMiddleware.checkUser, productController.getAllProducts);

// [GET] /api/products/:id -> Lấy thông tin chi tiết một sản phẩm
router.get('/:id', authMiddleware.checkUser, productController.getProductById);

// --- CÁC ROUTE CỦA ADMIN ---
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

// Thêm sản phẩm mới (chấp nhận 1 file ảnh có field name là 'image')
router.post('/', upload.single('image'), productController.createProduct);


router.route('/:id')
    .patch(upload.single('image'), productController.updateProduct) // Cập nhật cũng có thể có ảnh
    .delete(productController.deleteProduct);

module.exports = router;