module.exports = {
    apps: [
        {
            name: 'express-app',
            script: 'src/server.js', // File chính của app
            instances: 1,
            exec_mode: 'fork',
        },
        {
            name: 'order-worker',
            script: 'src/workers/order_worker.js',
            instances: 1, // Bạn có thể tăng số lượng worker nếu cần xử lý nhiều hơn
        },
    ],
};