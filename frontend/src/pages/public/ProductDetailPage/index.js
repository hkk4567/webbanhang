import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductDetailPage.module.scss';
import { Spinner } from 'react-bootstrap'; // Import Spinner

// --- BƯỚC 1: IMPORT HÀM API MỚI ---
import { getProductById } from '../../../api/productService';
import { useCart } from '../../../context/CartContext';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faMinus, faPlus, faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare, faInstagram, faGooglePlusG, faPinterest } from '@fortawesome/free-brands-svg-icons';

const cx = classNames.bind(styles);

// Hàm slugify không cần thiết nữa vì chúng ta có categoryId từ API
// nhưng có thể giữ lại nếu bạn muốn dùng cho tên sản phẩm trên breadcrumb

function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart } = useCart();

    // --- BƯỚC 2: THÊM STATE ĐIỀU KHIỂN LOADING VÀ LỖI ---
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- BƯỚC 3: CẬP NHẬT useEffect ĐỂ GỌI API ---
    useEffect(() => {
        // Định nghĩa hàm async bên trong để gọi API
        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Gọi API với id từ URL
                const response = await getProductById(id);
                // Dữ liệu sản phẩm nằm trong response.data.data.product
                setProduct(response.data.data.product);
            } catch (err) {
                console.error('Failed to fetch product details:', err);
                setError('Không tìm thấy sản phẩm hoặc đã có lỗi xảy ra.');
            } finally {
                setIsLoading(false);
            }
        };

        // Chỉ gọi API nếu có id
        if (id) {
            fetchProduct();
        }

        // Reset số lượng mỗi khi chuyển sản phẩm
        setQuantity(1);

    }, [id]); // Dependency là 'id', mỗi khi id thay đổi, sẽ gọi lại API

    const handleQuantityChange = (amount) => {
        setQuantity(prevQuantity => {
            const newQuantity = prevQuantity + amount;
            // Ngăn số lượng giảm xuống dưới 1
            if (newQuantity < 1) return 1;
            // Ngăn số lượng vượt quá số lượng tồn kho
            if (product && newQuantity > product.quantity) {
                alert(`Số lượng tồn kho chỉ còn ${product.quantity} sản phẩm.`);
                return product.quantity;
            }
            return newQuantity;
        });
    };

    const handleAddToCart = () => {
        // --- BƯỚC KIỂM TRA QUAN TRỌNG NHẤT ---
        // Log ra để xem chính xác `product` là gì khi click
        console.log('Attempting to add to cart. Product object:', product);
        console.log('Selected quantity:', quantity);

        // Thêm điều kiện kiểm tra chặt chẽ
        if (product && product.id && quantity > 0) {
            addToCart(product.id, quantity);
            alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
        } else {
            // Nếu không thỏa mãn, log lỗi để biết lý do
            console.error("Không thể thêm vào giỏ hàng. Dữ liệu không hợp lệ:", { product, quantity });
            alert("Đã có lỗi xảy ra, không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
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
                                    {/* Vô hiệu hóa nút nếu hết hàng */}
                                    <button
                                        type="button"
                                        className={cx('add-to-cart-btn')}
                                        onClick={handleAddToCart}
                                        disabled={product.quantity === 0}
                                    >
                                        <FontAwesomeIcon icon={faCartPlus} className="me-2" />
                                        {product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
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