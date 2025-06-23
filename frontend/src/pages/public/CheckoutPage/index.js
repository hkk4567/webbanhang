import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CheckoutPage.module.scss';
import { Spinner, Alert } from 'react-bootstrap';

// Import các hook, component và API service
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import AddressSelector from '../../../components/common/AddressSelector';
import { createOrderApi } from '../../../api/orderService';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faMapMarkerAlt, faPlusCircle, faMoneyBill, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function CheckoutPage() {
    const { user, isLoggedIn } = useAuth();
    const { cartItems, totalPrice, totalItems, clearCart, isLoading: isCartLoading } = useCart();
    const navigate = useNavigate();

    // --- STATE CHO LOGIC CỦA TRANG ---
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', streetAddress: '',
        province: '', district: '', ward: '', note: ''
    });
    const [shippingOption, setShippingOption] = useState('default');
    const [paymentMethod, setPaymentMethod] = useState('COD');

    // State cho Modal và quá trình gửi API
    const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // --- EFFECT KIỂM TRA ĐĂNG NHẬP ---
    useEffect(() => {
        // Chỉ kiểm tra đăng nhập, không kiểm tra giỏ hàng ở đây
        if (!isCartLoading && !isLoggedIn) {
            navigate('/login', { state: { from: '/checkout' } });
        }
    }, [isLoggedIn, isCartLoading, navigate]);

    // --- EFFECT TỰ ĐỘNG ĐIỀN THÔNG TIN ---
    useEffect(() => {
        if (user) {
            const hasDefaultAddress = user.streetAddress && user.province && user.district && user.ward;
            setShippingOption(hasDefaultAddress ? 'default' : 'new');
            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
            }));
        }
    }, [user]);

    // --- CÁC HÀM HANDLER ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAddressChange = useCallback((addressData) => {
        setFormData(prev => ({
            ...prev,
            province: addressData.provinceName,
            district: addressData.districtName,
            ward: addressData.wardName,
        }));
    }, []);
    // Hàm này chỉ validate và mở Modal
    const handleSubmitOrder = (e) => {
        e.preventDefault();
        setApiError('');

        // Kiểm tra giỏ hàng ngay tại đây
        if (!cartItems || cartItems.length === 0) {
            alert('Giỏ hàng của bạn đang trống. Không thể đặt hàng.');
            navigate('/products');
            return;
        }

        // Validation form
        if (shippingOption === 'new' && (!formData.fullName || !formData.phone || !formData.streetAddress || !formData.ward)) {
            alert('Vui lòng điền đầy đủ thông tin cho địa chỉ giao hàng mới.');
            return;
        }
        setSummaryModalOpen(true);
    };

    // Hàm này được gọi từ Modal và sẽ thực hiện gọi API
    const handleCompleteOrder = async () => {
        setIsSubmitting(true);
        setApiError('');

        let finalShippingAddress;
        if (shippingOption === 'default') {
            finalShippingAddress = { fullName: user.fullName, phone: user.phone, street: user.streetAddress, ward: user.ward, district: user.district, province: user.province };
        } else {
            finalShippingAddress = { fullName: formData.fullName, phone: formData.phone, street: formData.streetAddress, ward: formData.ward, district: formData.district, province: formData.province };
        }
        const orderData = {
            shippingAddress: finalShippingAddress,
            paymentMethod,
            note: formData.note,
        };

        try {
            await createOrderApi(orderData);
            alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');

            // --- THAY ĐỔI QUAN TRỌNG ---
            // Thay vì fetchCart(), chúng ta gọi clearCart() từ context
            // Hàm clearCart() đã được tối ưu để chỉ dispatch action ở client
            await clearCart();

            // Đóng Modal và điều hướng
            setSummaryModalOpen(false);
            navigate('/history');

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            if (isMounted.current) {
                setApiError(errorMessage);
                setIsSubmitting(false);
            }
        }
    };

    const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    const shippingFee = 30000;
    const finalTotalPrice = totalPrice + shippingFee;

    if (isCartLoading || !isLoggedIn) {
        return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}><Spinner animation="border" /></div>;
    }

    return (
        <form onSubmit={handleSubmitOrder}>
            <div className="container-fluid">
                <div className="row">
                    {/* --- CỘT TRÁI: THÔNG TIN GIAO HÀNG VÀ THANH TOÁN --- */}
                    <div className={cx('left-column', 'col-lg-7', 'p-4', 'p-md-5')}>
                        <div className={cx('store-name')}>
                            <Link to="/products"><FontAwesomeIcon icon={faArrowLeft} /> <span className="ms-2">Tiếp tục mua sắm</span></Link>
                        </div>
                        <div className="row mt-4">
                            <div className="col-12">
                                <h3 className={cx('section-header')}>Thông tin nhận hàng</h3>
                                {user?.streetAddress && (
                                    <div className={cx('option-box', 'shipping-option', { active: shippingOption === 'default' })} onClick={() => setShippingOption('default')}>
                                        <div className="d-flex align-items-start">
                                            <input type="radio" name="shipping" checked={shippingOption === 'default'} readOnly className="me-3 mt-1" />
                                            <div>
                                                <div className="fw-bold"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />Sử dụng địa chỉ mặc định</div>
                                                <div className="text-muted small mt-1">{`${user.fullName} - ${user.phone}`}<br />{`${user.streetAddress}, ${user.ward}, ${user.district}, ${user.province}`}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className={cx('option-box', 'shipping-option', { active: shippingOption === 'new' })} onClick={() => setShippingOption('new')}>
                                    <div className="d-flex align-items-start">
                                        <input type="radio" name="shipping" checked={shippingOption === 'new'} readOnly className="me-3 mt-1" />
                                        <div className="fw-bold"><FontAwesomeIcon icon={faPlusCircle} className="me-2" />Giao đến địa chỉ khác</div>
                                    </div>
                                </div>
                                {shippingOption === 'new' && (
                                    <div className={cx('new-address-form', 'mt-3 p-3 border rounded')}>
                                        <div className="row">
                                            <div className="col-md-6 mb-2"><input type="text" name="fullName" className="form-control" placeholder="Họ và tên" value={formData.fullName} onChange={handleChange} required /></div>
                                            <div className="col-md-6 mb-2"><input type="tel" name="phone" className="form-control" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} required /></div>
                                        </div>
                                        <input type="email" name="email" className="form-control mb-2" placeholder="Email (tùy chọn)" value={formData.email} onChange={handleChange} />
                                        <input type="text" name="streetAddress" className="form-control mb-3" placeholder="Địa chỉ (số nhà, tên đường)" value={formData.streetAddress} onChange={handleChange} required />
                                        <AddressSelector onChange={handleAddressChange} layout="vertical" />
                                    </div>
                                )}
                            </div>
                            <div className="col-12 mt-4">
                                <h3 className={cx('section-header')}>Vận chuyển và Thanh toán</h3>
                                <div className={cx('option-box')}><div className="d-flex justify-content-between"><span><FontAwesomeIcon icon={faCircleDot} className="me-2 text-primary" /> Giao hàng tận nơi</span><strong>{formatCurrency(shippingFee)}</strong></div></div>
                                <div className={cx('option-box', 'payment-option', { active: paymentMethod === 'COD' })} onClick={() => setPaymentMethod('COD')}>
                                    <div className="d-flex justify-content-between align-items-center"><span><input type="radio" name="payment" checked={paymentMethod === 'COD'} readOnly className="me-2" />Thanh toán khi giao hàng (COD)</span><FontAwesomeIcon icon={faMoneyBill} /></div>
                                </div>
                                <textarea name="note" className="form-control mt-3" placeholder="Ghi chú cho đơn hàng (tùy chọn)" rows="3" value={formData.note} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
                    <div className={cx('right-column', 'col-lg-5', 'p-4', 'p-md-5', 'border-start')}>
                        <h3 className={cx('section-header')}>Đơn hàng ({totalItems} sản phẩm)</h3>
                        <div className={cx('product-list')}>
                            {cartItems.map(item => (
                                <div key={item.productId} className={cx('product-item')}>
                                    <div className={cx('product-image-wrapper')}><img src={item.imageUrl} alt={item.name} className={cx('product-image')} /><span className={cx('product-quantity-badge')}>{item.quantity}</span></div>
                                    <div className={cx('product-details')}><div className={cx('product-name')}>{item.name}</div></div>
                                    <div className={cx('product-price')}>{formatCurrency(Number(item.price) * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <div className={cx('price-summary')}>
                            <div className="d-flex justify-content-between mb-2"><span>Tạm tính</span><span>{formatCurrency(totalPrice)}</span></div>
                            <div className="d-flex justify-content-between"><span>Phí vận chuyển</span><span>{formatCurrency(shippingFee)}</span></div>
                        </div>
                        <hr />
                        <div className={cx('total-price')}><span className="fs-5">Tổng cộng</span><span className="fs-4 fw-bold">{formatCurrency(finalTotalPrice)}</span></div>
                        <div className="d-grid mt-4"><button type="submit" className="btn btn-primary btn-lg fw-bold">Đặt hàng</button></div>
                    </div>
                </div>
            </div>

            {/* --- MODAL TÓM TẮT ĐƠN HÀNG --- */}
            {isSummaryModalOpen && (
                <div className={cx('summary-orders')}>
                    <div className={cx('summary-orders-background')} onClick={() => !isSubmitting && setSummaryModalOpen(false)}></div>
                    <div className={cx('summary-orders-contents')}>
                        <button type="button" className={cx('summary-orders-close')} onClick={() => !isSubmitting && setSummaryModalOpen(false)} disabled={isSubmitting}><FontAwesomeIcon icon={faCircleXmark} /></button>
                        <h1>Tóm tắt đơn hàng</h1>
                        {apiError && <Alert variant="danger" className="mt-3">{apiError}</Alert>}
                        <div className={cx('order-content')}>
                            <p><strong>Khách hàng:</strong> {shippingOption === 'default' ? user.fullName : formData.fullName}</p>
                            <p><strong>Số điện thoại:</strong> {shippingOption === 'default' ? user.phone : formData.phone}</p>
                            <p><strong>Địa chỉ:</strong> {shippingOption === 'default' ? `${user.streetAddress}, ${user.ward}, ${user.district}, ${user.province}` : `${formData.streetAddress}, ${formData.ward}, ${formData.district}, ${formData.province}`}</p>
                            <p><strong>Phương thức thanh toán:</strong> {paymentMethod}</p>
                        </div>
                        <h4 className={cx('modal-section-header')}>Chi tiết sản phẩm</h4>
                        <div className={cx('modal-product-list')}>
                            {cartItems.map(item => (
                                <div key={item.productId} className={cx('modal-product-item')}><img src={item.imageUrl} alt={item.name} className={cx('modal-product-image')} /><div className={cx('modal-product-info')}><div className={cx('modal-product-name')}>{item.name}</div><div className={cx('modal-product-quantity')}>Số lượng: {item.quantity}</div></div><div className={cx('modal-product-price')}>{formatCurrency(Number(item.price) * item.quantity)}</div></div>
                            ))}
                        </div>
                        <div className={cx('total')}>
                            <div className="d-flex justify-content-between fs-5"><span>Tổng cộng</span><span className="fw-bold">{formatCurrency(finalTotalPrice)}</span></div>
                            <button className="btn btn-success w-100 mt-4" onClick={handleCompleteOrder} disabled={isSubmitting}>
                                {isSubmitting ? (<><Spinner as="span" animation="border" size="sm" /> <span className="ms-2">Đang xác nhận...</span></>) : ('Xác nhận và Hoàn tất')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

export default CheckoutPage;