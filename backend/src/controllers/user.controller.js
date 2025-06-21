const { User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize'); // Import Operator của Sequelize
// 1. Lấy tất cả người dùng với phân trang, lọc và sắp xếp
exports.getAllUsers = catchAsync(async (req, res, next) => {
    // 1. Lấy các tham số từ query
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const searchTerm = req.query.search || '';
    const roleFilter = req.query.role || ''; // Mặc định chỉ lấy customer

    // Xử lý sắp xếp
    const sortBy = req.query.sort || '-createdAt'; // Mặc định sắp xếp theo ngày tạo mới nhất
    const orderDirection = sortBy.startsWith('-') ? 'DESC' : 'ASC';
    const orderField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;

    // 2. Xây dựng điều kiện `where` động
    const whereCondition = {};
    // Chỉ thêm điều kiện lọc role NẾU roleFilter có giá trị
    if (roleFilter) {
        whereCondition.role = roleFilter;
    }
    if (searchTerm) {
        whereCondition[Op.or] = [
            { fullName: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } },
            // Thêm tìm kiếm theo ID nếu ID của bạn là string
            // { id: { [Op.like]: `%${searchTerm}%` } } 
        ];
    }

    // 3. Thực hiện query với phân trang, lọc và sắp xếp
    const { count, rows } = await User.findAndCountAll({
        where: whereCondition,
        limit: limit,
        offset: offset,
        order: [[orderField, orderDirection]],
    });

    // 4. Trả về kết quả
    res.status(200).json({
        status: 'success',
        results: rows.length,
        data: {
            users: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit: limit,
            },
        },
    });
});

// 2. Lấy một người dùng theo ID
exports.getUserById = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// 3. Tạo người dùng mới (được dùng bởi admin)
// Chức năng đăng ký nên được tách ra, nhưng để đây cũng không sao
exports.createUser = catchAsync(async (req, res, next) => {
    const { fullName, email, password, phone, role, streetAddress, ward, district, province } = req.body;

    const newUser = await User.create({
        // Hãy chắc chắn bạn đang dùng camelCase ở đây
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
        role: role,
        streetAddress: streetAddress,
        ward: ward,
        district: district,
        province: province,
        // Sequelize sẽ tự xử lý createdAt và updatedAt
    });

    res.status(201).json({
        status: 'success',
        data: { user: newUser },
    });
});

// 4. Cập nhật người dùng
exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    // Chú ý: .update không kích hoạt hook 'beforeSave' trên tất cả các loại DB
    // .save() mới là cách chắc chắn nhất.
    Object.assign(user, req.body);
    await user.save();

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// 5. Xóa người dùng
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
        return next(new AppError('Không tìm thấy người dùng với ID này', 404));
    }

    await user.destroy();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

// Middleware để lấy thông tin của chính người dùng
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};
