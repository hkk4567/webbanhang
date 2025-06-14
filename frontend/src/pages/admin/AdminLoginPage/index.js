import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AdminLoginPage.module.scss';
import { useAdminAuth } from '../../../context/AdminAuthContext';

const cx = classNames.bind(styles);

function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { adminLogin } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Xóa lỗi cũ

        // Gọi hàm login từ context
        const loginSuccess = adminLogin(password);

        if (loginSuccess) {
            // Nếu thành công, điều hướng đến trang dashboard của admin
            navigate('/admin/dashboard');
        } else {
            // Nếu thất bại, hiển thị thông báo lỗi
            setError('Mật khẩu không chính xác. Vui lòng thử lại.');
        }
    };

    return (
        <div className={cx('login-wrapper')}>
            <div className={cx('login-box')}>
                <h2 className={cx('title')}>Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Mật khẩu Admin:</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu của bạn"
                            required
                        />
                    </div>
                    {error && <div className={cx('error-message', 'alert', 'alert-danger')}>{error}</div>}
                    <button type="submit" className={cx('submit-btn', 'btn', 'btn-primary', 'w-100')}>
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLoginPage;