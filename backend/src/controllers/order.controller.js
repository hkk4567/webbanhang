const { Order, OrderItem, Product, User, Category } = require('../models');
const redisClient = require('../config/redis');
const sequelize = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createOrder = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { paymentMethod, note, shippingAddress } = req.body; // Giả sử frontend gửi lên một object shippingAddress

    // 1. Lấy giỏ hàng từ Redis
    const cartKey = `cart:${userId}`;
    const cartItems = await redisClient.hGetAll(cartKey);

    if (!cartItems || Object.keys(cartItems).length === 0) {
        return next(new AppError('Giỏ hàng của bạn đang trống.', 400));
    }

    const productIds = Object.keys(cartItems);

    // Bắt đầu một transaction
    const result = await sequelize.transaction(async (t) => {
        // 2. Lấy thông tin sản phẩm và khóa các dòng để cập nhật (FOR UPDATE)
        const productsInCart = await Product.findAll({
            where: { id: productIds },
            include: [{
                model: Category,
                as: 'category', // 'as' phải khớp với định nghĩa trong association
                attributes: ['name'] // Chỉ cần lấy tên của category
            }],
            lock: t.LOCK.UPDATE,
            transaction: t,
        });

        // Kiểm tra xem tất cả sản phẩm trong giỏ hàng có còn tồn tại không
        if (productsInCart.length !== productIds.length) {
            throw new AppError('Một số sản phẩm trong giỏ hàng không còn tồn tại.', 400);
        }

        let totalPrice = 0;
        const orderItemsData = [];

        // 3. Kiểm tra tồn kho và tính tổng tiền
        for (const product of productsInCart) {
            const itemInRedis = JSON.parse(cartItems[product.id]);
            const requestedQuantity = itemInRedis.quantity;

            if (product.quantity < requestedQuantity) {
                throw new AppError(`Sản phẩm "${product.name}" không đủ hàng.`, 400);
            }
            if (product.status !== 'active') {
                throw new AppError(`Sản phẩm "${product.name}" không còn được bán.`, 400);
            }

            const itemTotalPrice = product.price * requestedQuantity;
            totalPrice += itemTotalPrice;

            // Chuẩn bị dữ liệu cho OrderItem (snapshot)
            orderItemsData.push({
                productId: product.id,
                quantity: requestedQuantity,
                productName: product.name,
                productPrice: product.price,
                productImage: product.imageUrl,
                // Lấy tên category từ object `product.category`
                // Dùng optional chaining (?.) để tránh lỗi nếu sản phẩm không có category
                categoryName: product.category?.name || null,
            });

            // 4. Cập nhật tồn kho sản phẩm
            product.quantity -= requestedQuantity;
            // Nếu hết hàng, cập nhật status
            if (product.quantity === 0) {
                product.status = 'out_of_stock';
            }
            await product.save({ transaction: t });
        }

        // 5. Lấy thông tin địa chỉ mặc định của user nếu không có địa chỉ giao hàng mới
        let finalShippingAddress;
        if (shippingAddress && shippingAddress.fullName) {
            finalShippingAddress = shippingAddress;
        } else {
            const currentUser = await User.findByPk(userId, { transaction: t });
            finalShippingAddress = {
                fullName: currentUser.fullName,
                phone: currentUser.phone,
                street: currentUser.streetAddress,
                ward: currentUser.ward,
                district: currentUser.district,
                province: currentUser.province,
            };
        }

        // 6. Tạo đơn hàng (Order)
        const newOrder = await Order.create({
            userId,
            totalPrice,
            paymentMethod,
            note,
            shippingName: finalShippingAddress.fullName,
            shippingPhone: finalShippingAddress.phone,
            shippingStreet: finalShippingAddress.street,
            shippingWard: finalShippingAddress.ward,
            shippingDistrict: finalShippingAddress.district,
            shippingProvince: finalShippingAddress.province,
            status: 'pending', // Trạng thái ban đầu
        }, { transaction: t });

        // 7. Tạo chi tiết đơn hàng (OrderItems)
        const orderItemsWithOrderId = orderItemsData.map(item => ({
            ...item,
            orderId: newOrder.id,
        }));
        await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction: t });

        return newOrder;
    });

    // 8. Nếu transaction thành công, xóa giỏ hàng khỏi Redis
    await redisClient.del(cartKey);

    // 9. Gửi response
    res.status(201).json({
        status: 'success',
        message: 'Đặt hàng thành công!',
        data: {
            order: result,
        },
    });
});