import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './RegisterPage.module.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

// --- API BASE URL ---
const API_BASE_URL = 'https://provinces.open-api.vn/api/';

function RegisterPage() {
    // --- STATE MANAGEMENT ---
    // State duy nhất để quản lý tất cả dữ liệu của form
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

    // State để quản lý lỗi validation
    const [errors, setErrors] = useState({});

    // State để lưu trữ danh sách lấy từ API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // State để quản lý trạng thái tải dữ liệu (cải thiện UX)
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);


    // --- API CALLS & SIDE EFFECTS ---
    // 1. Lấy danh sách Tỉnh/Thành phố khi component được render lần đầu
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch(API_BASE_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error('Failed to fetch provinces:', error);
            }
        };
        fetchProvinces();
    }, []); // Mảng rỗng `[]` đảm bảo useEffect này chỉ chạy một lần

    // 2. Lấy danh sách Quận/Huyện khi Tỉnh/Thành phố thay đổi
    useEffect(() => {
        if (formData.province) {
            const fetchDistricts = async () => {
                setIsLoadingDistricts(true);
                try {
                    const response = await fetch(`${API_BASE_URL}p/${formData.province}?depth=2`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    setDistricts(data.districts);
                } catch (error) {
                    console.error('Failed to fetch districts:', error);
                } finally {
                    setIsLoadingDistricts(false);
                }
            };
            fetchDistricts();
        } else {
            // Nếu không có tỉnh nào được chọn, reset danh sách huyện và xã
            setDistricts([]);
            setWards([]);
        }
    }, [formData.province]); // Chạy lại mỗi khi giá trị `formData.province` thay đổi

    // 3. Lấy danh sách Phường/Xã khi Quận/Huyện thay đổi
    useEffect(() => {
        if (formData.district) {
            const fetchWards = async () => {
                setIsLoadingWards(true);
                try {
                    const response = await fetch(`${API_BASE_URL}d/${formData.district}?depth=2`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    setWards(data.wards);
                } catch (error) {
                    console.error('Failed to fetch wards:', error);
                } finally {
                    setIsLoadingWards(false);
                }
            };
            fetchWards();
        } else {
            // Nếu không có quận/huyện nào được chọn, reset danh sách xã
            setWards([]);
        }
    }, [formData.district]); // Chạy lại mỗi khi giá trị `formData.district` thay đổi


    // --- EVENT HANDLERS ---
    // Hàm xử lý chung cho việc thay đổi giá trị của các input và select
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newState = { ...prev, [name]: value };
            // Reset các dropdown phụ thuộc khi dropdown cha thay đổi
            if (name === 'province') {
                newState.district = '';
                newState.ward = '';
            }
            if (name === 'district') {
                newState.ward = '';
            }
            return newState;
        });
    };

    // Hàm kiểm tra lỗi của form trước khi gửi
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

    // Hàm xử lý khi người dùng nhấn nút Đăng ký
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Lấy tên thay vì code để hiển thị
            const provinceName = provinces.find(p => p.code === Number(formData.province))?.name || '';
            const districtName = districts.find(d => d.code === Number(formData.district))?.name || '';
            const wardName = wards.find(w => w.code === Number(formData.ward))?.name || '';

            const finalData = {
                ...formData,
                province: provinceName,
                district: districtName,
                ward: wardName,
            }

            console.log('Form hợp lệ, gửi dữ liệu:', finalData);
            alert('Đăng ký thành công!');
            // Tại đây bạn sẽ gọi API để gửi dữ liệu lên server
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
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="province" className="form-label">Tỉnh/Thành phố:</label>
                                            <select id="province" name="province" className="form-select" onChange={handleChange} value={formData.province} required>
                                                <option value="">--Chọn tỉnh/thành phố--</option>
                                                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="district" className="form-label">Quận/Huyện:</label>
                                            <select id="district" name="district" className="form-select" onChange={handleChange} value={formData.district} disabled={!formData.province || isLoadingDistricts} required>
                                                <option value="">--Chọn quận/huyện--</option>
                                                {isLoadingDistricts && <option>Đang tải...</option>}
                                                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="ward" className="form-label">Phường/Xã:</label>
                                            <select id="ward" name="ward" className="form-select" onChange={handleChange} value={formData.ward} disabled={!formData.district || isLoadingWards} required>
                                                <option value="">--Chọn phường/xã--</option>
                                                {isLoadingWards && <option>Đang tải...</option>}
                                                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                            </select>
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