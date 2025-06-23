const { Order, OrderItem, Product, User, Category } = require('../models');
const redisClient = require('../config/redis');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
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
// === CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (Dành cho Admin/Staff) ===
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Lấy ID của đơn hàng từ URL
    const { status } = req.body; // Lấy trạng thái mới từ body request

    // 1. Kiểm tra xem status có được gửi lên và có hợp lệ không
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
        return next(new AppError('Vui lòng cung cấp một trạng thái hợp lệ: pending, processing, shipped, delivered, cancelled.', 400));
    }

    // 2. Tìm đơn hàng trong DB
    const order = await Order.findByPk(id);

    if (!order) {
        return next(new AppError('Không tìm thấy đơn hàng với ID này.', 404));
    }

    // 3. (Nâng cao) Logic kiểm tra chuyển đổi trạng thái hợp lệ (tùy chọn)
    // Ví dụ: không cho phép cập nhật khi đơn hàng đã giao hoặc đã hủy
    if (order.status === 'delivered' || order.status === 'cancelled') {
        return next(new AppError(`Không thể cập nhật trạng thái của đơn hàng đã ${order.status}.`, 400));
    }
    // Ví dụ: không cho phép quay lại trạng thái 'pending' từ các trạng thái sau đó
    if (status === 'pending' && order.status !== 'pending') {
        return next(new AppError('Không thể chuyển trạng thái về lại "pending".', 400));
    }


    // 4. Cập nhật trạng thái và lưu lại
    order.status = status;
    await order.save();

    // TODO: Gửi email/thông báo cho khách hàng tại đây

    // 5. Trả về kết quả
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật trạng thái đơn hàng thành công.',
        data: {
            order,
        },
    });
});

// Các hàm khác như getMyOrders, getAllOrders...
exports.getAllOrders = catchAsync(async (req, res, next) => {
    // 1. Phân trang
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // 2. Lọc và Tìm kiếm
    const { search, status, startDate, endDate, province, district, ward } = req.query;
    const whereCondition = {};

    if (status) {
        whereCondition.status = status;
    }
    if (startDate && endDate) {
        whereCondition.createdAt = {
            [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))]
        };
    }
    if (search) {
        whereCondition[Op.or] = [
            { id: { [Op.like]: `%${search}%` } }, // Tìm theo ID đơn hàng
            { shippingName: { [Op.like]: `%${search}%` } },
            { shippingPhone: { [Op.like]: `%${search}%` } }
        ];
    }
    if (province) {
        whereCondition.shippingProvince = province;
    }
    if (district) {
        whereCondition.shippingDistrict = district;
    }
    if (ward) {
        whereCondition.shippingWard = ward;
    }

    // 3. Sắp xếp
    const sortBy = req.query.sort || '-created_at';
    const orderDirection = sortBy.startsWith('-') ? 'DESC' : 'ASC';
    const orderField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;

    // 4. Query
    const { count, rows } = await Order.findAndCountAll({
        where: whereCondition,
        // (Tùy chọn) Include để lấy tên user nếu cần
        // include: [{ model: User, as: 'user', attributes: ['fullName'] }],
        limit,
        offset,
        order: [[orderField, orderDirection]],
        distinct: true,
    });

    // 5. Trả về kết quả
    res.status(200).json({
        status: 'success',
        data: {
            orders: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            },
        },
    });
});

// Hàm updateOrderStatus của bạn đã có, chúng ta sẽ dùng lại nó.
// Cần thêm hàm getOrderById để xem chi tiết
exports.getOrderById = catchAsync(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id, {
        // Include cả OrderItem, và từ OrderItem include cả Product
        include: [{
            model: OrderItem,
            as: 'items', // Phải khớp với 'as' trong association
            include: [{
                model: Product,
                as: 'product',
                attributes: ['name', 'imageUrl'] // Chỉ lấy các trường cần thiết
            }]
        }]
    });
    if (!order) {
        return next(new AppError('Không tìm thấy đơn hàng', 404));
    }
    if (order.userId !== req.user.id && req.user.role === 'customer') {
        return next(new AppError('Bạn không có quyền xem đơn hàng này.', 403));
    }
    res.status(200).json({ status: 'success', data: { order } });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
    const userId = req.user.id; // Lấy ID từ user đã được xác thực
    console.log(userId);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5; // Mặc định 5 đơn/trang
    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
        where: { userId: userId },
        include: [
            {
                model: OrderItem,
                as: 'items', // 'as' phải khớp với định nghĩa association
            }
        ],
        order: [['created_at', 'DESC']], // Sắp xếp đơn hàng mới nhất lên đầu
        limit,
        offset,
        distinct: true, // Quan trọng khi dùng include với limit/offset
    });

    res.status(200).json({
        status: 'success',
        data: {
            orders: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            }
        }
    });
});