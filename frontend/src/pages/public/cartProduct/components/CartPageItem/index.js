import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CartPageItem.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

// Hàm format tiền tệ an toàn, chuyển đổi string sang number trước khi format
const formatCurrency = (amount) => {
    // Chuyển đổi amount thành số, nếu không phải số hợp lệ thì mặc định là 0
    const numberAmount = Number(amount) || 0;
    return numberAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

function CartPageItem({ item, onQuantityChange, onRemove }) {
    // --- BƯỚC 1: SỬA CÁC HÀM HANDLER ĐỂ DÙNG `item.productId` ---
    const handleDecrease = () => {
        // Nếu số lượng hiện tại là 1 mà người dùng bấm trừ, hãy xóa sản phẩm
        if (item.quantity <= 1) {
            handleRemove();
        } else {
            onQuantityChange(item.productId, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        onQuantityChange(item.productId, item.quantity + 1);
    };

    const handleRemove = () => {
        // Truyền productId vào hàm onRemove
        onRemove(item.productId);
    };

    // --- BƯỚC 2: RENDER DỮ LIỆU TỪ OBJECT `item` MỘT CÁCH CHÍNH XÁC ---
    return (
        // Thêm một đường gạch ngang giữa các item cho dễ nhìn
        <div className={cx('cart-page-item', 'row', 'align-items-center', 'py-3', 'border-bottom')}>

            {/* Cột sản phẩm (Ảnh và Tên) */}
            <div className="col-lg-5 col-12 d-flex align-items-center mb-3 mb-lg-0">
                {/* Link đến trang chi tiết sản phẩm bằng productId */}
                <Link to={`/product/${item.productId}`}>
                    {/* Sử dụng item.imageUrl */}
                    <img src={item.imageUrl} alt={item.name} className={cx('item-image')} />
                </Link>
                <div className="ms-3">
                    <Link to={`/product/${item.productId}`} className={cx('item-name')}>{item.name}</Link>
                    {/* Cột đơn giá (hiển thị trên mobile) */}
                    <div className="d-lg-none mt-1">
                        <span className="text-muted">Đơn giá: </span>
                        <span className={cx('item-price-mobile')}>{formatCurrency(item.price)}</span>
                    </div>
                </div>
            </div>

            {/* Cột đơn giá (chỉ hiển thị trên desktop) */}
            <div className="col-lg-2 text-center d-none d-lg-block">
                <span className={cx('item-price-desktop')}>{formatCurrency(item.price)}</span>
            </div>

            {/* Cột số lượng */}
            <div className="col-lg-2 col-6">
                <div className={cx('item-quantity', 'mx-auto', 'mx-lg-0')}>
                    <button className={cx('quantity-btn')} onClick={handleDecrease}>-</button>
                    <input className={cx('quantity-input')} type="text" value={item.quantity} readOnly />
                    <button className={cx('quantity-btn')} onClick={handleIncrease}>+</button>
                </div>
            </div>

            {/* Cột thành tiền */}
            <div className="col-lg-2 col-6 text-end">
                <span className={cx('item-total-price')}>
                    {formatCurrency(Number(item.price) * item.quantity)}
                </span>
            </div>

            {/* Cột nút xóa */}
            <div className="col-lg-1 text-center mt-3 mt-lg-0">
                <button className={cx('remove-btn')} onClick={handleRemove} title="Xóa sản phẩm">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </div>
    );
}

export default CartPageItem;