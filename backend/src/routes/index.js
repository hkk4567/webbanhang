// src/routes/index.js

const express = require('express');
const router = express.Router();

// Import các file route con
const userRoute = require('./user.route');
const authRoute = require('./auth.route');     // Ví dụ khi có thêm route cho đăng nhập/đăng xuất
console.log('--- Trong routes/index.js, userRoute là:', typeof userRoute);
console.log('--- Trong routes/index.js, authRoute là:', typeof authRoute);
// Định nghĩa các đường dẫn gốc cho từng loại route
// Tất cả các route trong user.route.js sẽ có tiền tố là '/api/users'
router.use('/users', userRoute);
router.use('/auth', authRoute);

// Ví dụ mở rộng
// router.use('/products', productRoute);

module.exports = router;