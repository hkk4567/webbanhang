const redisClient = require('../config/redis');
const { Product } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// === 1. THÊM/CẬP NHẬT SẢN PHẨM VÀO GIỎ HÀNG ===
exports.addToCart = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body; // Giờ quantity là số lượng cuối cùng

    if (!productId || !quantity || quantity <= 0) {
        return next(new AppError('Vui lòng cung cấp productId và quantity hợp lệ.', 400));
    }

    // 1. Kiểm tra sản phẩm và tồn kho
    const product = await Product.findByPk(productId);
    if (!product || product.status !== 'active') {
        return next(new AppError('Sản phẩm không tồn tại hoặc không có sẵn.', 404));
    }

    // So sánh thẳng với số lượng yêu cầu
    if (product.quantity < quantity) {
        return next(new AppError(`Không đủ hàng. Chỉ còn ${product.quantity} sản phẩm trong kho.`, 400));
    }

    const cartKey = `cart:${userId}`;
    const productField = productId.toString();

    // 2. Tạo đối tượng item mới để lưu vào Redis
    const newCartItem = {
        productId: productId,
        quantity: quantity, // <<-- Lấy thẳng số lượng mới, không cộng dồn
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
    };

    // 3. Ghi đè vào Redis
    // hSet sẽ tự động tạo mới nếu chưa có, hoặc cập nhật nếu đã tồn tại
    await redisClient.hSet(cartKey, productField, JSON.stringify(newCartItem));

    res.status(200).json({
        status: 'success',
        message: 'Sản phẩm đã được thêm/cập nhật trong giỏ hàng.',
        data: {
            item: newCartItem
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

// === 5. CẬP NHẬT SỐ LƯỢNG CỦA MỘT SẢN PHẨM  ===
exports.updateCartItem = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { productId } = req.params; // Lấy ID sản phẩm từ URL
    const { quantity: newQuantity } = req.body; // Lấy số lượng mới từ body

    if (!newQuantity || newQuantity <= 0) {
        return next(new AppError('Số lượng phải là một số lớn hơn 0.', 400));
    }

    const cartKey = `cart:${userId}`;
    const productField = productId.toString();

    // Lấy thông tin sản phẩm để kiểm tra tồn kho
    const product = await Product.findByPk(productId);
    if (!product || product.status !== 'active') {
        return next(new AppError('Sản phẩm không tồn tại hoặc không có sẵn.', 404));
    }
    // Kiểm tra số lượng mới với tồn kho
    if (product.quantity < newQuantity) {
        return next(new AppError(`Không đủ hàng. Chỉ còn ${product.quantity} sản phẩm trong kho.`, 400));
    }

    // Lấy item hiện tại từ Redis để cập nhật, đảm bảo nó tồn tại
    const existingProductJSON = await redisClient.hGet(cartKey, productField);
    if (!existingProductJSON) {
        return next(new AppError('Sản phẩm không có trong giỏ hàng để cập nhật.', 404));
    }

    // Cập nhật lại số lượng
    const cartItem = JSON.parse(existingProductJSON);
    cartItem.quantity = newQuantity; // Ghi đè số lượng cũ bằng số lượng mới

    // Lưu lại vào Redis
    await redisClient.hSet(cartKey, productField, JSON.stringify(cartItem));

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật số lượng thành công.',
        data: {
            item: cartItem
        }
    });
});