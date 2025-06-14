import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CartPageItem.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const formatCurrency = (amount) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

function CartPageItem({ item, onQuantityChange, onRemove }) {
    const handleDecrease = () => onQuantityChange(item.id, item.quantity - 1);
    const handleIncrease = () => onQuantityChange(item.id, item.quantity + 1);
    const handleRemove = () => onRemove(item.id);

    return (
        <div className={cx('cart-page-item', 'row', 'align-items-center', 'py-3')}>
            {/* Cột sản phẩm (Ảnh và Tên) */}
            <div className="col-md-5 col-12 d-flex align-items-center">
                <Link to={`/product/${item.slug}`}>
                    <img src={item.image} alt={item.name} className={cx('item-image')} />
                </Link>
                <div className="ms-3">
                    <Link to={`/product/${item.slug}`} className={cx('item-name')}>{item.name}</Link>
                    <div className={cx('item-price')}>{formatCurrency(item.price)}</div>
                </div>
            </div>

            {/* Cột số lượng */}
            <div className="col-md-3 col-4 mt-3 mt-md-0">
                <div className={cx('item-quantity')}>
                    <button className={cx('quantity-btn')} onClick={handleDecrease}>-</button>
                    <input className={cx('quantity-input')} type="text" value={item.quantity} readOnly />
                    <button className={cx('quantity-btn')} onClick={handleIncrease}>+</button>
                </div>
            </div>

            {/* Cột tổng tiền */}
            <div className="col-md-3 col-6 mt-3 mt-md-0 text-md-end">
                <span className={cx('item-total-price')}>{formatCurrency(item.price * item.quantity)}</span>
            </div>

            {/* Cột nút xóa */}
            <div className="col-md-1 col-2 mt-3 mt-md-0 text-end">
                <button className={cx('remove-btn')} onClick={handleRemove} title="Xóa sản phẩm">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </div>
    );
}

export default CartPageItem;