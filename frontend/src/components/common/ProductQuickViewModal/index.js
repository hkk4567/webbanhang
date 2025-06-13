import React from 'react';
import { Modal, Button } from 'react-bootstrap'; // Import component từ react-bootstrap
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductQuickViewModal.module.scss';
import { useCart } from '../../../context/CartContext';

const cx = classNames.bind(styles);

function ProductQuickViewModal({ show, handleClose, product }) {
    const { addToCart } = useCart();

    if (!product) {
        return null; // Không render gì nếu không có sản phẩm được chọn
    }

    const handleAddToCart = () => {
        addToCart(product);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
        handleClose(); // Đóng modal sau khi thêm vào giỏ
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{product.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    <div className="col-md-6">
                        <img src={product.image} alt={product.name} className={cx('modal-image')} />
                    </div>
                    <div className="col-md-6">
                        <div className={cx('modal-price')}>
                            {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </div>
                        <p className={cx('modal-description')}>{product.description}</p>
                        <div className={cx('modal-category')}>
                            <strong>Danh mục:</strong> {product.category}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Link to={`/product/${product.id}`} className="btn btn-outline-secondary" onClick={handleClose}>
                    Xem chi tiết
                </Link>
                <Button variant="primary" onClick={handleAddToCart}>
                    Thêm vào giỏ hàng
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ProductQuickViewModal;