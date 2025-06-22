import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './LoginPage.module.scss';
//sử lý login
import { useAuth } from '../../../context/AuthContext';
import { Spinner } from 'react-bootstrap';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function LoginPage() {
    // Sử dụng useState để quản lý trạng thái của form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth(); // Lấy hàm login từ context
    const navigate = useNavigate();
    // Hàm xử lý khi người dùng nhấn nút "Đăng nhập"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn form reload lại trang

        // Reset lỗi cũ và bắt đầu trạng thái loading
        setError(null);
        setIsLoading(true);

        try {
            // Gọi hàm login từ context với email và password từ form
            // Hàm login trong context đã là async, nên chúng ta dùng await
            await login(email, password);

            // Nếu không có lỗi, điều hướng người dùng về trang chủ
            navigate('/', { replace: true });

        } catch (err) {
            // Nếu có lỗi từ API (ví dụ: sai mật khẩu, tài khoản không tồn tại)
            // Lỗi sẽ được bắt ở đây
            const errorMessage = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.';
            setError(errorMessage);
            console.error("Lỗi đăng nhập:", err);
        } finally {
            // Dù thành công hay thất bại, cũng phải dừng trạng thái loading
            setIsLoading(false);
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
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
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
                                            disabled={isLoading}
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
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <button type="submit" className="btn btn-primary me-3" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                'Đăng nhập'
                                            )}
                                        </button>
                                        <Link to="/register" className={cx('btn btn-outline-primary', { 'disabled': isLoading })}>
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