const { Order, OrderItem, User, Product, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { startOfMonth, endOfMonth, startOfDay, endOfDay } = require('date-fns'); // Thư viện tiện ích xử lý ngày tháng

/**
 * [GET] /stats/overview
 * Lấy các số liệu thống kê nhanh cho dashboard.
 */
exports.getOverviewStats = catchAsync(async (req, res, next) => {
    // 1. Tổng doanh thu trong tháng hiện tại
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const revenueThisMonth = await Order.sum('totalPrice', {
        where: {
            status: 'delivered', // Chỉ tính doanh thu từ đơn hàng đã giao thành công
            created_at: {
                [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
            },
        },
    });

    // 2. Tổng sản phẩm đã bán trong tháng
    const productsSoldThisMonth = await OrderItem.sum('quantity', {
        include: [{
            model: Order,
            as: 'order',
            where: {
                status: 'delivered',
                created_at: {
                    [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
                },
            },
            attributes: [], // không cần lấy trường nào từ Order
        }],
    });

    // 3. Số lượng khách hàng mới trong tháng
    const newCustomersThisMonth = await User.count({
        where: {
            role: 'customer',
            created_at: {
                [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
            },
        },
    });

    // 4. Số lượng đơn hàng đang chờ xử lý
    const pendingOrdersCount = await Order.count({
        where: {
            status: 'pending',
        },
    });

    res.status(200).json({
        status: 'success',
        data: {
            revenue: revenueThisMonth || 0,
            productsSold: productsSoldThisMonth || 0,
            newCustomers: newCustomersThisMonth || 0,
            pendingOrders: pendingOrdersCount || 0,
        },
    });
});


/**
 * [GET] /stats/sales-chart
 * Lấy dữ liệu doanh thu theo từng ngày trong một khoảng thời gian.
 */
exports.getSalesChartData = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    // Đặt ngày mặc định là 7 ngày gần nhất nếu không có query
    const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(new Date());
    const start = startDate ? startOfDay(new Date(startDate)) : startOfDay(new Date(new Date().setDate(end.getDate() - 6)));

    // Tạo mảng các ngày trong khoảng đã chọn để làm nhãn
    const dateRange = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Truy vấn để lấy tổng doanh thu theo từng ngày
    const salesData = await Order.findAll({
        attributes: [
            // Lấy ngày đặt hàng (chỉ lấy phần ngày, không lấy giờ)
            [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
            // Tính tổng doanh thu của ngày đó
            [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue'],
        ],
        where: {
            status: 'delivered',
            created_at: {
                [Op.between]: [start, end],
            },
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))], // Nhóm theo ngày
        raw: true, // Trả về object thuần, không phải instance của Sequelize
    });

    // Chuyển đổi dữ liệu từ DB thành một map để dễ tra cứu: { 'YYYY-MM-DD': totalRevenue }
    const salesMap = new Map(salesData.map(item => [item.date, parseFloat(item.totalRevenue)]));

    // Tạo dữ liệu cuối cùng cho biểu đồ
    const labels = dateRange.map(date => date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })); // Format 'DD/MM'
    const data = dateRange.map(date => {
        const dateString = date.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
        return salesMap.get(dateString) || 0; // Lấy doanh thu, nếu ngày đó không có thì là 0
    });

    res.status(200).json({
        status: 'success',
        data: { labels, data },
    });
});


/**
 * [GET] /stats/top-products
 * Lấy danh sách top sản phẩm (bán chạy hoặc bán chậm).
 */
exports.getTopProducts = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 5;
    const sort = req.query.sort === 'asc' ? 'ASC' : 'DESC'; // Mặc định là bán chạy (DESC)

    const topProducts = await OrderItem.findAll({
        attributes: [
            'productId',
            // Tính tổng số lượng đã bán của mỗi sản phẩm
            [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalSold'],
        ],
        include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'imageUrl'], // Lấy tên và ảnh sản phẩm
            required: true, // Chỉ lấy những OrderItem có Product tương ứng
        },
        // --- START: INCLUDE MỚI ĐỂ LỌC THEO TRẠNG THÁI ĐƠN HÀNG ---
        {
            model: Order,
            as: 'order', // 'as' phải khớp với định nghĩa association trong OrderItem model
            attributes: [], // Không cần lấy trường nào từ bảng Order, chỉ dùng để lọc
            where: {
                status: 'delivered' // <<< ĐIỀU KIỆN LỌC QUAN TRỌNG NHẤT
            },
            required: true, // Bắt buộc phải có Order khớp (INNER JOIN)
        }
        ],
        group: [
            sequelize.col('OrderItem.product_id'),
            sequelize.col('product.id'),
            sequelize.col('product.name'),
            sequelize.col('product.image_url'),
        ],
        order: [[sequelize.literal('totalSold'), sort]], // Sắp xếp theo tổng số lượng đã bán
        limit: limit,
    });

    // Chuyển đổi cấu trúc dữ liệu cho dễ dùng ở frontend
    const formattedProducts = topProducts.map(item => ({
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        totalSold: parseInt(item.get('totalSold'), 10),
    }));

    res.status(200).json({
        status: 'success',
        data: {
            products: formattedProducts,
        },
    });
});


/**
 * [GET] /stats/top-customers
 * Lấy danh sách top khách hàng thân thiết.
 */
exports.getTopCustomers = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 5;

    const topCustomers = await Order.findAll({
        attributes: [
            'userId',
            // Tính tổng số tiền đã chi tiêu của mỗi user
            [sequelize.fn('SUM', sequelize.col('total_price')), 'totalSpent'],
            // Đếm số đơn hàng của mỗi user
            [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount'],
        ],
        include: [{
            model: User,
            as: 'customer',
            attributes: ['id', 'fullName', 'email'],// Lấy tên và email
            required: true,
        }],
        where: {
            status: 'delivered', // Chỉ tính các đơn đã thành công
        },
        group: [sequelize.col('customer.id')],
        order: [[sequelize.literal('totalSpent'), 'DESC']], // Sắp xếp theo tổng chi tiêu
        limit: limit,
    });

    // Chuyển đổi cấu trúc
    const formattedCustomers = topCustomers.map(order => ({
        id: order.customer.id,
        fullName: order.customer.fullName, // <<-- Sửa thành order.customer
        email: order.customer.email, // <<-- Sửa thành order.customer
        totalSpent: parseFloat(order.get('totalSpent')),
        orderCount: parseInt(order.get('orderCount'), 10),
    }));

    res.status(200).json({
        status: 'success',
        data: {
            customers: formattedCustomers,
        },
    });
});

exports.getProductSalesDetails = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    // Đếm số đơn hàng thành công có chứa sản phẩm này
    const orderCount = await OrderItem.count({
        where: { productId: productId },
        include: [{
            model: Order,
            as: 'order',
            where: { status: 'delivered' }, // Chỉ tính các đơn đã giao thành công
            attributes: [] // không cần lấy trường nào từ Order
        }]
    });

    // Tính tổng số lượng đã bán của sản phẩm này trong các đơn hàng thành công
    const totalQuantitySold = await OrderItem.sum('quantity', {
        where: { productId: productId },
        include: [{
            model: Order,
            as: 'order',
            where: { status: 'delivered' },
            attributes: []
        }]
    });

    res.status(200).json({
        status: 'success',
        data: {
            orderCount: orderCount || 0,
            totalQuantitySold: totalQuantitySold || 0,
        }
    });
});