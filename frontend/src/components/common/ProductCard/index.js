import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductCard.module.scss';
import { useCart } from '../../../context/CartContext';
// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';

const cx = classNames.bind(styles);

// Component nhận vào một prop là 'product' object
function ProductCard({ product, onViewProduct, viewMode = 'grid' }) {
    // --- LẤY HÀM addToCart TỪ CONTEXT ---
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        // --- GỌI HÀM TỪ CONTEXT ---
        addToCart(product);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    // --- HÀM NÀY GIỜ SẼ GỌI HÀM CỦA CHA ---
    const handleViewProduct = (e) => {
        e.preventDefault();
        if (onViewProduct) {
            onViewProduct(product); // Gọi hàm của cha và truyền dữ liệu sản phẩm lên
        }
    };
    const description = product.description || 'Đây là mô tả ngắn gọn cho sản phẩm, giúp người dùng hiểu rõ hơn về công dụng và đặc điểm nổi bật.';
    return (
        // Thêm class 'list-view' một cách có điều kiện vào wrapper chính
        <div className={cx('wrapper', { 'list-view': viewMode === 'list' })}>

            {/* KHỐI 1: HÌNH ẢNH VÀ CÁC NÚT HÀNH ĐỘNG KHI HOVER (GRID VIEW) */}
            <div className={cx('product-image-container')}>
                <Link to={`/product/${product.id}`} className={cx('product-link')}>
                    <img src={product.image} alt={product.name} />
                </Link>
                {/* Các nút này sẽ được ẩn đi ở chế độ list-view bằng CSS */}
                <div className={cx('product-actions-overlay')}>
                    <div className={cx('action-icon', 'add-to-cart')} onClick={handleAddToCart}>
                        <FontAwesomeIcon icon={faCartPlus} />
                    </div>
                    <div className={cx('action-icon', 'quick-view')} onClick={handleViewProduct}>
                        <FontAwesomeIcon icon={faEye} />
                    </div>
                </div>
            </div>

            {/* KHỐI 2: TOÀN BỘ THÔNG TIN SẢN PHẨM */}
            <div className={cx('product-info')}>
                <h3 className={cx('product-name')}>
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                <div className={cx('product-price')}>
                    <p>{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                </div>

                {/* --- NỘI DUNG CHỈ HIỂN THỊ Ở LIST VIEW --- */}
                {viewMode === 'list' && (
                    <>
                        <p className={cx('product-description')}>{description}</p>
                        <div className={cx('product-actions-list')}>
                            <button className={cx('btn-action')} onClick={handleAddToCart}>
                                <FontAwesomeIcon icon={faCartPlus} className={cx('btn-icon')} />
                                Thêm vào giỏ
                            </button>
                            <button className={cx('btn-action')} onClick={handleViewProduct}>
                                <FontAwesomeIcon icon={faEye} className={cx('btn-icon')} />
                                Xem nhanh
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProductCard;