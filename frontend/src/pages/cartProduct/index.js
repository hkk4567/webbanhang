import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Main.module.scss'; // Giả sử file SCSS của bạn

// Import các icon cần thiết từ Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faTrash } from '@fortawesome/free-solid-svg-icons';

// Khởi tạo hàm cx để sử dụng CSS Modules
const cx = classNames.bind(styles);

// Dữ liệu giả để hiển thị giỏ hàng
const initialCartItems = [
    {
        id: 1,
        name: 'Cà Phê Sữa Đá',
        price: 25000,
        quantity: 2,
        image: 'https://via.placeholder.com/80', // Thay bằng link ảnh thật của bạn
    },
    {
        id: 2,
        name: 'Nước Ép Cam',
        price: 35000,
        quantity: 1,
        image: 'https://via.placeholder.com/80',
    },
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

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
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
                                    <Link to="/" className={cx('product-home')}>Trang chủ</Link>
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
                        // Trường hợp có sản phẩm trong giỏ
                        <>
                            {/* Header của giỏ hàng - chỉ hiển thị trên màn hình lớn */}
                            <div className={cx('product-cart-header', 'row', 'd-none', 'd-md-flex', 'text-center', 'mb-3')}>
                                <div className="col-md-2">Ảnh</div>
                                <div className="col-md-3">Tên sản phẩm</div>
                                <div className="col-md-2">Giá</div>
                                <div className="col-md-2">Số lượng</div>
                                <div className="col-md-2">Tổng tiền</div>
                                <div className="col-md-1">Xóa</div>
                            </div>

                            {/* Danh sách sản phẩm trong giỏ hàng */}
                            <div className={cx('product-cart-item-js')}>
                                {cartItems.map((item) => (
                                    <div key={item.id} className={cx('product-cart-item', 'row', 'align-items-center', 'text-center', 'mb-4', 'pb-3')}>
                                        {/* Ảnh */}
                                        <div className="col-3 col-md-2">
                                            <img src={item.image} alt={item.name} className="img-fluid" />
                                        </div>
                                        {/* Tên */}
                                        <div className={cx('product-cart-item-name', 'col-9', 'col-md-3', 'text-start', 'text-md-center')}>
                                            {item.name}
                                        </div>
                                        {/* Giá */}
                                        <div className="col-4 col-md-2 mt-2 mt-md-0">{formatCurrency(item.price)}</div>
                                        {/* Số lượng */}
                                        <div className="col-4 col-md-2 mt-2 mt-md-0">
                                            <div className="d-flex justify-content-center">
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    readOnly
                                                    className="form-control form-control-sm text-center mx-2"
                                                    style={{ width: '60px' }}
                                                />
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                        </div>
                                        {/* Tổng tiền */}
                                        <div className={cx('product-cart-item-total', 'col-3 col-md-2', 'mt-2', 'mt-md-0')}>
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                        {/* Xóa */}
                                        <div className="col-1 col-md-1 mt-2 mt-md-0">
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item.id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer của giỏ hàng */}
                            <div className={cx('footer-cart', 'row', 'mt-4', 'align-items-center')}>
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <Link to="/product" className={cx('continue-buying', 'btn', 'btn-outline-secondary', 'link-resetcss')}>
                                        Tiếp tục mua hàng
                                    </Link>
                                </div>
                                <div className="col-md-6 mt-4">
                                    <div className={cx('total-price-cart', 'd-flex', 'justify-content-between', 'align-items-center', 'p-2', 'border', 'rounded', 'mb-3')}>
                                        <span>Tổng tiền thanh toán:</span>
                                        <span className={cx('total-price-number', 'fw-bold', 'fs-5')}>
                                            {formatCurrency(totalPrice)}
                                        </span>
                                    </div>
                                    <div className={cx('pay-product')}>
                                        <Link to="/checkout" className={cx('pay-product-link', 'btn', 'btn-primary', 'w-100', 'link-resetcss')}>
                                            Tiến hành thanh toán
                                        </Link>
                                    </div>
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