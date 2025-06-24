// src/routes/index.js

const express = require('express');
const router = express.Router();

// Import các file route con
const userRoute = require('./user.route');
const authRoute = require('./auth.route');     // Ví dụ khi có thêm route cho đăng nhập/đăng xuất
const productRoute = require('./product.route');
const cartRoute = require('./cart.route');
const orderRoute = require('./order.route');
const categoryRoute = require('./category.route');
const statsRouter = require('./stats.route');
// Định nghĩa các đường dẫn gốc cho từng loại route
// Tất cả các route trong user.route.js sẽ có tiền tố là '/api/users'
router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/products', productRoute);
router.use('/cart', cartRoute);
router.use('/orders', orderRoute);
router.use('/categories', categoryRoute);
router.use('/stats', statsRouter);
module.exports = router;