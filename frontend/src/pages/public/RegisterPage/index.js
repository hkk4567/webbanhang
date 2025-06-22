import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './RegisterPage.module.scss';
import AddressSelector from '../../../components/common/AddressSelector';
import { Spinner, Alert } from 'react-bootstrap'; // Import thêm

// --- BƯỚC 1: IMPORT HÀM API ĐĂNG KÝ ---
import { registerUser } from '../../../api/userService';
// (Tùy chọn) Import useAuth để tự động đăng nhập sau khi đăng ký thành công
import { useAuth } from '../../../context/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function RegisterPage() {
    // State giờ đây chỉ cần quản lý dữ liệu của form
    const [formData, setFormData] = useState({
        fullName: '', // Đổi 'name' thành 'fullName' để khớp với backend model
        phone: '',
        email: '',
        streetAddress: '', // Đổi 'address' thành 'streetAddress'
        province: '',
        district: '',
        ward: '',
        password: '',
        passwordConfirm: '', // Đổi 'confirmPassword' thành 'passwordConfirm'
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(''); // Lỗi từ API
    const [successMessage, setSuccessMessage] = useState(''); // Thông báo thành công

    const navigate = useNavigate();
    const { login } = useAuth();

    // --- EVENT HANDLERS ---
    // Hàm xử lý chung cho các input text
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- SỬA 4: HÀM CALLBACK ĐỂ NHẬN DỮ LIỆU TỪ AddressSelector ---
    const handleAddressChange = (addressData) => {
        setFormData(prev => ({
            ...prev,
            province: addressData.provinceName,
            district: addressData.districtName,
            ward: addressData.wardName,
        }));
    };


    // Hàm validate (giữ nguyên)
    const validateForm = () => {
        let newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ và tên.';
        // Thêm các quy tắc validate khác cho phone, email, ...
        if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }
        if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = 'Mật khẩu nhập lại không khớp.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Hàm submit (giữ nguyên, nhưng không cần tìm tên nữa nếu bạn quyết định lưu code)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccessMessage('');

        if (validateForm()) {
            setIsLoading(true);
            try {
                // Chuẩn bị dữ liệu gửi đi, có thể loại bỏ passwordConfirm
                const dataToSubmit = { ...formData };
                delete dataToSubmit.passwordConfirm;

                // Gọi API đăng ký
                await registerUser(dataToSubmit);

                setSuccessMessage('Đăng ký thành công! Đang tự động đăng nhập...');

                // Tự động đăng nhập cho người dùng
                await login(formData.email, formData.password);

                // Đợi một chút để người dùng đọc thông báo rồi mới chuyển trang
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
                setApiError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };


    return (
        <>
            {/* Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/">Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li>Đăng ký tài khoản</li>
                            </ul>
                            <div className={cx('title-page')}>Đăng ký tài khoản</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Sign-up Form */}
            <div className={cx('sign-up-main')}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10 col-12">
                            <div className={cx('form-wrapper')}>
                                <form id="sign-up-form" onSubmit={handleSubmit} noValidate>
                                    <h3 className={cx('form-title')}>Đăng ký tài khoản</h3>
                                    {apiError && <Alert variant="danger">{apiError}</Alert>}
                                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="name" className="form-label">Họ & tên:</label>
                                            <input type="text" id="fullName" name="fullName" placeholder="VD: Nguyen Van A" className="form-control" onChange={handleChange} required disabled={isLoading} />
                                            {errors.fullName && <div className={cx('error-message')}>{errors.fullName}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="phone" className="form-label">Số điện thoại:</label>
                                            <input type="tel" id="phone" name="phone" placeholder="VD: 09XXXXXXXX" className="form-control" onChange={handleChange} required />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label htmlFor="email" className="form-label">Email:</label>
                                            <input type="email" id="email" name="email" placeholder="Email" className="form-control" onChange={handleChange} required />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label htmlFor="streetAddress" className="form-label">Địa chỉ (Số nhà, tên đường):</label>
                                            <input type="text" id="streetAddress" name="streetAddress" placeholder="VD: 123 Đường ABC" className="form-control" onChange={handleChange} required disabled={isLoading} />
                                        </div>
                                        <div className="col-12">
                                            <AddressSelector onChange={handleAddressChange} disabled={isLoading} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="password" className="form-label">Mật khẩu:</label>
                                            <input type="password" id="password" name="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" className="form-control" onChange={handleChange} required />
                                            {errors.password && <div className={cx('error-message')}>{errors.password}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="passwordConfirm" className="form-label">Nhập lại mật khẩu:</label>
                                            <input type="password" id="passwordConfirm" name="passwordConfirm" placeholder="Nhập lại mật khẩu" className="form-control" onChange={handleChange} required disabled={isLoading} />
                                            {errors.passwordConfirm && <div className={cx('error-message')}>{errors.passwordConfirm}</div>}
                                        </div>
                                        <div className="col-12 mt-3 text-center">
                                            <button type="submit" className="btn btn-primary px-5" disabled={isLoading}>
                                                {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Đăng ký'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterPage;