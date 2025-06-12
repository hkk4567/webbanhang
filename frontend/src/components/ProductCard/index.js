import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductCard.module.scss';

// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';

const cx = classNames.bind(styles);

// Component nhận vào một prop là 'product' object
function ProductCard({ product }) {
    // Hàm xử lý sự kiện (sẽ được truyền từ component cha)
    const handleAddToCart = (e) => {
        e.preventDefault(); // Ngăn Link điều hướng khi chỉ muốn thêm vào giỏ
        console.log(`Đã thêm sản phẩm "${product.name}" vào giỏ hàng.`);
        // Thêm logic dispatch Redux hoặc gọi Context API ở đây
    };

    const handleViewProduct = (e) => {
        e.preventDefault();
        console.log(`Xem nhanh sản phẩm: "${product.name}"`);
        // Thêm logic mở modal xem nhanh ở đây
    };

    return (
        <div className={cx('product-card-wrapper')}>
            <div className={cx('product-item-box')}>
                {/* Link bao bọc hình ảnh sản phẩm, dẫn đến trang chi tiết */}
                <Link to={`/product/${product.slug}`} className={cx('link-product')}>
                    <img src={product.image} alt={product.name} />
                </Link>

                {/* Giá sản phẩm */}
                <div className={cx('product-item-box-price')}>
                    <p>{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                </div>

                {/* Nút thêm vào giỏ hàng */}
                <div className={cx('product-item-box-cart')} onClick={handleAddToCart}>
                    <FontAwesomeIcon icon={faCartPlus} />
                </div>

                {/* Nút xem nhanh */}
                <div className={cx('product-item-box-view')} onClick={handleViewProduct}>
                    <FontAwesomeIcon icon={faEye} />
                </div>
            </div>

            {/* Tên sản phẩm */}
            <div className={cx('product-item-box-content')}>
                <h3>
                    <Link to={`/product/${product.slug}`}>{product.name}</Link>
                </h3>
            </div>
        </div>
    );
}

export default ProductCard;