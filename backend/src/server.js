// src/server.js

// 1. Nạp các biến môi trường
require('dotenv').config();

// 2. Import các thư viện và module cần thiết
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Thêm morgan để log request
const helmet = require('helmet'); // Thêm helmet để tăng cường bảo mật
const sequelize = require('./config/database');

// Import các Routes
const userRoutes = require('./routes/user.routes');
// const productRoutes = require('./routes/product.route'); // Ví dụ thêm route khác

// Import Middleware xử lý lỗi
const errorHandler = require('./middlewares/errorHandler');

// 3. Khởi tạo ứng dụng Express
const app = express();

// 4. Sử dụng các Middleware CƠ BẢN (phải được đặt trước các routes)
// Tăng cường bảo mật cho các HTTP headers
app.use(helmet());

// Cho phép các request từ các domain khác (cấu hình cho an toàn hơn trong production)
app.use(cors());

// Log các HTTP request ra console (chỉ trong môi trường development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware để đọc dữ liệu JSON và URL-encoded từ body của request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Kết nối Database
sequelize
    .authenticate()
    .then(() => console.log('✅ Kết nối database thành công.'))
    .catch((err) => console.error('❌ Không thể kết nối đến database:', err));

// 6. Định nghĩa các API Routes
app.get('/api/healthcheck', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Gắn các routes của ứng dụng vào
app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);

// 7. Sử dụng các Middleware XỬ LÝ LỖI (phải được đặt SAU CÙNG, sau tất cả các routes)
// Middleware cho các route không tồn tại (404 Not Found)
app.use((req, res, next) => {
    // Thêm điều kiện kiểm tra ở đây
    if (req.originalUrl.startsWith('/.well-known')) {
        // Nếu là request từ DevTools, chỉ cần trả về 204 No Content và không làm gì thêm
        // Trình duyệt sẽ nhận được phản hồi và sẽ không thử lại.
        return res.status(204).send();
    }

    // Đối với tất cả các route không khớp khác, vẫn tạo lỗi 404 như bình thường
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error); // Chuyển lỗi này đến errorHandler
});

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

// 8. Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên port ${PORT} ở môi trường ${process.env.NODE_ENV}`);
});