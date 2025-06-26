import React from 'react';
import classNames from 'classnames/bind';
import styles from './CartItem.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);
const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

function CartItem({ item, onQuantityChange, onRemove }) {
    // Kiểm tra an toàn
    if (!item) return null;

    // Sử dụng productId để thao tác
    const handleDecrease = () => {
        onQuantityChange(item.productId, item.quantity - 1);
    };

    const handleIncrease = () => {
        onQuantityChange(item.productId, item.quantity + 1);
    };

    const handleRemove = () => {
        onRemove(item.productId);
    };
    console.log(item);
    return (
        // Component này giờ có thể dùng cho cả trang giỏ hàng và dropdown
        // Chúng ta có thể thêm prop `variant` để thay đổi style nếu cần
        // Ví dụ: <CartItem variant="dropdown" ... />
        <li className={cx('cart-item')}>
            <div className={cx('item-image')}>
                <img src={item.imageUrl} alt={item.name} />
            </div>

            <div className={cx('item-content')}>
                {/* Dẫn link đến trang chi tiết sản phẩm */}
                <Link to={`/product/${item.productId}`} className={cx('item-name')}>
                    {item.name}
                </Link>

                {/* Bộ điều khiển số lượng */}
                <div className={cx('item-quantity')}>
                    <button className={cx('quantity-btn')} onClick={handleDecrease}>-</button>
                    {/* Input nên là readOnly vì số lượng được quản lý bằng state */}
                    <input className={cx('quantity-input')} type="text" value={item.quantity} readOnly />
                    <button className={cx('quantity-btn')} onClick={handleIncrease}>+</button>
                </div>

                <div className={cx('item-price-single')}>
                    {formatCurrency(item.price)}
                </div>
            </div>

            <div className={cx('item-actions')}>
                <div className={cx('item-price-total')}>
                    {formatCurrency(item.price * item.quantity)}
                </div>
                <button className={cx('item-remove-btn')} onClick={handleRemove} title="Xóa sản phẩm">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </li>
    );
}

export default CartItem;