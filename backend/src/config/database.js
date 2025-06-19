// src/config/database.js

// 1. Import thư viện Sequelize
const { Sequelize } = require('sequelize');

// 2. Import dotenv để nạp các biến môi trường từ file .env
//    Đảm bảo bạn đã gọi require('dotenv').config() ở file server.js chính rồi.
//    Tuy nhiên, gọi lại ở đây cũng không sao, nó giúp file này có thể chạy độc lập để test.
require('dotenv').config();

// 3. Khởi tạo một instance của Sequelize với các thông tin kết nối từ file .env
const sequelize = new Sequelize(
    // Tên database
    process.env.DB_NAME,
    // Tên user
    process.env.DB_USER,
    // Mật khẩu
    process.env.DB_PASSWORD,
    {
        // Host của database
        host: process.env.DB_HOST,
        // Port của database
        port: process.env.DB_PORT,
        // Loại cơ sở dữ liệu bạn đang dùng (mysql, postgres, sqlite, mssql)
        dialect: process.env.DB_DIALECT,

        // Cấu hình logging (quan trọng để debug)
        // Mặc định, Sequelize sẽ log tất cả các câu lệnh SQL ra console.
        // Để tắt log, bạn có thể đặt là `false`.
        // Hoặc bạn có thể dùng một hàm log tùy chỉnh.
        logging: console.log, // Hoặc `logging: false` cho môi trường production

        // Cấu hình pool kết nối (tùy chọn nhưng được khuyên dùng cho production)
        // Pool giúp quản lý và tái sử dụng các kết nối đến DB, tăng hiệu năng.
        pool: {
            max: 5,     // Số kết nối tối đa trong pool
            min: 0,     // Số kết nối tối thiểu trong pool
            acquire: 30000, // Thời gian tối đa (ms) để cố gắng có được một kết nối trước khi báo lỗi
            idle: 10000   // Thời gian tối đa (ms) một kết nối có thể "nhàn rỗi" trước khi được giải phóng
        },

        // Cấu hình khác (tùy chọn)
        define: {
            // Tùy chọn này đảm bảo Sequelize không tự động đổi tên bảng thành số nhiều
            // Nếu bạn đã đặt tên bảng là số nhiều (ví dụ: 'users'), hãy bật nó lên.
            // freezeTableName: true,

            // Dùng quy tắc snake_case cho các cột được tự động tạo (createdAt, updatedAt)
            // Điều này giúp nhất quán với quy tắc đặt tên của bạn.
            underscored: true
        }
    }
);

// 4. Xuất (export) instance của sequelize để các file khác có thể sử dụng
module.exports = sequelize;