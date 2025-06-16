import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Main.module.scss'; // Giả sử file SCSS của bạn
import CartPageItem from './components/CartPageItem';
import { useCart } from '../../../context/CartContext';
// Import các icon cần thiết từ Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Khởi tạo hàm cx để sử dụng CSS Modules
const cx = classNames.bind(styles);

function CartProduct() {
    const { cartItems, totalPrice, updateQuantity, removeFromCart } = useCart();

    // Hàm cập nhật số lượng
    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(id); // Gọi hàm xóa từ context
        } else {
            updateQuantity(id, newQuantity); // Gọi hàm cập nhật từ context
        }
    };

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
                            <Link to="/products" className="btn btn-primary">
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
                            <div className={cx('cart-items-container')}>
                                {cartItems.map((item) => (
                                    <CartPageItem
                                        key={item.id}
                                        item={item}
                                        onQuantityChange={handleQuantityChange}
                                        onRemove={removeFromCart} // Dùng trực tiếp hàm từ context
                                    />
                                ))}
                            </div>

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
                                    <Link to="/products" className="btn btn-outline-secondary w-100 mt-2">
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