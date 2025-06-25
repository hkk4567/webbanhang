// src/components/Layout/AdminLayout/components/AdminHeader.js

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown, Button, Badge, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faBell, faUserCircle, faCogs, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './header.module.scss'; // Đổi tên file import nếu cần
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { getOrderNotificationsApi, markNotificationsAsReadApi } from '../../../../api/orderService';
const cx = classNames.bind(styles);

const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return Math.floor(seconds) + " giây trước";
};
const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
function AdminHeader({ onToggleSidebar }) {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const notifDropdownRef = useRef(null);
    const [isLoadingNotif, setIsLoadingNotif] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const handleLogout = () => {
        logout();
        // Sau khi admin đăng xuất, nên điều hướng về trang đăng nhập của admin
        navigate('/admin/login');
    };
    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoadingNotif(true);
            try {
                const response = await getOrderNotificationsApi();
                setNotifications(response.data.data.notifications);
            } catch (error) {
                console.error("Không thể tải thông báo:", error);
                // Có thể hiển thị lỗi cho người dùng
            } finally {
                setIsLoadingNotif(false);
            }
        };

        fetchNotifications();

        // (Nâng cao) Tự động làm mới thông báo sau mỗi 1 phút
        const intervalId = setInterval(fetchNotifications, 60000);

        // Dọn dẹp interval khi component unmount
        return () => clearInterval(intervalId);

    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setShowNotifDropdown(false);
            }
        }
        // Lắng nghe sự kiện mousedown
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Dọn dẹp listener khi component unmount
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const handleMarkAsRead = async () => {
        // Chỉ thực hiện nếu có thông báo chưa đọc
        if (notifications.length > 0) {
            try {
                // Gọi API để cập nhật CSDL
                await markNotificationsAsReadApi();
                // Cập nhật UI ngay lập tức
                setNotifications([]);
            } catch (error) {
                console.error("Lỗi khi đánh dấu đã đọc:", error);
                alert("Không thể đánh dấu đã đọc, vui lòng thử lại.");
            }
        }
        setShowNotifDropdown(false);
    };
    return (
        // Áp dụng các class utility của Bootstrap
        <Navbar
            fixed="top"
            bg="dark"
            variant="dark"
            className={cx('admin-header', 'shadow-sm', 'border-bottom', 'border-secondary')}
        >
            <Container fluid className="px-4">
                {/* Nút bật/tắt Sidebar */}
                <Button
                    variant="outline-secondary" // Dùng màu nhẹ hơn
                    onClick={onToggleSidebar}
                    className="d-lg-none me-3 border-0" // Bỏ viền cho đẹp
                >
                    <FontAwesomeIcon icon={faBars} />
                </Button>

                {/* Logo */}
                <Navbar.Brand as={Link} to="/admin/dashboard" className={cx('logo-wrapper')}>
                    <div className={cx('brand-logo-circle', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'rounded-circle')}>
                        <FontAwesomeIcon icon={faCoffee} className={cx('logo-icon')} />
                        <span className={cx('logo-text-inner')}>cafe</span>
                    </div>
                    {/* Sử dụng class utility của Bootstrap */}
                    <span className={cx('brand-text', 'ms-3', 'fw-semibold', 'd-none', 'd-sm-inline')}>CAFE ADMIN</span>
                </Navbar.Brand>

                {/* Các mục bên phải Header */}
                <Nav className="ms-auto d-flex flex-row align-items-center gap-3">
                    {/* Notification */}
                    <Dropdown
                        as={Nav.Item}
                        show={showNotifDropdown}
                        align="end"
                        ref={notifDropdownRef}
                    >
                        <Dropdown.Toggle
                            as="button"
                            className={cx('action-icon', 'position-relative', 'p-0')}
                            onClick={() => setShowNotifDropdown(prev => !prev)}
                        >
                            <FontAwesomeIcon icon={faBell} />
                            {notifications.length > 0 && (
                                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle border border-2 border-dark">
                                    {notifications.length}
                                </Badge>
                            )}
                        </Dropdown.Toggle>

                        <Dropdown.Menu className={cx('notificationDropdownMenu')} show={showNotifDropdown}>
                            <div className={cx('notificationHeader')}>
                                <h6 className={cx('headerTitle')}>Thông báo</h6>
                                <Button variant="link" size="sm" className={cx('markAsReadBtn')} onClick={handleMarkAsRead}>
                                    Đánh dấu đã đọc
                                </Button>
                            </div>

                            <div className={cx('notificationList')}>
                                {isLoadingNotif && notifications.length === 0 ? (
                                    <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>
                                ) : notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <Dropdown.Item
                                            key={notif.id}
                                            as={Link}
                                            to={`/admin/orders?search=${notif.id}`}
                                            className={cx('notificationItem')}
                                            onClick={() => setShowNotifDropdown(false)}
                                        >
                                            <div className={cx('itemTitle')}>Đơn hàng mới #{notif.id}</div>
                                            <small className={cx('itemMeta')}>
                                                Từ: {notif.shippingName} - {formatCurrency(notif.totalPrice)}
                                            </small>
                                            <div className={cx('itemTime')}>{timeSince(notif.created_at)}</div>
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <div className={cx('noNotifications')}>Không có thông báo mới.</div>
                                )}
                            </div>

                            <Dropdown.Item as={Link} to="/admin/orders?status=pending" className={cx('viewAllLink')} onClick={() => setShowNotifDropdown(false)}>
                                Xem tất cả đơn hàng chờ xử lý
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* User Dropdown */}
                    <Dropdown as={Nav.Item} align="end">
                        <Dropdown.Toggle as="button" className={cx('user-profile', 'action-icon', 'p-0')}>
                            <FontAwesomeIcon icon={faUserCircle} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className={cx('user-dropdown-menu')}>
                            <div className="text-center px-3 pt-2 pb-3">
                                <h6 className="mb-1 fw-bold">{admin ? admin.fullName : 'Admin User'}</h6>
                                <small className="text-muted">{admin ? admin.email : 'admin@example.com'}</small>
                            </div>
                            <Dropdown.Divider className="mx-2" />
                            {/* Sử dụng class custom đã định nghĩa */}
                            <Dropdown.Item as={Link} to="/admin/profile" className={cx('dropdown-item-custom')}>
                                <FontAwesomeIcon icon={faUserCircle} /> Hồ sơ
                            </Dropdown.Item>
                            <Dropdown.Item as={Link} to="/admin/settings" className={cx('dropdown-item-custom')}>
                                <FontAwesomeIcon icon={faCogs} /> Cài đặt
                            </Dropdown.Item>
                            <Dropdown.Divider className="mx-2" />
                            <Dropdown.Item as="button" onClick={handleLogout} className={cx('dropdown-item-logout')}>
                                <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default AdminHeader;