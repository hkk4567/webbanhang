// src/controllers/product.controller.js
const { Product, OrderItem, Category } = require('../models'); // Giả sử bạn có file index.js trong models để quản lý
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sequelize = require('../config/database');
const { cloudinary } = require('../utils/cloudinary.js'); // Import cloudinary helper
const removeDiacritics = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// === LẤY DANH SÁCH TẤT CẢ SẢN PHẨM ===
// src/controllers/product.controller.js
exports.getAllProducts = catchAsync(async (req, res, next) => {
    // 1. LẤY CÁC THAM SỐ TỪ QUERY
    const page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10);

    // Dùng destructuring để lấy các tham số, kể cả khi chúng là undefined
    const {
        search,
        categoryId,
        status,
        price_ranges,
        sort,
    } = req.query;

    // 2. XÂY DỰNG ĐIỀU KIỆN `WHERE` VÀ CÁC TÙY CHỌN
    const whereCondition = {};
    const options = {
        include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        }],
        distinct: true,
    };

    // --- LOGIC PHÂN QUYỀN VÀ PHÂN TRANG MẶC ĐỊNH ---
    // Giả định req.user tồn tại nếu đã đăng nhập
    const isAdminOrStaff = req.user && ['admin', 'staff'].includes(req.user.role);

    if (isAdminOrStaff) {
        limit = limit || 10;
        if (status) {
            whereCondition.status = status;
        }
    } else {
        limit = limit || 9;
        whereCondition.status = 'active'; // User luôn chỉ thấy sản phẩm active
    }

    options.limit = limit;
    options.offset = (page - 1) * limit;

    // --- LOGIC LỌC VÀ TÌM KIẾM ---
    if (search) {
        // Dùng iLike cho PostgreSQL, LIKE cho các DB khác
        whereCondition.name = { [Op.like]: `%${search}%` };
    }
    if (categoryId) {
        whereCondition.categoryId = req.query.categoryId;
    }

    // --- LOGIC XỬ LÝ GIÁ (ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT) ---
    const priceRanges = {
        'under-100': { min: 0, max: 100000 },
        '100-300': { min: 100000, max: 300000 },
        '300-500': { min: 300000, max: 500000 },
        'above-500': { min: 500000 }, // max là vô cực
    };

    if (price_ranges && Array.isArray(price_ranges) && price_ranges.length > 0) {
        const orConditions = price_ranges.map(key => {
            const range = priceRanges[key];
            if (!range) return null; // Bỏ qua key không hợp lệ

            const condition = {};
            if (range.min != null) {
                condition[Op.gte] = range.min;
            }
            if (range.max != null) {
                condition[Op.lte] = range.max;
            }
            return { price: condition };
        }).filter(Boolean); // Lọc ra các giá trị null

        if (orConditions.length > 0) {
            // Thêm điều kiện OR vào whereCondition
            whereCondition[Op.or] = orConditions;
        }
    }

    // 3. XÂY DỰNG ĐIỀU KIỆN SẮP XẾP (`ORDER`)
    const sortBy = sort || '-created_at';
    const sortMapping = {
        'price-asc': [['price', 'ASC']],
        'price-desc': [['price', 'DESC']],
        'name-asc': [['name', 'ASC']],
        'name-desc': [['name', 'DESC']],
        'created_at': [['created_at', 'ASC']],
        '-created_at': [['created_at', 'DESC']],
        'status-asc': ['status', 'ASC'],
        'status-desc': ['status', 'DESC'],
        'quantity-asc': ['quantity', 'ASC'],
        'quantity-desc': ['quantity', 'DESC'],
    };
    // Sửa đổi nhỏ: Sequelize v6+ yêu cầu order là một mảng của các mảng
    options.order = sortMapping[sortBy] || sortMapping['-created_at'];

    // 4. THỰC HIỆN QUERY
    console.log('--- Final `where` condition for Sequelize ---:', JSON.stringify(whereCondition, null, 2)); // Dòng debug quan trọng
    console.log('--- EXECUTING WITH CONTROLLER VERSION 2.0 ---'); // Thêm dòng này
    console.log('--- FINAL WHERE CLAUSE OBJECT ---:', JSON.stringify(whereCondition, null, 2));
    const { count, rows } = await Product.findAndCountAll({
        where: whereCondition,
        ...options
    });

    // 5. TRẢ VỀ RESPONSE
    res.status(200).json({
        status: 'success',
        results: rows.length,
        data: {
            products: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            },
        },
    });
});

// === LẤY THÔNG TIN CHI TIẾT MỘT SẢN PHẨM ===
exports.getProductById = catchAsync(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id, {
        include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
        }]
    });

    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm với ID này', 404));
    }

    // Kiểm tra quyền truy cập:
    // Nếu sản phẩm không 'active' và người dùng không phải admin, thì không cho xem.
    if (product.status !== 'active' && (!req.user || req.user.role !== 'admin')) {
        return next(new AppError('Sản phẩm này không tồn tại hoặc đã bị ẩn.', 404));
    }


    res.status(200).json({
        status: 'success',
        data: {
            product,
        },
    });
});


// === 1. THÊM SẢN PHẨM MỚI ===
exports.createProduct = catchAsync(async (req, res, next) => {
    const { name, description, categoryId, price, quantity, status } = req.body;

    let imageUrl = null;
    // Kiểm tra xem có file ảnh được upload không
    if (req.file) {
        imageUrl = req.file.path; // Lấy URL từ Cloudinary
    }

    const newProduct = await Product.create({
        name,
        description,
        categoryId,
        price,
        quantity,
        status,
        imageUrl,
    });

    res.status(201).json({
        status: 'success',
        data: { product: newProduct },
    });
});

// === 2. CẬP NHẬT SẢN PHẨM ===
exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm với ID này', 404));
    }

    // Lấy dữ liệu cần cập nhật
    const updateData = { ...req.body };

    // Nếu có ảnh mới được upload, cập nhật URL và xóa ảnh cũ trên Cloudinary
    if (req.file) {
        // Nếu sản phẩm đã có ảnh cũ, xóa nó đi
        if (product.imageUrl) {
            const publicId = product.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`websellproduct/products/${publicId}`);
        }
        // Cập nhật URL ảnh mới
        updateData.imageUrl = req.file.path;
    }

    await product.update(updateData);

    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

// === 3. XÓA SẢN PHẨM (LOGIC XÓA MỀM/CỨNG) ===
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const productId = req.params.id;

    const result = await sequelize.transaction(async (t) => {
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
            throw new AppError('Không tìm thấy sản phẩm với ID này', 404);
        }

        const orderItem = await OrderItem.findOne({
            where: { productId: productId },
            transaction: t
        });

        if (orderItem) {
            // XÓA MỀM: Sản phẩm đã được bán, chỉ đổi status thành 'inactive' (ẩn)
            product.status = 'inactive';
            await product.save({ transaction: t });
            return { message: 'Sản phẩm đã được bán, đã được ẩn đi.', softDelete: true };
        } else {
            // XÓA CỨNG: Sản phẩm chưa từng được bán, xóa vĩnh viễn
            // Trước khi xóa khỏi DB, xóa ảnh trên Cloudinary (nếu có)
            if (product.imageUrl) {
                const publicId = product.imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`websellproduct/products/${publicId}`);
            }
            await product.destroy({ transaction: t });
            return { message: 'Sản phẩm đã được xóa vĩnh viễn.', softDelete: false };
        }
    });

    if (result.softDelete) {
        res.status(200).json({ status: 'success', message: result.message });
    } else {
        res.status(204).send(); // 204 No Content
    }
});
