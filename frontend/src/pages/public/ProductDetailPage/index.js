import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetailPage.module.scss';

// --- SỬA 2: IMPORT useCart ĐỂ TRUY CẬP GIỎ HÀNG ---
import { useCart } from '../../../context/CartContext';
import { mockAllProducts } from '../../../data/products';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faMinus, faPlus, faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faInstagram, faGooglePlusG, faPinterest } from '@fortawesome/free-brands-svg-icons';

const cx = classNames.bind(styles);

function ProductDetailPage() {
    const { id } = useParams(); // Lấy 'id' từ URL

    // --- SỬA 3: LẤY HÀM addToCart TỪ CONTEXT ---
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Tìm sản phẩm dựa trên id từ URL
    useEffect(() => {
        // `+id` chuyển đổi id (string) từ URL thành number để so sánh
        const foundProduct = mockAllProducts.find(p => p.id === +id);
        setProduct(foundProduct);
        setQuantity(1);
    }, [id]);

    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + amount;
            return newQuantity < 1 ? 1 : newQuantity;
        });
    };

    // --- SỬA 4: CẬP NHẬT HÀM XỬ LÝ THÊM VÀO GIỎ ---
    const handleAddToCart = () => {
        if (product) {
            // Gọi hàm từ context, truyền vào sản phẩm và số lượng đã chọn
            addToCart(product, quantity);
            alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
        }
    };

    // Xử lý khi sản phẩm không được tìm thấy
    if (!product) {
        return (
            <div className="container text-center py-5">
                <h2>Đang tải... hoặc sản phẩm không tồn tại</h2>
                <Link to="/product" className="btn btn-primary">Xem tất cả sản phẩm</Link>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb (giữ nguyên) */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <ul className={cx('breadrumb')}>
                        <li className={cx('home')}>
                            <Link to="/" >Trang chủ</Link>
                            <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                        </li>
                        <li className={cx('breadrumb-product-type')}>
                            <Link to={`/category/${product.category}`}>{product.category}</Link>
                            <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                        </li>
                        <li className={cx('breadrumb-product-name')}>
                            {product.name}
                        </li>
                    </ul>
                </div>
            </div>

            {/* Product Details (giữ nguyên) */}
            <div className={cx('product-container-box')}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-12">
                            <div className={cx('product-image-container')}>
                                <img src={product.image} alt={product.name} />
                            </div>
                        </div>
                        <div className="col-lg-7 col-md-12">
                            <div className={cx('product-detail')}>
                                <h1 className={cx('detail-name')}>{product.name}</h1>
                                <div className={cx('detail-price')}>
                                    {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </div>
                                <div className={cx('detail-quantity')}>
                                    <button type="button" className={cx('quantity-btn')} onClick={() => handleQuantityChange(-1)}>
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <input
                                        className={cx('quantity-input')}
                                        type="text"
                                        value={quantity}
                                        readOnly
                                    />
                                    <button type="button" className={cx('quantity-btn')} onClick={() => handleQuantityChange(1)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    {/* Nút này giờ đã được kết nối với Context */}
                                    <button type="button" className={cx('add-to-cart-btn')} onClick={handleAddToCart}>
                                        <FontAwesomeIcon icon={faCartPlus} className="me-2" />
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                                <div className={cx('detail-description')}>
                                    <p>{product.description}</p>
                                </div>
                                <div className={cx('share-social-media')}>
                                    <div>Chia sẻ:</div>
                                    <a href="/" style={{ backgroundColor: '#3b5998' }}><FontAwesomeIcon icon={faFacebookSquare} /></a>
                                    <a href="/" style={{ backgroundColor: '#e4405f' }}><FontAwesomeIcon icon={faInstagram} /></a>
                                    <a href="/" style={{ backgroundColor: '#dd4b39' }}><FontAwesomeIcon icon={faGooglePlusG} /></a>
                                    <a href="/" style={{ backgroundColor: '#bd081c' }}><FontAwesomeIcon icon={faPinterest} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductDetailPage;