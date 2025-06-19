// src/routes/user.route.js

const express = require('express');
// SỬA LẠI DÒNG NÀY: THÊM .js VÀO CUỐI
const userController = require('../controllers/user.controller.js');
const router = express.Router();

// [POST] /api/users/register -> Đăng ký tài khoản mới.
// Route này trong file gốc của bạn là router.post('/', ...)
// Nhưng vì trong index.js đã là /users, nên route này sẽ là /api/users/
// Tôi đổi lại thành /register để đúng với ý đồ ban đầu của bạn
router.post('/register', userController.createUser);

// [GET] /api/users -> Lấy danh sách tất cả người dùng
router.get('/', userController.getAllUsers);

// Nhóm các route có cùng đường dẫn '/:id' lại với nhau cho gọn
router
    .route('/:id')
    // [GET] /api/users/:id -> Lấy thông tin một người dùng theo ID
    .get(userController.getUserById)
    // [PATCH] /api/users/:id -> Cập nhật thông tin người dùng
    .patch(userController.updateUser)
    // [DELETE] /api/users/:id -> Xóa người dùng
    .delete(userController.deleteUser);

module.exports = router;