// src/workers/order_worker.js
// Đây là một file riêng, không phải là một phần của express app

const { connectRabbitMQ } = require('../config/rabbitmq');
const { Order, User, OrderItem } = require('../models'); // Worker cần truy cập models
const { sendConfirmationEmail } = require('../services/emailService');

async function startWorker() {
    try {
        // 1. Kết nối và lấy channel
        const channel = await connectRabbitMQ();
        const queue = 'order_processing';

        console.log(`[*] Worker is waiting for messages in ${queue}. To exit press CTRL+C`);

        // 2. Cấu hình Worker
        // Worker chỉ xử lý 1 tin nhắn tại một thời điểm
        channel.prefetch(1);

        // 3. Đăng ký hàm xử lý (consume) -> TOÀN BỘ LOGIC NẰM Ở ĐÂY
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const messageContent = JSON.parse(msg.content.toString());
                console.log(`[.] Received message:`, messageContent);

                try {
                    // Lấy thông tin đầy đủ từ CSDL
                    const order = await Order.findByPk(messageContent.orderId, {
                        include: [
                            { model: User, as: 'customer' },
                            { model: OrderItem, as: 'items' }
                        ]
                    });

                    if (order && order.customer) { // Kiểm tra xem order và customer có tồn tại không
                        await sendConfirmationEmail(order.customer.email, order);
                        console.log(`Confirmation email sent for order ${order.id}`);
                    } else {
                        console.log(`Order ${order.id} found, but associated customer not found. Cannot send email.`);
                    }

                    // Báo cho RabbitMQ biết đã xử lý xong
                    channel.ack(msg);
                    console.log(`[v] Done processing message for order ${messageContent.orderId}`);

                } catch (processingError) {
                    console.error('Error processing message:', processingError);
                    // Báo cho RabbitMQ biết xử lý thất bại
                    channel.nack(msg, false, false);
                }
            }
        }, {
            noAck: false
        });

    } catch (error) {
        console.error('Worker failed to start:', error);
    }
}

// 4. Gọi hàm để khởi động toàn bộ quá trình
startWorker();