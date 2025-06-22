import React from 'react';
import { Modal, Button } from 'react-bootstrap'; // Import component từ react-bootstrap
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductQuickViewModal.module.scss';
import { useCart } from '../../../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Thêm vào để dùng icon
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(styles);
const formatCurrency = (amount) => {
    const numberAmount = Number(amount);
    if (isNaN(numberAmount)) {
        return 'N/A';
    }
    return numberAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

function ProductQuickViewModal({ show, handleClose, product }) {
    const { addToCart } = useCart();

    if (!product) {
        return null; // Không render gì nếu không có sản phẩm được chọn
    }
    const {
        id,
        name = 'Sản phẩm',
        price = 0,
        imageUrl,
        description = 'Chưa có mô tả cho sản phẩm này.',
        category, // Lấy cả object category
        quantity = 0,
        status = 'inactive'
    } = product;
    const isOutOfStock = quantity === 0 || status !== 'active';

    const handleAddToCart = () => {
        if (isOutOfStock) {
            alert("Sản phẩm này hiện đã hết hàng.");
            return;
        }
        // Gọi hàm từ context với ID và số lượng là 1
        addToCart(id, 1);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
        handleClose(); // Đóng modal sau khi thêm vào giỏ
    };
    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                {/* Modal.Title chỉ chấp nhận string, không phải JSX phức tạp */}
                <Modal.Title>{name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    <div className="col-md-6">
                        <img src={imageUrl || 'https://via.placeholder.com/400x400.png?text=No+Image'} alt={name} className={cx('modal-image')} />
                    </div>
                    <div className="col-md-6">
                        {/* SỬA LẠI ĐÂY: Dùng hàm formatCurrency */}
                        <div className={cx('modal-price')}>
                            {formatCurrency(price)}
                        </div>

                        <p className={cx('modal-description')}>{description}</p>

                        {/* SỬA LẠI ĐÂY: Chỉ render `category.name` */}
                        <div className={cx('modal-category')}>
                            <strong>Danh mục:</strong>
                            {/* Dùng optional chaining để tránh lỗi nếu không có category */}
                            {category && category.id ? (
                                <Link to={`/products/${category.id}`} onClick={handleClose} className={cx('category-link')}>
                                    {category.name}
                                </Link>
                            ) : (
                                <span className={cx('category-unclassified')}>
                                    Chưa phân loại
                                </span>
                            )}
                        </div>

                        <div className={cx('modal-status', 'mt-2')}>
                            <strong>Tình trạng:</strong>
                            <span className={`ms-2 badge ${isOutOfStock ? 'bg-danger' : 'bg-success'}`}>
                                {isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
                            </span>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Link to={`/product/${id}`} className="btn btn-outline-secondary" onClick={handleClose}>
                    Xem chi tiết
                </Link>
                <Button variant="primary" onClick={handleAddToCart} disabled={isOutOfStock}>
                    <FontAwesomeIcon icon={faCartPlus} className="me-2" />
                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ProductQuickViewModal;