// src/routes/user.route.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// ----- TƯỞNG TƯỢNG BẠN SẼ CÓ CÁC MIDDLEWARE NÀY TRONG TƯƠNG LAI -----
// const { protect, restrictTo } = require('../middlewares/auth.middleware');
// `protect` sẽ kiểm tra xem người dùng đã đăng nhập chưa (có JWT hợp lệ không).
// `restrictTo` sẽ kiểm tra xem người dùng có quyền hạn cần thiết không (ví dụ: 'admin').


// =================================================================
// CÁC ROUTE CÔNG KHAI (Không cần đăng nhập)
// =================================================================

// [POST] /api/users/register -> Đăng ký tài khoản mới
// Đổi từ '/' sang '/register' để rõ ràng hơn, mặc dù dùng '/' cũng được.
router.post('/register', userController.createUser);

// [POST] /api/users/login -> Đăng nhập (bạn sẽ tạo controller cho nó sau)
// router.post('/login', authController.login);


// =================================================================
// CÁC ROUTE CẦN XÁC THỰC (Người dùng phải đăng nhập)
// =================================================================

// Dòng này áp dụng middleware `protect` cho TẤT CẢ các route được định nghĩa BÊN DƯỚI nó.
// router.use(protect);

// [GET] /api/users/me -> Lấy thông tin của chính người dùng đang đăng nhập
// router.get('/me', userController.getMe, userController.getUserById); // `getMe` là một middleware nhỏ để lấy id từ token

// [PATCH] /api/users/updateMe -> Cập nhật thông tin cá nhân của chính người dùng
// router.patch('/updateMe', userController.updateMe);


// =================================================================
// CÁC ROUTE CHỈ DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
// =================================================================

// Dòng này áp dụng thêm middleware `restrictTo('admin')` cho các route bên dưới.
// router.use(restrictTo('admin'));

// [GET] /api/users -> Lấy danh sách tất cả người dùng (chỉ admin được xem)
router.get('/', userController.getAllUsers);

// Nhóm các route có cùng đường dẫn '/:id' lại với nhau cho gọn
router
    .route('/:id')
    // [GET] /api/users/:id -> Lấy thông tin một người dùng theo ID
    .get(userController.getUserById)
    // [PUT] hoặc [PATCH] /api/users/:id -> Cập nhật thông tin người dùng
    // (PUT thường để thay thế toàn bộ, PATCH để cập nhật một phần)
    .patch(userController.updateUser)
    // [DELETE] /api/users/:id -> Xóa người dùng
    .delete(userController.deleteUser);


module.exports = router;