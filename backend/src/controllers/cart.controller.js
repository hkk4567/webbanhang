const redisClient = require('../config/redis');
const { Product } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// === 1. THÊM/CẬP NHẬT SẢN PHẨM VÀO GIỎ HÀNG ===
exports.addToCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id; // Lấy từ middleware `protect`
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return next(new AppError('Vui lòng cung cấp productId và quantity hợp lệ.', 400));
    }

    // Kiểm tra xem sản phẩm có tồn tại và đủ hàng không
    const product = await Product.findByPk(productId);
    if (!product || product.status !== 'active') {
        return next(new AppError('Sản phẩm không tồn tại hoặc không có sẵn.', 404));
    }
    if (product.quantity < quantity) {
        return next(new AppError('Sản phẩm không đủ số lượng tồn kho.', 400));
    }

    const cartKey = `cart:${userId}`;
    const productField = productId.toString();

    // Lưu vào Redis HASH
    // HSET sẽ tạo mới hoặc ghi đè nếu đã tồn tại
    await redisClient.hSet(cartKey, productField, JSON.stringify({ quantity }));

    res.status(200).json({
        status: 'success',
        message: 'Sản phẩm đã được thêm vào giỏ hàng.',
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