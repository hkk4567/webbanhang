import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CheckoutPage.module.scss';

// Import các hook và component
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import AddressSelector from '../../../components/common/AddressSelector'; // <-- THAY ĐỔI 1: Import component mới

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faCcVisa } from '@fortawesome/free-brands-svg-icons';
import { faMoneyBill, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function CheckoutPage() {
    const { user, isLoggedIn } = useAuth();
    const { cartItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    // State cho form thông tin
    const [formData, setFormData] = useState({
        email: user?.email || '',
        name: user?.name || '',
        phone: '',
        address: '',
        // <-- THAY ĐỔI 2: Lưu tên tỉnh/huyện/xã thay vì code
        city: '',
        district: '',
        ward: '',
        note: ''
    });
    // State cho logic khác
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);

    // --- TÍNH TOÁN GIÁ ---
    const shippingFee = 40000;
    const finalTotalPrice = totalPrice + shippingFee;

    // --- HÀM XỬ LÝ ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // <-- THAY ĐỔI 3: Hàm nhận dữ liệu từ AddressSelector
    const handleAddressChange = (addressData) => {
        // addressData là object { city: 'Tên TP', district: 'Tên QH', ward: 'Tên PX' }
        setFormData(prev => ({
            ...prev,
            city: addressData.city,
            district: addressData.district,
            ward: addressData.ward,
        }));
    };

    const handleSubmitOrder = (e) => {
        e.preventDefault();
        // Validation vẫn giữ nguyên
        if (!formData.name || !formData.phone || !formData.address || !formData.ward) {
            alert('Vui lòng điền đầy đủ thông tin nhận hàng.');
            return;
        }
        console.log("Đơn hàng đã sẵn sàng để gửi đi:", { ...formData, cartItems, finalTotalPrice });
        setSummaryModalOpen(true);
    };

    const handleCompleteOrder = () => {
        alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
        clearCart();
        navigate('/');
    };

    const formatCurrency = (amount) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        } else if (cartItems.length === 0) {
            alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm để thanh toán.');
            navigate('/product');
        }
    }, [isLoggedIn, cartItems, navigate]);

    return (
        <form onSubmit={handleSubmitOrder}>
            <div className="container-fluid">
                <div className="row">
                    {/* --- CỘT TRÁI: THÔNG TIN GIAO HÀNG VÀ THANH TOÁN --- */}
                    <div className={cx('left-column', 'col-lg-7', 'p-5')}>
                        <div className={cx('store-name')}>
                            <Link to="/">
                                <FontAwesomeIcon icon={faArrowLeft} />
                                <span>Trở về trang chủ</span>
                            </Link>
                        </div>

                        <div className="row mt-4">
                            {/* CỘT TRÁI: Thông tin nhận hàng */}
                            <div className="col-md-6">
                                <h3 className={cx('section-header')}>Thông tin nhận hàng</h3>
                                <div className={cx('fieldset')}>
                                    <input type="email" name="email" className="form-control mb-2" placeholder="Email" value={formData.email} onChange={handleChange} required />
                                    <input type="text" name="name" className="form-control mb-2" placeholder="Họ và tên" value={formData.name} onChange={handleChange} required />
                                    <input type="tel" name="phone" className="form-control mb-2" placeholder="Số điện thoại" onChange={handleChange} required />
                                    <input type="text" name="address" className="form-control mb-3" placeholder="Địa chỉ (số nhà, tên đường)" onChange={handleChange} required />

                                    {/* Component chọn địa chỉ */}
                                    <AddressSelector onChange={handleAddressChange} layout="vertical" />

                                    <textarea name="note" className="form-control mt-3" placeholder="Ghi chú (tùy chọn)" rows="3" onChange={handleChange}></textarea>
                                </div>
                            </div>

                            {/* CỘT PHẢI: Vận chuyển và Thanh toán */}
                            <div className="col-md-6">
                                {/* Phần Vận chuyển */}
                                <h3 className={cx('section-header')}>Vận chuyển</h3>
                                <div className={cx('option-box')}>
                                    <div className="d-flex justify-content-between">
                                        <span><FontAwesomeIcon icon={faCircleDot} className="me-2 text-primary" /> Giao hàng tận nơi</span>
                                        <strong>{formatCurrency(shippingFee)}</strong>
                                    </div>
                                </div>

                                {/* Phần Thanh toán */}
                                <h3 className={cx('section-header', 'mt-4')}>Thanh toán</h3>
                                <div className={cx('option-box', 'payment-option', { active: paymentMethod === 'COD' })} onClick={() => setPaymentMethod('COD')}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span><input type="radio" name="payment" checked={paymentMethod === 'COD'} readOnly className="me-2" />Thanh toán khi giao hàng (COD)</span>
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    </div>
                                </div>
                                <div className={cx('option-box', 'payment-option', { active: paymentMethod === 'BANK' })} onClick={() => setPaymentMethod('BANK')}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span><input type="radio" name="payment" checked={paymentMethod === 'BANK'} readOnly className="me-2" />Thanh toán bằng thẻ ngân hàng</span>
                                        <FontAwesomeIcon icon={faCcVisa} />
                                    </div>
                                    {paymentMethod === 'BANK' && (
                                        <div className={cx('bank-form', 'mt-3 pt-3 border-top')}>
                                            <p className="small text-muted">Chức năng đang được phát triển. Vui lòng chọn COD.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (Không thay đổi) --- */}
                    <div className={cx('right-column', 'col-lg-5', 'p-5')}>
                        {/* ... nội dung cột phải giữ nguyên ... */}
                        <h3 className={cx('section-header')}>Đơn hàng ({cartItems.length} sản phẩm)</h3>
                        <div className={cx('product-list')}>
                            {cartItems.map(item => (
                                <div key={item.id} className={cx('product-item')}>
                                    <img src={item.image} alt={item.name} className={cx('product-image')} />
                                    <div className={cx('product-details')}>
                                        <div className={cx('product-name')}>{item.name}</div>
                                        <div className={cx('product-quantity')}>Số lượng: {item.quantity}</div>
                                    </div>
                                    <div className={cx('product-price')}>{formatCurrency(item.price * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                        <div className={cx('discount-code')}>
                            <input type="text" className="form-control" placeholder="Nhập mã giảm giá" />
                            <button type="button" className="btn btn-secondary">Áp dụng</button>
                        </div>
                        <div className={cx('price-summary')}>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tạm tính___</span>
                                <span>{formatCurrency(totalPrice)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Phí vận chuyển___</span>
                                <span>{formatCurrency(shippingFee)}</span>
                            </div>
                        </div>
                        <div className={cx('total-price')}>
                            <span>Tổng cộng</span>
                            <span className="fs-4 fw-bold">{formatCurrency(finalTotalPrice)}</span>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mt-4">Đặt hàng</button>
                    </div>
                </div>
            </div>

            {/* --- MODAL TÓM TẮT ĐƠN HÀNG --- */}
            {isSummaryModalOpen && (
                <div className={cx('summary-orders')}>
                    <div className={cx('summary-orders-background')} onClick={() => setSummaryModalOpen(false)}></div>
                    <div className={cx('summary-orders-contents')}>
                        <button type="button" className={cx('summary-orders-close')} onClick={() => setSummaryModalOpen(false)}>
                            <FontAwesomeIcon icon={faCircleXmark} />
                        </button>
                        <h1>Tóm tắt đơn hàng</h1>

                        {/* Thông tin người nhận */}
                        <div className={cx('order-content')}>
                            <p><strong>Khách hàng:</strong> {formData.name}</p>
                            <p><strong>Số điện thoại:</strong> {formData.phone}</p>
                            {/* <-- THAY ĐỔI 5: Hiển thị địa chỉ từ formData trực tiếp */}
                            <p><strong>Địa chỉ:</strong> {`${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`}</p>
                            <p><strong>Phương thức thanh toán:</strong> {paymentMethod}</p>
                        </div>

                        {/* Chi tiết sản phẩm */}
                        <h4 className={cx('modal-section-header')}>Chi tiết sản phẩm</h4>
                        <div className={cx('modal-product-list')}>
                            {cartItems.map(item => (
                                <div key={item.id} className={cx('modal-product-item')}>
                                    <img src={item.image} alt={item.name} className={cx('modal-product-image')} />
                                    <div className={cx('modal-product-info')}>
                                        <div className={cx('modal-product-name')}>{item.name}</div>
                                        <div className={cx('modal-product-quantity')}>Số lượng: {item.quantity}</div>
                                    </div>
                                    <div className={cx('modal-product-price')}>
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tổng tiền và nút xác nhận */}
                        <div className={cx('total')}>
                            <div className="d-flex justify-content-between fs-5">
                                <span>Tổng cộng</span>
                                <span className="fw-bold">{formatCurrency(finalTotalPrice)}</span>
                            </div>
                            <button className="btn btn-success w-100 mt-4" onClick={handleCompleteOrder}>Xác nhận và Hoàn tất</button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

export default CheckoutPage;