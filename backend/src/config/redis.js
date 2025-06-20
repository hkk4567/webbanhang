// src/config/redis.js
const { createClient } = require('redis');

// Tạo client
const redisClient = createClient({
    // Nếu Redis server của bạn có password hoặc chạy trên port khác, cấu hình ở đây
    // url: 'redis://:your_password@127.0.0.1:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Kết nối tới Redis
(async () => {
    await redisClient.connect();
    console.log('✅ Kết nối Redis thành công.');
})();

module.exports = redisClient;