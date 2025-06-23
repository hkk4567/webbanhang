import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Main.module.scss'; // Hoặc đường dẫn đúng đến file SCSS của bạn
import { Spinner, Alert } from 'react-bootstrap';

// Import các thành phần và context cần thiết
import CartPageItem from './components/CartPageItem';
import { useCart } from '../../../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function CartProduct() {
    // Lấy đầy đủ các giá trị và hàm từ CartContext
    // Tên biến đã khớp với những gì context trả về
    const {
        cartItems,
        totalItems,
        totalPrice,
        updateQuantity,
        removeFromCart,
        isLoading,
        error,
    } = useCart();
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
    // Các hàm xử lý sự kiện giờ đây rất đơn giản,
    // chúng chỉ đóng vai trò "chuyển tiếp" lệnh đến context.
    const handleActionError = (error) => {
        // Lấy message từ response của Axios
        const message = error.response?.data?.message || 'Đã có lỗi không mong muốn xảy ra.';
        setActionMessage({ type: 'danger', text: message });
        setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            setActionMessage({ type: '', text: '' });
            // Await lời gọi từ context
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            // Nếu có lỗi, gọi hàm xử lý lỗi
            handleActionError(error);
        }
    };

    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
    };

    // --- RENDER DỰA TRÊN CÁC TRẠNG THÁI ---

    // 1. Trạng thái đang tải dữ liệu
    if (isLoading) {
        return (
            <div className="container text-center py-5" style={{ minHeight: '91vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                    <Spinner animation="border" />
                    <h2 className="mt-3">Đang tải giỏ hàng...</h2>
                </div>
            </div>
        );
    }

    // 2. Trạng thái có lỗi xảy ra khi tải
    if (error) {
        return (
            <div className="container text-center py-5">
                <Alert variant="danger">{error}</Alert>
                <Link to="/" className="btn btn-primary mt-2">
                    Về trang chủ
                </Link>
            </div>
        );
    }

    // 3. Trạng thái giỏ hàng rỗng
    if (!cartItems || cartItems.length === 0) {
        return (
            <>
                <div className={cx('bread-crumb')}>
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <ul className={cx('breadrumb')}>
                                    <li className={cx('home')}>
                                        <Link to="/">Trang chủ</Link>
                                        <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                    </li>
                                    <li className={cx('breadrumb-title-page')}>Giỏ hàng</li>
                                </ul>
                                <div className={cx('title-page')}>Giỏ hàng của bạn</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container text-center py-5">
                    <h2 className="mb-3">Giỏ hàng của bạn đang trống</h2>
                    <p className="text-muted">Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm nhé!</p>
                    <Link to="/products" className="btn btn-primary mt-2">
                        Khám phá sản phẩm
                    </Link>
                </div>
            </>
        );
    }

    // 4. Trạng thái giỏ hàng có sản phẩm
    return (
        <>
            {/* Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/">Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li className={cx('breadrumb-title-page')}>Giỏ hàng</li>
                            </ul>
                            <div className={cx('title-page')}>Giỏ hàng của bạn</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nội dung giỏ hàng */}
            <div className={cx('cart-content')}>
                <div className="container">
                    {actionMessage.text && (
                        <Alert variant={actionMessage.type} onClose={() => setActionMessage({ type: '', text: '' })} dismissible>
                            {actionMessage.text}
                        </Alert>
                    )}
                    {/* Header của bảng sản phẩm trên desktop */}
                    <div className="row d-none d-lg-flex fw-bold text-muted text-uppercase mb-3 align-items-center">
                        <div className="col-lg-5">Sản phẩm</div>
                        <div className="col-lg-2 text-center">Đơn giá</div>
                        <div className="col-lg-2 text-center">Số lượng</div>
                        <div className="col-lg-2 text-end">Thành tiền</div>
                        <div className="col-lg-1 text-center">Xóa</div>
                    </div>
                    <hr className="d-none d-lg-block" />

                    {/* Danh sách sản phẩm */}
                    <div className={cx('cart-items-container')}>
                        {cartItems.map((item) => (
                            <CartPageItem
                                key={item.productId}
                                item={item}
                                onQuantityChange={handleQuantityChange}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>

                    {/* Phần tổng kết và thanh toán */}
                    <div className="row mt-4 justify-content-end mb-3">
                        <div className="col-lg-5 col-md-8">
                            <div className="border p-4 rounded shadow-sm">
                                <h4 className="mb-3">Tổng cộng giỏ hàng</h4>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted">Tổng ({totalItems} sản phẩm):</span>
                                    <span>
                                        {Number(totalPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fs-4 mb-3">
                                    <span className="fw-bold">Thành tiền:</span>
                                    <span className="fw-bold text-danger">
                                        {Number(totalPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span>
                                </div>
                                <p className="text-muted small">Phí vận chuyển và mã giảm giá sẽ được áp dụng ở bước thanh toán.</p>
                                <Link to="/checkout" className="btn btn-primary w-100 fw-bold py-2">
                                    Tiến hành Thanh toán
                                </Link>
                                <Link to="/products" className="btn btn-outline-secondary w-100 mt-2">
                                    Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CartProduct;