// src/components/Layout/AdminLayout/components/AdminHeader.js
import React, { useState, useEffect, useRef } from 'react'; // Import thêm useState, useEffect, useRef
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../AdminLayout.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faBell, faUserCircle, faCogs, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../../../context/AdminAuthContext';

const cx = classNames.bind(styles);

function AdminHeader() {
    const { admin, adminLogout } = useAdminAuth();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null); // Ref để tham chiếu đến element dropdown

    // Hàm để bật/tắt dropdown
    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    // Xử lý việc click ra ngoài để đóng dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            // Nếu dropdown đang mở và người dùng click ra ngoài khu vực của dropdown (dropdownRef.current)
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        // Thêm event listener khi component được mount
        document.addEventListener('mousedown', handleClickOutside);

        // Dọn dẹp event listener khi component bị unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]); // Dependency là dropdownRef

    return (
        <nav className={cx('navbar', 'navbar-expand-lg', 'navbar-dark', 'fixed-top', 'admin-header')}>
            <div className="container-fluid">
                {/* === HEADER LEFT: Logo and Offcanvas Trigger === */}
                <div className={cx('header-left')}>
                    {/* Offcanvas Trigger */}
                    <button
                        className={cx('navbar-toggler', 'sidebar-toggler')}
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#adminSidebar"
                        aria-controls="adminSidebar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Logo Wrapper */}
                    <Link className={cx('logo-wrapper')} to="/admin/dashboard">
                        <div className={cx('brand-logo-circle')}>
                            <FontAwesomeIcon icon={faCoffee} className={cx('logo-icon')} />
                            <span className={cx('logo-text-inner')}>cafe</span>
                        </div>
                        <span className={cx('brand-text')}>CAFE ADMIN</span>
                    </Link>
                </div>

                {/* === HEADER RIGHT: Notifications, User Menu === */}
                <div className={cx('header-right')}>
                    <ul className={cx('navbar-nav', 'header-actions')}>
                        {/* Notification Item */}
                        <li className="nav-item">
                            <a className={cx('nav-link', 'action-icon')} href="#!">
                                <FontAwesomeIcon icon={faBell} />
                                <span className={cx('badge', 'rounded-pill', 'bg-danger', 'notification-badge')}>3</span>
                            </a>
                        </li>

                        {/* User Profile Dropdown (Đã được kiểm soát bởi React state) */}
                        <li className={cx('nav-item', 'dropdown')} ref={dropdownRef}>
                            <button // Thay <a> bằng <button> để đúng ngữ nghĩa hơn
                                className={cx('nav-link', 'dropdown-toggle', 'user-profile', 'action-icon')}
                                type="button" // Thêm type="button"
                                id="navbarDropdown"
                                onClick={toggleDropdown} // Sử dụng onClick của React
                                aria-expanded={isDropdownOpen} // Cập nhật aria-expanded
                            >
                                <FontAwesomeIcon icon={faUserCircle} />
                            </button>
                            <ul
                                className={cx('dropdown-menu', 'dropdown-menu-end', 'user-dropdown-menu', {
                                    show: isDropdownOpen, // Thêm class 'show' khi dropdown mở
                                })}
                                aria-labelledby="navbarDropdown"
                            >
                                <li className={cx('dropdown-header')}>
                                    <h6 className="mb-0">{admin ? admin.fullName : 'Admin User'}</h6>
                                    <span>{admin ? admin.email : 'admin@example.com'}</span>
                                </li>
                                <li><hr className={cx('dropdown-divider')} /></li>
                                <li>
                                    <Link className={cx('dropdown-item')} to="/admin/profile" onClick={() => setDropdownOpen(false)}>
                                        <FontAwesomeIcon icon={faUserCircle} />
                                        Hồ sơ
                                    </Link>
                                </li>
                                <li>
                                    <Link className={cx('dropdown-item')} to="/admin/settings" onClick={() => setDropdownOpen(false)}>
                                        <FontAwesomeIcon icon={faCogs} />
                                        Cài đặt
                                    </Link>
                                </li>
                                <li><hr className={cx('dropdown-divider')} /></li>
                                <li>
                                    <button className={cx('dropdown-item', 'dropdown-item-logout')} onClick={adminLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Đăng xuất
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default AdminHeader;