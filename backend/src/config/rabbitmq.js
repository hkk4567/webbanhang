// src/config/rabbitmq.js
const amqp = require('amqplib');

let connection = null;
let channel = null;

const rabbitmqUrl = 'amqp://myuser:mypassword@localhost:5672'; // URL từ docker-compose

const connectRabbitMQ = async () => {
    try {
        if (!channel) {
            connection = await amqp.connect(rabbitmqUrl);
            channel = await connection.createChannel();
            console.log('✅ Connected to RabbitMQ successfully!');

            // Khai báo các queue mà bạn sẽ dùng ở đây để đảm bảo chúng tồn tại
            await channel.assertQueue('order_processing', { durable: true });
            await channel.assertQueue('email_sending', { durable: true });
            // durable: true -> queue sẽ không bị mất khi RabbitMQ khởi động lại
        }
        return channel;
    } catch (error) {
        console.error('❌ Failed to connect to RabbitMQ:', error);
        // Có thể thêm logic retry ở đây
        process.exit(1); // Thoát ứng dụng nếu không kết nối được
    }
};

const getChannel = () => {
    if (!channel) {
        throw new Error("RabbitMQ channel not available. Call connectRabbitMQ first.");
    }
    return channel;
};

module.exports = { connectRabbitMQ, getChannel };