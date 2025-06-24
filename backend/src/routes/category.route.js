const express = require('express');
const categoryController = require('../controllers/category.controller.js');
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

// --- ROUTE CÔNG KHAI ---
// Bất kỳ ai cũng có thể xem danh sách danh mục và chi tiết một danh mục
router.get('/', authMiddleware.checkUser, categoryController.getAllCategories);
router.get(
    '/admin',
    protect, // Áp dụng middleware bảo vệ
    restrictTo('admin'), // Giới hạn chỉ cho admin
    categoryController.getAdminCategories // Gọi controller
);
router.get('/:id', authMiddleware.checkUser, categoryController.getCategory);

// --- CÁC ROUTE CỦA ADMIN ---
// Áp dụng middleware bảo vệ và giới hạn quyền cho các route bên dưới
router.use(protect, restrictTo('admin'));

// Chỉ admin mới được tạo danh mục
router.post('/', categoryController.createCategory);

// Chỉ admin mới được sửa, xóa
router.route('/:id')
    .patch(categoryController.updateCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;