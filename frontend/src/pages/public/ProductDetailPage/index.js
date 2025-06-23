import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetailPage.module.scss';
import { Spinner, Alert } from 'react-bootstrap'; // Import Spinner

// --- BƯỚC 1: IMPORT HÀM API MỚI ---
import { getProductById } from '../../../api/productService';
import { useCart } from '../../../context/CartContext';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faMinus, faPlus, faCartPlus, faSyncAlt } from '@fortawesome/free-solid-svg-icons'; // Thêm icon update
import { faFacebookSquare, faInstagram, faGooglePlusG, faPinterest } from '@fortawesome/free-brands-svg-icons';

const cx = classNames.bind(styles);

// Hàm slugify không cần thiết nữa vì chúng ta có categoryId từ API
// nhưng có thể giữ lại nếu bạn muốn dùng cho tên sản phẩm trên breadcrumb

function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart, updateQuantity, cartItems } = useCart();

    // --- BƯỚC 2: THÊM STATE ĐIỀU KHIỂN LOADING VÀ LỖI ---
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
    // --- TÌM SẢN PHẨM HIỆN TẠI TRONG GIỎ HÀNG ---
    const itemInCart = cartItems.find(item => item.productId === Number(id));
    const isProductInCart = !!itemInCart;
    // --- BƯỚC 3: CẬP NHẬT useEffect ĐỂ GỌI API ---
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getProductById(id);
                const fetchedProduct = response.data.data.product;
                setProduct(fetchedProduct);

                // Sau khi có sản phẩm, kiểm tra xem nó có trong giỏ không
                const currentItemInCart = cartItems.find(item => item.productId === Number(id));
                if (currentItemInCart) {
                    // Nếu có, đặt số lượng hiển thị bằng số lượng trong giỏ
                    setQuantity(currentItemInCart.quantity);
                } else {
                    // Nếu không, đặt lại số lượng là 1
                    setQuantity(1);
                }
            } catch (err) {
                console.error('Failed to fetch product details:', err);
                setError('Không tìm thấy sản phẩm hoặc đã có lỗi xảy ra.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
        // Phụ thuộc vào `id` và cả `cartItems` để khi giỏ hàng thay đổi (ở nơi khác),
        // component này cũng cập nhật lại số lượng
    }, [id, cartItems]);

    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + amount;
            if (newQuantity < 1) return 1;
            if (product && newQuantity > product.quantity) {
                setActionMessage({ type: 'danger', text: `Số lượng tồn kho chỉ còn ${product.quantity} sản phẩm.` });
                setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
                return product.quantity;
            }
            return newQuantity;
        });
    };

    const handleCartAction = async () => {
        if (!product || !product.id || quantity <= 0) {
            alert("Dữ liệu không hợp lệ.");
            return;
        }

        setActionMessage({ type: '', text: '' });

        try {
            if (isProductInCart) {
                // Nếu đã có trong giỏ, CẬP NHẬT số lượng
                // So sánh số lượng mới với số lượng cũ để tránh gọi API không cần thiết
                if (quantity !== itemInCart.quantity) {
                    await updateQuantity(product.id, quantity);
                    setActionMessage({ type: 'success', text: 'Đã cập nhật giỏ hàng!' });
                } else {
                    setActionMessage({ type: 'info', text: 'Số lượng không thay đổi.' });
                }
            } else {
                // Nếu chưa có, THÊM vào giỏ
                await addToCart(product.id, quantity);
                setActionMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng!' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra.';
            setActionMessage({ type: 'danger', text: errorMessage });
        } finally {
            setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
        }
    };


    // --- BƯỚC 4: HIỂN THỊ TRẠNG THÁI LOADING VÀ LỖI ---
    if (isLoading) {
        return (
            <div className="container text-center py-5" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" />
                <h2 className="mt-3">Đang tải chi tiết sản phẩm...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container text-center py-5">
                <h2>{error}</h2>
                <Link to="/products" className="btn btn-primary mt-3">
                    Quay lại trang sản phẩm
                </Link>
            </div>
        );
    }

    // Trường hợp product là null sau khi đã tải xong (hiếm khi xảy ra nếu có error handling)
    if (!product) {
        return null;
    }

    return (
        <>
            {/* Breadcrumb - Cập nhật để dùng dữ liệu từ API */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <ul className={cx('breadrumb')}>
                        <li className={cx('home')}>
                            <Link to="/">Trang chủ</Link>
                            <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                        </li>
                        {/* Kiểm tra xem sản phẩm có thông tin danh mục không */}
                        {product.category && (
                            <li className={cx('breadrumb-product-type')}>
                                <Link to={`/products/${product.category.id}`}>{product.category.name}</Link>
                                <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                            </li>
                        )}
                        <li className={cx('breadrumb-product-name')}>{product.name}</li>
                    </ul>
                </div>
            </div>

            {/* Product Details - Cập nhật để dùng dữ liệu từ API */}
            <div className={cx('product-container-box')}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-12">
                            <div className={cx('product-image-container')}>
                                {/* Sử dụng imageUrl từ API */}
                                <img src={product.imageUrl} alt={product.name} />
                            </div>
                        </div>
                        <div className="col-lg-7 col-md-12">
                            <div className={cx('product-detail')}>
                                <h1 className={cx('detail-name')}>{product.name}</h1>
                                <div className={cx('detail-price')}>
                                    {/* Chuyển đổi giá (string) từ API thành số trước khi định dạng */}
                                    {parseFloat(product.price).toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </div>
                                <div className={cx('detail-stock')}>
                                    <p>Số lượng tồn kho: {product.quantity}</p>
                                </div>
                                {actionMessage.text && (
                                    <Alert variant={actionMessage.type} className="mt-2 mb-3">
                                        {actionMessage.text}
                                    </Alert>
                                )}
                                <div className={cx('detail-quantity')}>
                                    <button type="button" className={cx('quantity-btn')} onClick={() => handleQuantityChange(-1)}>
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <input className={cx('quantity-input')} type="text" value={quantity} readOnly />
                                    <button type="button" className={cx('quantity-btn')} onClick={() => handleQuantityChange(1)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    {/* Vô hiệu hóa nút nếu hết hàng */}
                                    <button
                                        type="button"
                                        // Đổi class để có màu khác nếu là cập nhật
                                        className={cx('add-to-cart-btn', { 'update-cart-btn': isProductInCart })}
                                        onClick={handleCartAction}
                                        disabled={product.quantity === 0 || (isProductInCart && quantity === itemInCart.quantity)}
                                    >
                                        <FontAwesomeIcon icon={isProductInCart ? faSyncAlt : faCartPlus} className="me-2" />
                                        {product.quantity > 0
                                            ? (isProductInCart ? 'Cập nhật giỏ hàng' : 'Thêm vào giỏ hàng')
                                            : 'Hết hàng'
                                        }
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