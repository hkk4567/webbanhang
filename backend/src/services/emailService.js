// src/services/emailService.js

const nodemailer = require('nodemailer');
const { default: hbs } = require('nodemailer-express-handlebars');
console.log(typeof hbs);
console.log(hbs);
const path = require('path');

// Cấu hình Nodemailer Transporter
const createTransporter = () => {
    // --- CẤU HÌNH CHO GMAIL (PRODUCTION) ---
    // Bạn cần tạo Mật khẩu ứng dụng cho Gmail
    // Thêm các biến này vào file .env của bạn
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: process.env.MAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER, // email của bạn
            pass: process.env.MAIL_PASS, // Mật khẩu ứng dụng
        },
    });

    // --- CẤU HÌNH CHO ETHEREAL (DEVELOPMENT) ---
    // Bỏ comment đoạn dưới và comment đoạn trên nếu muốn dùng Ethereal

    // return nodemailer.createTransport({
    //     host: 'smtp.ethereal.email',
    //     port: 587,
    //     auth: {
    //         user: 'liana25@ethereal.email', // Thay bằng tài khoản Ethereal của bạn
    //         pass: 'ExhJ35jnX1BxePWADN'        // Thay bằng mật khẩu Ethereal của bạn
    //     }
    // });

};

const transporter = createTransporter();

// Cấu hình Handlebars cho template email
const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('./src/views/emails/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./src/views/emails/'),
    extName: '.hbs',
};

// Sử dụng plugin cho transporter
transporter.use('compile', hbs(handlebarOptions));

/**
 * Gửi email xác nhận đơn hàng
 * @param {string} recipientEmail - Email người nhận
 * @param {object} order - Object đơn hàng từ Sequelize
 */
const sendConfirmationEmail = async (recipientEmail, order) => {
    try {
        console.log('--- [DEBUG] Raw order.createdAt from worker:', order.createdAt);
        console.log('--- [DEBUG] Type of order.createdAt:', typeof order.createdAt);
        const mailOptions = {
            from: `"cafe nhà làm" <${process.env.MAIL_USER}>`,
            to: recipientEmail,
            subject: `Xác nhận đơn hàng #${order.id}`,
            template: 'orderConfirmation', // Tên file template (không cần .hbs)
            context: {
                // Dữ liệu sẽ được truyền vào template
                customerName: order.shippingName,
                orderId: order.id,
                orderDate: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Không xác định',
                items: order.items.map(item => ({
                    ...item.toJSON(),
                    // Định dạng lại giá tiền cho đẹp
                    formattedPrice: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.productPrice)
                })),
                totalPrice: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice),
                shippingAddress: `${order.shippingStreet}, ${order.shippingWard}, ${order.shippingDistrict}, ${order.shippingProvince}`,
            },
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);

        // Link để xem email trên Ethereal (chỉ khi dùng Ethereal)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Ném lỗi để worker có thể xử lý (ví dụ: nack message)
    }
};

module.exports = {
    sendConfirmationEmail,
};