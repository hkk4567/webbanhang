const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình Cloudinary bằng các biến môi trường
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình kho lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'websellproduct/products', // Tên thư mục trên Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg'],
        // (Tùy chọn) Áp dụng các biến đổi cho ảnh khi upload
        // transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
});

// Tạo middleware upload của Multer
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };