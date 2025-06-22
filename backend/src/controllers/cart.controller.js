const redisClient = require('../config/redis');
const { Product } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// === 1. THÊM/CẬP NHẬT SẢN PHẨM VÀO GIỎ HÀNG ===
exports.addToCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { productId, quantity: newQuantity } = req.body; // Đổi tên quantity thành newQuantity cho rõ ràng

    if (!productId || !newQuantity || newQuantity <= 0) {
        return next(new AppError('Vui lòng cung cấp productId và quantity hợp lệ.', 400));
    }

    const product = await Product.findByPk(productId);
    if (!product || product.status !== 'active') {
        return next(new AppError('Sản phẩm không tồn tại hoặc không có sẵn.', 404));
    }

    const cartKey = `cart:${userId}`;
    const productField = productId.toString();

    // --- BẮT ĐẦU LOGIC CỘNG DỒN ---

    // 1. Lấy số lượng hiện tại của sản phẩm trong giỏ hàng (nếu có)
    const existingProductJSON = await redisClient.hGet(cartKey, productField);
    let currentQuantity = 0;

    if (existingProductJSON) {
        // Nếu sản phẩm đã tồn tại, parse JSON để lấy số lượng
        try {
            const existingProduct = JSON.parse(existingProductJSON);
            currentQuantity = parseInt(existingProduct.quantity, 10) || 0;
        } catch (e) {
            // Xử lý trường hợp dữ liệu trong Redis bị hỏng
            console.error("Lỗi parse JSON từ Redis:", e);
            currentQuantity = 0;
        }
    }

    // 2. Tính toán số lượng mới
    const totalQuantity = currentQuantity + newQuantity;

    // 3. Kiểm tra lại với số lượng tồn kho
    if (product.quantity < totalQuantity) {
        return next(new AppError(`Không đủ hàng. Chỉ còn ${product.quantity} sản phẩm trong kho.`, 400));
    }

    // 4. Lưu lại số lượng tổng vào Redis
    // Dữ liệu lưu có thể chứa thêm thông tin khác nếu muốn
    const newCartItem = {
        productId: productId,
        quantity: totalQuantity,
        name: product.name,       // Lưu tên để dễ hiển thị
        price: product.price,     // Lưu giá tại thời điểm thêm
        imageUrl: product.imageUrl // Lưu ảnh
    };

    await redisClient.hSet(cartKey, productField, JSON.stringify(newCartItem));

    // --- KẾT THÚC LOGIC CỘNG DỒN ---

    res.status(200).json({
        status: 'success',
        message: 'Giỏ hàng đã được cập nhật.',
        data: {
            item: newCartItem // Trả về item đã được cập nhật
        }
    });
});

// === 2. LẤY CHI TIẾT GIỎ HÀNG ===
exports.getCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const cartKey = `cart:${userId}`;

    // Lấy tất cả sản phẩm từ giỏ hàng trong Redis
    const cartItems = await redisClient.hGetAll(cartKey);

    if (!cartItems || Object.keys(cartItems).length === 0) {
        return res.status(200).json({
            status: 'success',
            data: {
                items: [],
                totalPrice: 0,
                totalItems: 0,
            }
        });
    }

    const productIds = Object.keys(cartItems);

    // Lấy thông tin chi tiết của các sản phẩm từ database MySQL
    const products = await Product.findAll({
        where: {
            id: productIds
        }
    });

    let totalPrice = 0;
    let totalItems = 0;

    const detailedCart = products.map(product => {
        const itemInCart = JSON.parse(cartItems[product.id]);
        const itemQuantity = itemInCart.quantity;
        const itemPrice = itemQuantity * product.price;

        totalPrice += itemPrice;
        totalItems += itemQuantity;

        return {
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: product.price,
            quantity: itemQuantity,
            itemTotalPrice: itemPrice,
        };
    });

    res.status(200).json({
        status: 'success',
        data: {
            items: detailedCart,
            totalPrice,
            totalItems,
        }
    });
});

// === 3. XÓA SẢN PHẨM KHỎI GIỎ HÀNG ===
exports.removeFromCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params; // Lấy productId từ URL params

    const cartKey = `cart:${userId}`;
    const productField = productId.toString();

    // Xóa field khỏi HASH
    const result = await redisClient.hDel(cartKey, productField);

    if (result === 0) {
        return next(new AppError('Sản phẩm không có trong giỏ hàng.', 404));
    }

    res.status(204).send();
});

// === 4. XÓA SẠCH GIỎ HÀNG ===
exports.clearCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const cartKey = `cart:${userId}`;

    await redisClient.del(cartKey);

    res.status(204).send();
});