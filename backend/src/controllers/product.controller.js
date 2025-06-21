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
exports.getAllProducts = catchAsync(async (req, res, next) => {
    // 1. Phân trang
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // 2. Lọc và Tìm kiếm
    const { search, categoryId, status } = req.query;
    const whereCondition = {};

    if (search) {
        removeDiacritics(search);
        // Sequelize không hỗ trợ tìm kiếm không dấu trực tiếp,
        // chúng ta sẽ dùng `LOWER` và `LIKE` cho tìm kiếm cơ bản.
        // Tìm kiếm không dấu thực sự cần full-text search hoặc collation phù hợp.
        whereCondition.name = { [Op.like]: `%${search}%` };
    }
    if (categoryId) {
        whereCondition.categoryId = categoryId;
    }
    if (status) {
        // Giả sử status trong DB là 'active', 'inactive', 'out_of_stock'
        // Frontend gửi 'Còn hàng', 'Hết hàng', ta cần chuyển đổi
        if (status === 'active') whereCondition.status = 'active';
        if (status === 'inactive') whereCondition.status = 'inactive';
        if (status === 'out_of_stock') whereCondition.status = 'out_of_stock';
        // 'Sắp hết hàng' cần logic phức tạp hơn, có thể xử lý sau
    }

    // 3. Sắp xếp
    const sortBy = req.query.sort || '-created_at';
    const orderDirection = sortBy.startsWith('-') ? 'DESC' : 'ASC';
    const orderField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;

    // 4. Query
    const { count, rows } = await Product.findAndCountAll({
        where: whereCondition,
        include: [{ model: Category, as: 'category', attributes: ['name'] }],
        limit,
        offset,
        order: [[orderField, orderDirection]],
        distinct: true, // Cần thiết khi có include
    });

    // 5. Trả về kết quả
    res.status(200).json({
        status: 'success',
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

// Các hàm khác như getAllProducts, getProductById...