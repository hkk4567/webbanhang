// src/components/Layout/AdminLayout/components/AdminHeader.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faBell, faUserCircle, faCogs, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './header.module.scss'; // Đổi tên file import nếu cần
import { useAdminAuth } from '../../../../context/AdminAuthContext';

const cx = classNames.bind(styles);

function AdminHeader({ onToggleSidebar }) {
    const { admin, adminLogout } = useAdminAuth();

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
                    <Nav.Link href="#!" className={cx('action-icon', 'position-relative', 'p-0', 'd-flex', 'align-items-center', 'justify-content-center')} style={{ width: '42px', height: '42px' }}>
                        <FontAwesomeIcon icon={faBell} />
                        <Badge
                            pill
                            bg="danger"
                            className="position-absolute top-0 start-100 translate-middle border border-2 border-dark"
                        >
                            3
                        </Badge>
                    </Nav.Link>

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
                            <Dropdown.Item as="button" onClick={adminLogout} className={cx('dropdown-item-logout')}>
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