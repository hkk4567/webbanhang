import React from 'react';
import classNames from 'classnames/bind';
import styles from './CartItem.module.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

// Hàm tiện ích để định dạng tiền tệ
const formatCurrency = (amount) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

/**
 * Component hiển thị một sản phẩm trong giỏ hàng.
 * @param {object} props
 * @param {object} props.item - Dữ liệu sản phẩm (id, name, image, price, quantity, slug)
 * @param {function} props.onQuantityChange - Hàm được gọi khi thay đổi số lượng, nhận (itemId, newQuantity)
 * @param {function} props.onRemove - Hàm được gọi khi xóa sản phẩm, nhận (itemId)
 */
function CartItem({ item, onQuantityChange, onRemove }) {

    // Xử lý khi nhấn nút giảm số lượng
    const handleDecrease = () => {
        onQuantityChange(item.id, item.quantity - 1);
    };

    // Xử lý khi nhấn nút tăng số lượng
    const handleIncrease = () => {
        onQuantityChange(item.id, item.quantity + 1);
    };

    // Xử lý khi nhấn nút xóa
    const handleRemove = () => {
        onRemove(item.id);
    };

    return (
        <li className={cx('cart-item')}>
            {/* Ảnh sản phẩm */}
            <div className={cx('item-image')}>
                <img src={item.image} alt={item.name} />
            </div>

            {/* Thông tin sản phẩm */}
            <div className={cx('item-content')}>
                <Link to={`/product/${item.id}`} className={cx('item-name')}>
                    {item.name}
                </Link>

                {/* Bộ điều khiển số lượng */}
                <div className={cx('item-quantity')}>
                    <button className={cx('quantity-btn')} onClick={handleDecrease}>-</button>
                    <input className={cx('quantity-input')} type="text" value={item.quantity} readOnly />
                    <button className={cx('quantity-btn')} onClick={handleIncrease}>+</button>
                </div>

                {/* Giá tiền của một sản phẩm */}
                <div className={cx('item-price-single')}>
                    {formatCurrency(item.price)}
                </div>
            </div>

            {/* Tổng tiền và nút xóa */}
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