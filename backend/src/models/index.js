const sequelize = require('../config/database');

// Import tất cả các model
const User = require('./user.model');
const Category = require('./category.model');
const Product = require('./product.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');

// --- Định nghĩa các mối quan hệ ---

// 1. User - Order (Một-Nhiều)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

// 2. Category - Product (Một-Nhiều)
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 3. Category - Category (Tự tham chiếu để tạo cây danh mục)
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// 4. Order - OrderItem (Một-Nhiều)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// 5. Product - OrderItem (Một-Nhiều)
// Mối quan hệ này dùng để tìm các đơn hàng liên quan đến một sản phẩm.
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });


// Export sequelize instance và tất cả các model đã được định nghĩa
module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem,
};