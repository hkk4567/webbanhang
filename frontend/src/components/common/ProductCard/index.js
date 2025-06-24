import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductCard.module.scss';
import { useCart } from '../../../context/CartContext'; // Giả sử bạn có CartContext
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '../../../context/AuthContext';
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
    const { isLoggedIn } = useAuth(); // <<-- LẤY TRẠNG THÁI ĐĂNG NHẬP
    const navigate = useNavigate(); // Hook để điều hướng

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
        e.preventDefault();
        e.stopPropagation();

        // 1. Kiểm tra trạng thái đăng nhập TRƯỚC TIÊN
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
            // 2. Điều hướng người dùng đến trang đăng nhập
            navigate('/login');
            return; // Dừng hàm ở đây
        }

        // 3. Nếu đã đăng nhập, tiếp tục kiểm tra tồn kho
        if (isOutOfStock) {
            alert("Sản phẩm này hiện đã hết hàng hoặc không có sẵn.");
            return;
        }

        // 4. Nếu mọi thứ đều ổn, gọi hàm từ context
        try {
            addToCart(id, 1);
            // Có thể dùng thư viện toast để thông báo đẹp hơn
            alert(`Đã thêm "${name}" vào giỏ hàng!`);
        } catch (error) {
            // Bắt lỗi từ context (ví dụ: lỗi mạng, lỗi server)
            alert(error.response?.data?.message || "Không thể thêm sản phẩm, vui lòng thử lại.");
        }
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

                {isOutOfStock && (
                    <div className={cx('out-of-stock-badge')}>Hết hàng</div>
                )}

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
                <div className={cx('product-meta')}>
                    {category?.name && (
                        <Link to={`/products/${category.id}`} className={cx('categoryBadge')}>
                            {category.name}
                        </Link>
                    )}
                    <div className={cx('product-name')}>
                        <Link to={`/product/${id}`} title={name}>{name}</Link>
                    </div>
                </div>

                {/* Giá sản phẩm, được định vị tuyệt đối bởi SCSS */}
                <div className={cx('product-price')}>
                    <p>{formattedPrice}</p>
                </div>

                {viewMode === 'list' && (
                    // Sử dụng React Fragment (<>) để nhóm các phần tử
                    <>
                        <p className={cx('product-description')} title={description}>{description}</p>
                        <div className={cx('product-actions-list')}>
                            <button className={cx('btn-action')} onClick={handleAddToCart} disabled={isOutOfStock}>
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