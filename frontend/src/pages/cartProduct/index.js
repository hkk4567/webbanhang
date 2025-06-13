import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Main.module.scss'; // Giả sử file SCSS của bạn
import CartPageItem from './components/CartPageItem';
// Import các icon cần thiết từ Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Khởi tạo hàm cx để sử dụng CSS Modules
const cx = classNames.bind(styles);

// Dữ liệu giả để hiển thị giỏ hàng
const initialCartItems = [
    {
        id: 2,
        name: 'Cà Phê Sữa Đá',
        price: 29000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1551030173-1a2952449856?auto=format&fit=crop&q=80&w=100',
    },
    {
        id: 7,
        name: 'Bánh Tiramisu',
        price: 55000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=100',
    }
];

function CartProduct() {
    const [cartItems, setCartItems] = useState(initialCartItems);

    // Hàm cập nhật số lượng
    const handleQuantityChange = (id, newQuantity) => {
        // Đảm bảo số lượng không nhỏ hơn 1
        if (newQuantity < 1) return;
        setCartItems(
            cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)),
        );
    };

    // Hàm xóa sản phẩm
    const handleRemoveItem = (id) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    // Tính tổng tiền giỏ hàng, chỉ tính lại khi cartItems thay đổi
    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    return (
        <>
            {/* Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/" >Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li className={cx('breadrumb-title-page')} style={{ textTransform: 'capitalize' }}>
                                    Giỏ hàng
                                </li>
                            </ul>
                            <div className={cx('title-page')}>Giỏ hàng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cart Content */}
            <div className={cx('cart-content')}>
                <div className="container">
                    {cartItems.length === 0 ? (
                        // Trường hợp giỏ hàng rỗng
                        <div className="text-center py-5">
                            <h2 className="mb-3">Giỏ hàng của bạn đang trống</h2>
                            <Link to="/product" className="btn btn-primary">
                                Quay lại mua sắm
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* --- SỬA 2: THÊM HEADER CHO BẢNG GIỎ HÀNG --- */}
                            <div className="row d-none d-md-flex fw-bold text-muted text-uppercase mb-3">
                                <div className="col-md-5">Sản phẩm</div>
                                <div className="col-md-3 text-center">Số lượng</div>
                                <div className="col-md-3 text-end">Tổng cộng</div>
                                <div className="col-md-1"></div>
                            </div>

                            {/* --- SỬA 3: SỬ DỤNG COMPONENT MỚI --- */}
                            {cartItems.map((item) => (
                                <CartPageItem
                                    key={item.id}
                                    item={item}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={handleRemoveItem}
                                />
                            ))}

                            {/* --- SỬA 4: CẬP NHẬT PHẦN FOOTER CỦA GIỎ HÀNG --- */}
                            <div className="row mt-4 justify-content-end mb-3">
                                <div className="col-md-5">
                                    <div className="d-flex justify-content-between fs-4 mb-3">
                                        <span className="fw-bold">Tổng tiền:</span>
                                        <span className="fw-bold text-danger">{totalPrice.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <p className="text-muted small">Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
                                    <Link to="/checkout" className="btn btn-primary w-100">
                                        Tiến hành Thanh toán
                                    </Link>
                                    <Link to="/product" className="btn btn-outline-secondary w-100 mt-2">
                                        Tiếp tục mua sắm
                                    </Link>
                                </div>
                            </div>
                        </>

                    )}
                </div>
            </div>
        </>
    );
}

export default CartProduct;