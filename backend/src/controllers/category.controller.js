const { Category, Product } = require('../models'); // Giả sử có file index.js quản lý model
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
// === 1. LẤY TẤT CẢ DANH MỤC (CÓ THỂ LẤY THEO CẤU TRÚC CÂY) ===
// Cách đơn giản: Lấy danh sách phẳng
exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.findAll({
        order: [['name', 'ASC']], // Sắp xếp theo tên
    });

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
            categories,
        },
    });
});
// === HÀM MỚI DÀNH CHO TRANG ADMIN ===
exports.getAdminCategories = catchAsync(async (req, res, next) => {
    // 1. Lấy các tham số từ query string
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { search, sort } = req.query;

    // 2. Xây dựng điều kiện lọc (where)
    const whereCondition = {};
    if (search) {
        whereCondition.name = { [Op.like]: `%${search}%` };
    }

    // 3. Xây dựng điều kiện sắp xếp (order)
    let orderCondition = [['created_at', 'DESC']]; // Mặc định
    if (sort) {
        const sortString = String(sort);
        const direction = sortString.startsWith('-') ? 'DESC' : 'ASC';
        const field = sortString.startsWith('-') ? sortString.substring(1) : sortString;

        const allowedSortFields = ['name', 'created_at'];
        if (allowedSortFields.includes(field)) {
            orderCondition = [[field, direction]];
        }
    }

    // 4. Thực hiện truy vấn với findAndCountAll
    const { count, rows } = await Category.findAndCountAll({
        where: whereCondition,
        order: orderCondition,
        limit,
        offset,
    });

    // 5. Trả về kết quả theo định dạng mà trang admin mong đợi
    res.status(200).json({
        status: 'success',
        results: rows.length,
        data: {
            categories: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            },
        },
    });
});

// === 2. LẤY MỘT DANH MỤC ===
exports.getCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
        return next(new AppError('Không tìm thấy danh mục với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            category,
        },
    });
});

// === 3. TẠO DANH MỤC MỚI (chỉ admin) ===
exports.createCategory = catchAsync(async (req, res, next) => {
    const { name, parentId } = req.body;


    // Kiểm tra xem parentId (nếu có) có hợp lệ không
    if (parentId) {
        const parentCategory = await Category.findByPk(parentId);
        if (!parentCategory) {
            return next(new AppError('Không tìm thấy danh mục cha.', 400));
        }
    }

    const newCategory = await Category.create({ name, parentId });

    res.status(201).json({
        status: 'success',
        data: {
            category: newCategory,
        },
    });
});

// === 4. CẬP NHẬT DANH MỤC (chỉ admin) ===
exports.updateCategory = catchAsync(async (req, res, next) => {
    const { name, parentId } = req.body;

    // Không cho phép một danh mục tự làm cha của chính nó
    if (parentId && parseInt(parentId, 10) === parseInt(req.params.id, 10)) {
        return next(new AppError('Một danh mục không thể là cha của chính nó.', 400));
    }

    const category = await Category.findByPk(req.params.id);
    if (!category) {
        return next(new AppError('Không tìm thấy danh mục với ID này', 404));
    }

    // Tạo object để cập nhật, chỉ chứa các trường được gửi lên
    const updateData = {};
    if (name) updateData.name = name;
    if (parentId) updateData.parentId = parentId;

    // await category.update({ name, parentId, status }); // Cập nhật cả status
    await category.update(updateData);


    res.status(200).json({
        status: 'success',
        data: {
            category,
        },
    });
});

// === 5. XÓA DANH MỤC (chỉ admin) ===
exports.deleteCategory = catchAsync(async (req, res, next) => {
    const categoryId = req.params.id;

    // Trước khi xóa, kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const product = await Product.findOne({ where: { categoryId: categoryId } });

    if (product) {
        return next(new AppError('Không thể xóa danh mục này vì vẫn còn sản phẩm thuộc về nó.', 400));
    }

    // (Nâng cao) Kiểm tra xem có danh mục con nào không
    const childCategory = await Category.findOne({ where: { parentId: categoryId } });
    if (childCategory) {
        return next(new AppError('Không thể xóa danh mục này vì nó vẫn còn danh mục con.', 400));
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
        return next(new AppError('Không tìm thấy danh mục với ID này', 404));
    }

    await category.destroy();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});