import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Form, InputGroup, Button, Spinner } from 'react-bootstrap'; // Import thêm các component cần thiết
import styles from './AdminLoginPage.module.scss';
import { useAdminAuth } from '../../../context/AdminAuthContext';

const cx = classNames.bind(styles);

function AdminLoginPage() {
    // Sử dụng state object để quản lý cả email và mật khẩu
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State cho trạng thái loading
    const [showPassword, setShowPassword] = useState(false); // State để hiện/ẩn mật khẩu

    const { adminLogin } = useAdminAuth();
    const navigate = useNavigate();

    // Hàm xử lý chung cho các ô input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Bây giờ adminLogin là một hàm async thực sự
            // Nó sẽ trả về user data nếu thành công, hoặc ném ra lỗi nếu thất bại
            await adminLogin(credentials.email, credentials.password);

            // Nếu không có lỗi nào được ném ra, điều hướng đến dashboard
            navigate('/admin/dashboard');

        } catch (err) {
            // Xử lý các loại lỗi khác nhau
            if (err.name === 'AuthorizationError') {
                // Lỗi phân quyền do context ném ra
                setError(err.message);
            } else if (err.response && err.response.data) {
                // Lỗi từ API của axios (ví dụ: 401 Unauthorized, 400 Bad Request)
                setError(err.response.data.message || 'Email hoặc mật khẩu không chính xác.');
            } else {
                // Các lỗi mạng khác
                setError('Đã xảy ra lỗi mạng. Vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('login-wrapper')}>
            <div className={cx('login-box')}>
                <div className={cx('logo')}>
                    <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h2 className={cx('title')}>Trang Quản trị</h2>
                <p className={cx('subtitle')}>Đăng nhập để tiếp tục</p>

                <Form onSubmit={handleSubmit}>
                    <InputGroup className="mb-3">
                        <InputGroup.Text><i className="bi bi-envelope-fill"></i></InputGroup.Text>
                        <Form.Control
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            disabled={isLoading}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Text><i className="bi bi-key-fill"></i></InputGroup.Text>
                        <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                            required
                            disabled={isLoading}
                        />
                        <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} className={cx('password-toggle')}>
                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </Button>
                    </InputGroup>

                    {error && <div className={cx('error-message', 'alert', 'alert-danger')}>{error}</div>}

                    <Button type="submit" className={cx('submit-btn')} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                <span className="ms-2">Đang xử lý...</span>
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default AdminLoginPage;