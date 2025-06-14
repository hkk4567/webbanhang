// src/components/Layout/AdminLayout/components/AdminSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../AdminLayout.module.scss';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Sử dụng FontAwesome cho đẹp hơn
import { faTachometerAlt, faUsers, faBoxOpen, faMugHot, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


const cx = classNames.bind(styles);

function AdminSidebar() {
    const { adminLogout } = useAdminAuth();

    return (
        <div
            className={cx('offcanvas', 'offcanvas-start', 'sidebar-nav')}
            tabIndex="-1"
            id="adminSidebar"
            aria-labelledby="adminSidebarLabel"
        >
            {/* Sidebar Header */}
            <div className={cx('sidebar-header')}>
                <h5 className={cx('sidebar-title')} id="adminSidebarLabel">
                    Admin Panel
                </h5>
            </div>

            {/* Sidebar Body */}
            <div className="offcanvas-body p-0">
                <nav className="navbar-dark">
                    <ul className="navbar-nav">
                        {/* CORE Section */}
                        <li>
                            <div className={cx('sidebar-section-title')}>CORE</div>
                        </li>
                        <li>
                            {/* Dùng NavLink và gán activeClassName */}
                            <NavLink to="/admin/dashboard" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                                <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faTachometerAlt} /></span>
                                <span>Tổng quan</span>
                            </NavLink>
                        </li>

                        <li className="my-2"><hr className="dropdown-divider" /></li>

                        {/* MANAGEMENT Section */}
                        <li>
                            <div className={cx('sidebar-section-title')}>QUẢN LÝ</div>
                        </li>
                        <li>
                            {/* Trigger for Collapsible Menu */}
                            <a
                                className={cx('nav-link', 'submenu-toggle')}
                                data-bs-toggle="collapse"
                                href="#management-submenu"
                                role="button"
                                aria-expanded="false"
                                aria-controls="management-submenu"
                            >
                                <span className={cx('icon-wrapper')}><i className="bi bi-stack"></i></span>
                                <span>Chức năng</span>
                                <span className={cx('submenu-arrow')}><i className="bi bi-chevron-down"></i></span>
                            </a>
                            {/* Collapsible Submenu */}
                            <div className="collapse" id="management-submenu">
                                <ul className={cx('submenu')}>
                                    <li>
                                        <NavLink to="/admin/customers" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                                            <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faUsers} /></span>
                                            <span>Khách Hàng</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/admin/orders" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                                            <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faBoxOpen} /></span>
                                            <span>Đơn Hàng</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/admin/products" className={({ isActive }) => cx('nav-link', { active: isActive })}>
                                            <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faMugHot} /></span>
                                            <span>Sản phẩm</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="my-2"><hr className="dropdown-divider" /></li>

                        {/* Logout */}
                        <li>
                            <button onClick={adminLogout} className={cx('nav-link', 'logout-btn')}>
                                <span className={cx('icon-wrapper')}><FontAwesomeIcon icon={faSignOutAlt} /></span>
                                <span>Đăng xuất</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default AdminSidebar;