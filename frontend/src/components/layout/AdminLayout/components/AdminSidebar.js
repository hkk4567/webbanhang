// src/components/Layout/AdminLayout/components/AdminSidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, Accordion, Offcanvas } from 'react-bootstrap'; // <-- Import các component chính
import classNames from 'classnames/bind';
import styles from './sidebar.module.scss'; // Đổi tên file scss cho nhất quán
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faUsers, faBoxOpen, faMugHot, faSignOutAlt, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

// Nhận props từ AdminLayout để điều khiển việc hiển thị
function AdminSidebar({ isMobileOpen, onHide }) {
    const { adminLogout } = useAdminAuth();
    const getNavLinkClass = ({ isActive }) => {
        // cx('nav-link') -> Luôn có class nav-link của module
        // { [styles.active]: isActive } -> Thêm class active của module NẾU isActive là true
        return cx('nav-link', { active: isActive });
    };
    // Nội dung của sidebar, có thể tái sử dụng
    const sidebarContent = (
        <Nav className="flex-column">
            {/* CORE Section */}
            <div className={cx('sidebar-section-title')}>CORE</div>

            {/* 🔥 THAY ĐỔI: Bỏ Nav.Item và thêm prop `end` */}
            <NavLink
                to="/admin/dashboard"
                className={getNavLinkClass}
                end // <-- Quan trọng!
            >
                <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faTachometerAlt} /></span>
                <span>Tổng quan</span>
            </NavLink>

            <hr className="dropdown-divider mx-3 my-2" />

            {/* MANAGEMENT Section - Sử dụng Accordion */}
            <div className={cx('sidebar-section-title')}>QUẢN LÝ</div>
            <Accordion flush className={cx('sidebar-accordion')}>
                <Accordion.Item eventKey="management-submenu" className={cx('accordion-item')}>
                    <Accordion.Header className={cx('submenu-toggle')}>
                        <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faLayerGroup} /></span>
                        <span className='ms-3'>Chức năng</span>
                    </Accordion.Header>
                    <Accordion.Body className={cx('submenu-body')}>
                        <Nav className="flex-column">
                            <NavLink to="/admin/customers" className={getNavLinkClass}>
                                <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faUsers} /></span>
                                <span>Khách Hàng</span>
                            </NavLink>
                            <NavLink to="/admin/orders" className={getNavLinkClass}>
                                <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faBoxOpen} /></span>
                                <span>Đơn Hàng</span>
                            </NavLink>
                            <NavLink to="/admin/products" className={getNavLinkClass}>
                                <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faMugHot} /></span>
                                <span>Sản phẩm</span>
                            </NavLink>
                        </Nav>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <hr className="dropdown-divider mx-3 my-2" />

            {/* Logout */}
            <Nav.Item>
                <Nav.Link as="button" onClick={adminLogout} className={cx('nav-link', 'logout-btn')}>
                    <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faSignOutAlt} /></span>
                    <span>Đăng xuất</span>
                </Nav.Link>
            </Nav.Item>
        </Nav>
    );

    return (
        <Offcanvas
            show={isMobileOpen}
            onHide={onHide}
            responsive="lg" // <-- Điểm mấu chốt: tự động chuyển đổi ở breakpoint 'lg' (992px)
            className={cx('sidebar-nav')}
            placement="start"
        >
            <Offcanvas.Header closeButton className="d-lg-none">
                <Offcanvas.Title><p className='text-white'>Menu</p></Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0 d-flex flex-column">
                <div className={cx('sidebar-header')}>
                    <h5 className={cx('sidebar-title')}>
                        Admin Panel
                    </h5>
                </div>
                <div className="flex-grow-1 overflow-auto">
                    {sidebarContent} {/* Tái sử dụng nội dung menu đã định nghĩa ở trên */}
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default AdminSidebar;