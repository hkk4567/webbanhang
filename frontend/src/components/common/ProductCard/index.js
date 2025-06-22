import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductCard.module.scss';
import { useCart } from '../../../context/CartContext'; // Giả sử bạn có CartContext
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';

const cx = classNames.bind(styles);

// Một URL ảnh placeholder phòng khi sản phẩm không có ảnh
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400.png?text=No+Image';

/**
 * Component hiển thị một sản phẩm duy nhất, hỗ trợ 2 chế độ xem: grid và list.
 * @param {object} product - Object sản phẩm từ API.
 * @param {function} onViewProduct - Hàm callback để mở modal xem nhanh.
 * @param {string} viewMode - Chế độ xem ('grid' hoặc 'list').
 */
function ProductCard({ product, onViewProduct, viewMode = 'grid' }) {
    // --- LẤY HÀM addToCart TỪ CONTEXT ---
    const { addToCart } = useCart(); // Giả sử context cung cấp hàm này

    // Kiểm tra xem product có tồn tại không để tránh lỗi
    if (!product) {
        return null; // Hoặc hiển thị một skeleton loader
    }

    // Sử dụng destructuring để lấy các thuộc tính cần thiết, có giá trị mặc định
    const {
        id,
        name = 'Tên sản phẩm không xác định',
        price = 0,
        imageUrl,
        description = 'Sản phẩm hiện chưa có mô tả chi tiết.',
        quantity = 0, // Lấy số lượng tồn kho
        status = 'inactive', // Lấy trạng thái,
        category
    } = product;

    const isOutOfStock = quantity === 0 || status !== 'active';

    // Xử lý sự kiện "Thêm vào giỏ"
    const handleAddToCart = (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định (như điều hướng của Link)
        e.stopPropagation(); // Ngăn sự kiện nổi bọt lên các phần tử cha

        if (isOutOfStock) {
            alert("Sản phẩm này hiện đã hết hàng hoặc không có sẵn.");
            return;
        }

        // Gọi hàm từ context với ID và số lượng là 1
        addToCart(id, 1);
        alert(`Đã thêm "${name}" vào giỏ hàng!`); // Có thể thay bằng toastify
    };

    // Xử lý sự kiện "Xem nhanh"
    const handleViewProduct = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onViewProduct) {
            onViewProduct(product);
        }
    };

    const formatCurrency = (amount) => {
        // Thêm kiểm tra để đảm bảo amount là một số hợp lệ
        const numberAmount = Number(amount);
        if (isNaN(numberAmount)) {
            return 'Giá không hợp lệ';
        }
        return numberAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };
    const formattedPrice = formatCurrency(price);
    return (
        <div className={cx('wrapper', { 'list-view': viewMode === 'list' })}>
            {/* KHỐI 1: HÌNH ẢNH VÀ CÁC NÚT HÀNH ĐỘNG */}
            <div className={cx('product-image-container')}>
                <Link to={`/product/${id}`} className={cx('product-link')}>
                    <img src={imageUrl || PLACEHOLDER_IMAGE} alt={name} />
                </Link>

                {/* Badge Hết hàng */}
                {isOutOfStock && (
                    <div className={cx('out-of-stock-badge')}>Hết hàng</div>
                )}

                {/* Các nút hành động khi hover (chỉ ở grid view) */}
                <div className={cx('product-actions-overlay')}>
                    <button
                        className={cx('action-icon', 'add-to-cart')}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                    >
                        <FontAwesomeIcon icon={faCartPlus} />
                    </button>
                    <button
                        className={cx('action-icon', 'quick-view')}
                        onClick={handleViewProduct}
                        title="Xem nhanh"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                </div>
            </div>

            {/* KHỐI 2: THÔNG TIN SẢN PHẨM */}
            <div className={cx('product-info')}>
                <h3 className={cx('product-name')}>
                    <Link to={`/product/${id}`}>{name}</Link>
                </h3>
                <div className={cx('product-price')}>
                    <p>{formattedPrice}</p>
                </div>

                {/* --- NỘI DUNG CHỈ HIỂN THỊ Ở LIST VIEW --- */}
                {viewMode === 'list' && (
                    <>
                        {category?.name && (
                            <div className={cx('product-category')}>
                                <Link to={`/products/${category.id}`}>{category.name}</Link>
                            </div>
                        )}
                        <p className={cx('product-description')}>{description}</p>
                        <div className={cx('product-actions-list')}>
                            <button
                                className={cx('btn-action')}
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                            >
                                <FontAwesomeIcon icon={faCartPlus} className={cx('btn-icon')} />
                                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
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