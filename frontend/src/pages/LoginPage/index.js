import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './LoginPage.module.scss';
//sử lý login
import { useAuth } from '../../context/AuthContext';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function LoginPage() {
    // Sử dụng useState để quản lý trạng thái của form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth(); // Lấy hàm login từ context
    const navigate = useNavigate();
    // Hàm xử lý khi người dùng nhấn nút "Đăng nhập"
    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn form reload lại trang
        const userDataFromApi = {
            name: 'Nguyen Van A', // Lấy từ API
            email: email,        // Lấy từ API
        };

        login(userDataFromApi); // Truyền dữ liệu người dùng vào hàm login

        navigate('/', { replace: true });
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
                                    <Link to="/" >Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li>Đăng nhập tài khoản</li>
                            </ul>
                            <div className={cx('title-page')}>Đăng nhập tài khoản</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Sign-in Form */}
            <div className={cx('sign-in-main')}>
                <div className="container">
                    {/* Căn giữa form bằng mx-auto của Bootstrap */}
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-8 col-12">
                            <div className={cx('sign-in-content')}>
                                <h3 className="text-center mb-4">Đăng nhập tài khoản</h3>
                                <form onSubmit={handleSubmit}>
                                    {/* Sử dụng mb-3 của Bootstrap để tạo khoảng cách */}
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email:</label>
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="Nhập email của bạn"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label">Mật khẩu:</label>
                                        <input
                                            type="password"
                                            id="password"
                                            placeholder="Nhập mật khẩu"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <button type="submit" className="btn btn-primary me-3">
                                            Đăng nhập
                                        </button>
                                        <Link to="/register" className="btn btn-outline-primary">
                                            Đăng ký
                                        </Link>
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

export default LoginPage;