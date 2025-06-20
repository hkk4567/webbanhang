const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// 1. Lấy tất cả người dùng
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.findAll();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
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
    const newUser = await User.create(req.body);

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