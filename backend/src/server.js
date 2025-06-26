// src/server.js

// 1. Nạp các biến môi trường
require('dotenv').config();

// 2. Import các thư viện và module cần thiết
const express = require('express');
const http = require('http'); // Cần module http của Node
const { Server } = require("socket.io"); // Import Server từ socket.io
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan'); // Thêm morgan để log request
const helmet = require('helmet'); // Thêm helmet để tăng cường bảo mật
const sequelize = require('./config/database');
require('./config/redis');    // Kết nối Redis
// Import các Routes
const mainRoutes = require('./routes');
// const productRoutes = require('./routes/product.route'); // Ví dụ thêm route khác

// Import Middleware xử lý lỗi
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/appError');
// 3. Khởi tạo ứng dụng Express
const app = express();
const server = http.createServer(app); // Tạo một server HTTP từ app Express
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // URL của frontend React
        methods: ["GET", "POST"],
        credentials: true // Cho phép gửi cookie và headers authorization
    }
});
// 4. Sử dụng các Middleware CƠ BẢN (phải được đặt trước các routes)
// Tăng cường bảo mật cho các HTTP headers
app.use(helmet());

// Cho phép các request từ các domain khác (cấu hình cho an toàn hơn trong production)
const corsOptions = {
    // Chỉ định chính xác origin của frontend mà bạn muốn cho phép
    origin: 'http://localhost:3000',
    // Cho phép gửi credentials (cookie, headers authorization)
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Scope'],
};

// Sử dụng cấu hình cors đã được định nghĩa
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
// Log các HTTP request ra console (chỉ trong môi trường development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middleware để đọc dữ liệu JSON và URL-encoded từ body của request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// 5. Kết nối Database
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối database thành công.');
    } catch (error) {
        console.error('❌ Không thể kết nối đến database:', error);
        process.exit(1); // Thoát ứng dụng nếu không thể kết nối DB
    }
})();

// 6. Định nghĩa các API Routes
app.get('/api/healthcheck', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('Một client đã kết nối:', socket.id);

    // Lắng nghe sự kiện khi một admin tham gia
    socket.on('joinAdminRoom', () => {
        console.log(`Client ${socket.id} đã tham gia phòng admin.`);
        socket.join('admin_notifications'); // Cho socket này vào phòng
    });

    socket.on('disconnect', () => {
        console.log('Client đã ngắt kết nối:', socket.id);
    });
});

// Gắn các routes của ứng dụng vào
app.use('/api', mainRoutes);

// 7. Sử dụng các Middleware XỬ LÝ LỖI (phải được đặt SAU CÙNG, sau tất cả các routes)
// Middleware cho các route không tồn tại (404 Not Found)
app.all('*', (req, res, next) => {
    next(new AppError(`Không tìm thấy đường dẫn ${req.originalUrl} trên server này!`, 404));
});

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

// 8. Khởi động Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên port ${PORT} ở môi trường ${process.env.NODE_ENV}`);
});

// (Nâng cao) Xử lý các lỗi chưa được bắt và tắt server an toàn
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Đang tắt server...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});