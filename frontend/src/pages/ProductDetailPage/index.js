import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetailPage.module.scss';

// Import dữ liệu giả
import { mockAllProducts } from '../../data/products';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faMinus, faPlus, faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faInstagram, faGooglePlusG, faPinterest } from '@fortawesome/free-brands-svg-icons';


const cx = classNames.bind(styles);

function ProductDetailPage() {
    const { id } = useParams(); // Lấy 'id' từ URL, ví dụ: /product/ca-phe-den-da
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Tìm sản phẩm dựa trên id từ URL khi component được mount hoặc id thay đổi
    useEffect(() => {
        const foundProduct = mockAllProducts.find(p => p.id === +id);
        setProduct(foundProduct);
        setQuantity(1); // Reset số lượng về 1 mỗi khi chuyển trang sản phẩm
    }, [id]);

    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + amount;
            return newQuantity < 1 ? 1 : newQuantity; // Đảm bảo số lượng không nhỏ hơn 1
        });
    };

    const handleAddToCart = () => {
        console.log(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng.`);
        alert(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
    };

    // Xử lý khi sản phẩm không được tìm thấy
    if (!product) {
        return (
            <div className="container text-center py-5">
                <h2>Sản phẩm không tồn tại</h2>
                <p>Không thể tìm thấy sản phẩm bạn yêu cầu. Vui lòng quay lại trang sản phẩm.</p>
                <Link to="/product" className="btn btn-primary">Xem tất cả sản phẩm</Link>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb */}
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

            {/* Product Details */}
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
                                        readOnly // Ngăn người dùng nhập trực tiếp
                                    />
                                    <button type="button" className={cx('quantity-btn')} onClick={() => handleQuantityChange(1)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
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