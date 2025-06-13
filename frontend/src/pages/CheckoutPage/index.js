import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CheckoutPage.module.scss';

// Import các hook và dữ liệu cần thiết
import { useAuth } from '../../context/AuthContext'; // Để lấy thông tin người dùng đã đăng nhập
// import { useCart } from '../../context/CartContext'; // Trong tương lai, bạn sẽ lấy giỏ hàng từ context
import { mockAllProducts } from '../../data/products'; // Tạm thời dùng mock data

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Dòng code mới đã được sửa
import { faCircleDot, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faCcVisa } from '@fortawesome/free-brands-svg-icons';
// Import faMoneyBill từ gói SOLID
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(styles);
const API_BASE_URL = 'https://provinces.open-api.vn/api/';

// Giả lập giỏ hàng
const mockCart = [
    { ...mockAllProducts[0], quantity: 2 },
    { ...mockAllProducts[4], quantity: 1 },
];

function CheckoutPage() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [cartItems] = useState(mockCart);

    // State cho form thông tin
    const [formData, setFormData] = useState({
        email: user?.email || '',
        name: user?.name || '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        note: ''
    });

    // State cho các dropdown địa chỉ
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // State cho logic khác
    const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' hoặc 'BANK'
    const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);

    // --- TÍNH TOÁN GIÁ ---
    const shippingFee = 40000;
    const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);
    const totalPrice = subtotal + shippingFee;

    // --- LOGIC API ĐỊA CHỈ (Tương tự trang Đăng ký) ---
    useEffect(() => {
        const fetchProvinces = async () => {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();
            setProvinces(data);
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (formData.province) {
            const fetchDistricts = async () => {
                const response = await fetch(`${API_BASE_URL}p/${formData.province}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts);
                setWards([]);
            };
            fetchDistricts();
        }
    }, [formData.province]);

    useEffect(() => {
        if (formData.district) {
            const fetchWards = async () => {
                const response = await fetch(`${API_BASE_URL}d/${formData.district}?depth=2`);
                const data = await response.json();
                setWards(data.wards);
            };
            fetchWards();
        }
    }, [formData.district]);


    // --- HÀM XỬ LÝ ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Reset dropdown phụ thuộc
        if (name === 'province') setFormData(prev => ({ ...prev, district: '', ward: '' }));
        if (name === 'district') setFormData(prev => ({ ...prev, ward: '' }));
    };

    const handleSubmitOrder = (e) => {
        e.preventDefault();
        // Thêm logic validate form ở đây...
        console.log("Đơn hàng đã sẵn sàng để gửi đi:", { ...formData, cartItems, totalPrice });
        setSummaryModalOpen(true);
    };

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // Nếu chưa đăng nhập, điều hướng về trang login
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

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
                            {/* Thông tin nhận hàng */}
                            <div className="col-md-6">
                                <h3 className={cx('section-header')}>Thông tin nhận hàng</h3>
                                <div className={cx('fieldset')}>
                                    <input type="email" name="email" className="form-control mb-2" placeholder="Email" value={formData.email} onChange={handleChange} required />
                                    <input type="text" name="name" className="form-control mb-2" placeholder="Họ và tên" value={formData.name} onChange={handleChange} required />
                                    <input type="tel" name="phone" className="form-control mb-2" placeholder="Số điện thoại" onChange={handleChange} required />
                                    <input type="text" name="address" className="form-control mb-2" placeholder="Địa chỉ (số nhà, tên đường)" onChange={handleChange} required />
                                    <select name="province" className="form-select mb-2" value={formData.province} onChange={handleChange} required>
                                        <option value="">Chọn Tỉnh/Thành phố</option>
                                        {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                    </select>
                                    <select name="district" className="form-select mb-2" value={formData.district} onChange={handleChange} required disabled={!formData.province}>
                                        <option value="">Chọn Quận/Huyện</option>
                                        {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                    </select>
                                    <select name="ward" className="form-select mb-2" value={formData.ward} onChange={handleChange} required disabled={!formData.district}>
                                        <option value="">Chọn Phường/Xã</option>
                                        {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                    </select>
                                    <textarea name="note" className="form-control" placeholder="Ghi chú (tùy chọn)" rows="3" onChange={handleChange}></textarea>
                                </div>
                            </div>

                            {/* Vận chuyển và Thanh toán */}
                            <div className="col-md-6">
                                <h3 className={cx('section-header')}>Vận chuyển</h3>
                                <div className={cx('option-box')}>
                                    <div className="d-flex justify-content-between">
                                        <span><FontAwesomeIcon icon={faCircleDot} className="me-2 text-primary" /> Giao hàng tận nơi</span>
                                        <strong>{formatCurrency(shippingFee)}</strong>
                                    </div>
                                </div>
                                <h3 className={cx('section-header', 'mt-4')}>Thanh toán</h3>
                                <div className={cx('option-box', 'payment-option', { active: paymentMethod === 'COD' })} onClick={() => setPaymentMethod('COD')}>
                                    <div className="d-flex justify-content-between">
                                        <span><input type="radio" name="payment" checked={paymentMethod === 'COD'} readOnly /> Thanh toán khi giao hàng (COD)</span>
                                        <FontAwesomeIcon icon={faMoneyBill} />
                                    </div>
                                </div>
                                <div className={cx('option-box', 'payment-option', { active: paymentMethod === 'BANK' })} onClick={() => setPaymentMethod('BANK')}>
                                    <div className="d-flex justify-content-between">
                                        <span><input type="radio" name="payment" checked={paymentMethod === 'BANK'} readOnly /> Thanh toán bằng thẻ ngân hàng</span>
                                        <FontAwesomeIcon icon={faCcVisa} />
                                    </div>
                                    {paymentMethod === 'BANK' && (
                                        <div className={cx('bank-form', 'mt-3 pt-3 border-top')}>
                                            <p className="small text-muted">Chức năng đang được phát triển. Vui lòng chọn COD.</p>
                                            {/* Thêm form nhập thẻ ở đây nếu cần */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
                    <div className={cx('right-column', 'col-lg-5', 'p-5')}>
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
                                <span>Tạm tính</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Phí vận chuyển</span>
                                <span>{formatCurrency(shippingFee)}</span>
                            </div>
                        </div>
                        <div className={cx('total-price')}>
                            <span>Tổng cộng</span>
                            <span className="fs-4 fw-bold">{formatCurrency(totalPrice)}</span>
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
                        <div className={cx('order-content')}>
                            <p><strong>Khách hàng:</strong> {formData.name}</p>
                            <p><strong>Số điện thoại:</strong> {formData.phone}</p>
                            <p><strong>Địa chỉ:</strong>
                                {`${formData.address}, ${wards.find(w => w.code === Number(formData.ward))?.name}, 
                                    ${districts.find(d => d.code === Number(formData.district))?.name}, 
                                    ${provinces.find(p => p.code === Number(formData.province))?.name}`}
                            </p>
                            <p><strong>Phương thức thanh toán:</strong> {paymentMethod}</p>
                        </div>
                        <div className={cx('total')}>
                            <div className="d-flex justify-content-between fs-5">
                                <span>Tổng cộng</span>
                                <span className="fw-bold">{formatCurrency(totalPrice)}</span>
                            </div>
                            <button className="btn btn-success w-100 mt-4" onClick={() => alert('Đã xác nhận đơn hàng!')}>Xác nhận và Hoàn tất</button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}

export default CheckoutPage;