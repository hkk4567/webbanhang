import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './RegisterPage.module.scss';
import AddressSelector from '../../../components/common/AddressSelector';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function RegisterPage() {
    // State giờ đây chỉ cần quản lý dữ liệu của form
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        province: '', // Sẽ lưu code của tỉnh
        district: '', // Sẽ lưu code của huyện
        ward: '',     // Sẽ lưu code của xã
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

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
            province: addressData.city,
            district: addressData.district,
            ward: addressData.ward,
        }));
    };


    // Hàm validate (giữ nguyên)
    const validateForm = () => {
        let newErrors = {};
        if (!formData.name) newErrors.name = 'Vui lòng nhập họ và tên.';
        // Thêm các quy tắc validate khác cho phone, email, ...
        if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Hàm submit (giữ nguyên, nhưng không cần tìm tên nữa nếu bạn quyết định lưu code)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Không cần phải chuyển đổi gì nữa, formData đã chứa đúng tên
            console.log('Form hợp lệ, gửi dữ liệu:', formData);
            alert('Đăng ký thành công!');
        } else {
            console.log('Form có lỗi, vui lòng kiểm tra lại.');
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
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="name" className="form-label">Họ & tên:</label>
                                            <input type="text" id="name" name="name" placeholder="VD: Nguyen Van A" className="form-control" onChange={handleChange} required />
                                            {errors.name && <div className={cx('error-message')}>{errors.name}</div>}
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
                                            <label htmlFor="address" className="form-label">Địa chỉ (Số nhà, tên đường):</label>
                                            <input type="text" id="address" name="address" placeholder="VD: 123 Đường ABC" className="form-control" onChange={handleChange} required />
                                        </div>
                                        <div className="col-12">
                                            <AddressSelector onChange={handleAddressChange} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="password" className="form-label">Mật khẩu:</label>
                                            <input type="password" id="password" name="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" className="form-control" onChange={handleChange} required />
                                            {errors.password && <div className={cx('error-message')}>{errors.password}</div>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">Nhập lại mật khẩu:</label>
                                            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Nhập lại mật khẩu" className="form-control" onChange={handleChange} required />
                                            {errors.confirmPassword && <div className={cx('error-message')}>{errors.confirmPassword}</div>}
                                        </div>
                                        <div className="col-12 mt-3 text-center">
                                            <button type="submit" className="btn btn-primary px-5">Đăng ký</button>
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