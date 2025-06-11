import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom'; // Nên dùng Link cho SPA để không tải lại trang

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faMugHot,
    faMagnifyingGlass,
    faCartShopping,
    faUser,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(styles);

function Header() {
    // === STATE MANAGEMENT ===
    // State quản lý việc header có được scroll hay không
    const [isScrolled, setIsScrolled] = useState(false);

    // State quản lý việc mở/đóng các menu
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);

    // Dữ liệu giả lập, trong ứng dụng thực tế sẽ lấy từ state/context
    const cartItemCount = 0;
    const isLoggedIn = false; // Thay đổi thành true để xem giao diện đã đăng nhập

    // === EFFECTS ===
    // Xử lý sự kiện scroll để thay đổi style của header
    useEffect(() => {
        const handleScroll = () => {
            // Nếu vị trí cuộn > 50px, đặt isScrolled thành true
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        // Dọn dẹp event listener khi component unmount để tránh rò rỉ bộ nhớ
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Mảng rỗng đảm bảo effect này chỉ chạy một lần khi component mount

    return (
        <header className={cx('header', { 'header--scroll': isScrolled })}>
            <div className="container h-100">
                {/* Sử dụng row, g-0 (no-gutters) và align-items-center của Bootstrap */}
                <div className="row g-0 h-100 align-items-center">

                    {/* 1. Mobile Menu Icon (Chỉ hiện trên tablet và mobile) */}
                    {/* d-lg-none: ẩn trên desktop. col-md-1 col-2: chiếm 1/12 trên tablet, 2/12 trên mobile */}
                    <div className="d-lg-none col-md-1 col-2">
                        <div className={cx('menu-icon')}>
                            <div className={cx('menu-active')} onClick={() => setMenuOpen(!isMenuOpen)}>
                                <FontAwesomeIcon icon={faBars} />
                            </div>
                            {/* Hiển thị dropdown dựa trên state 'isMenuOpen' */}
                            {isMenuOpen && (
                                <div className={cx('menu-icon-dropdown')}>
                                    <ul className={cx('menu-dropdown__list')}>
                                        {/* ... Các menu item ... */}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Logo */}
                    <div className="col-lg-1 col-md-9 col-8 d-flex justify-content-center">
                        <div className={cx('logo')}>
                            <Link to="/">
                                <div className={cx('logo-content')}></div>
                                {/* THAY THẾ Ở ĐÂY */}
                                <FontAwesomeIcon icon={faMugHot} className={cx('logo-icon')} />
                                <div className={cx('logo-text')}>cafe</div>
                            </Link>
                        </div>
                    </div>

                    {/* 3. Desktop Navigation (Chỉ hiện trên desktop) */}
                    <div className="d-none d-lg-block col-lg-9">
                        <div className={cx('nav')}>
                            <ul className={cx('nav__list')}>
                                <li className={cx('nav__item', 'nav__item--active')}>
                                    <Link to="/">Trang chủ</Link>
                                </li>
                                <li className={cx('nav__item')}>
                                    <Link to="/gioi-thieu">Giới thiệu</Link>
                                </li>
                                <li className={cx('nav__item', 'hidden-menu-active')}>
                                    <Link to="/Product">Sản phẩm</Link>
                                </li>
                                <li className={cx('nav__item')}>
                                    <Link to="/tin-tuc">Tin tức</Link>
                                </li>
                                <li className={cx('nav__item')}>
                                    <Link to="/lien-he">Liên hệ</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 4. Right Box (Search, Cart, User) */}
                    <div className="col-lg-2 col-md-2 col-2">
                        <div className={cx('right-box')}>

                            {/* Search */}
                            <div className={cx('search')}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} onClick={() => setSearchOpen(!isSearchOpen)} />
                                {isSearchOpen && (
                                    <div className={cx('search-input')}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                                            <input type="text" className={cx('search-input-text')} placeholder="Tìm kiếm..." />
                                        </div>
                                        <a href="./multiSreach.php">Tìm kiếm nâng cao</a>
                                    </div>
                                )}
                            </div>

                            {/* Cart (Dropdown vẫn dùng :hover từ SCSS) */}
                            <div className={cx('cart')}>
                                <Link to="/cart" style={{ color: 'white' }}>
                                    <FontAwesomeIcon icon={faCartShopping} />
                                </Link>
                                <span className={cx('cart-number')}>{cartItemCount}</span>
                                <div className={cx('dropdown-cart', { 'dropdown-cart-list--noItem': cartItemCount === 0 })}>
                                    <div className={cx('dropdown-cart-content')}>Không có sản phẩm nào.</div>
                                    <ul className={cx('dropdown-cart-list')}></ul>
                                    <div className={cx('dropdown-cart-footer')}>
                                        <div className={cx('dropdown-cart-total')}>Tổng tiền tạm tính:
                                            <span className={cx('dropdown-cart-price')}></span>
                                        </div>
                                        <div className={cx('dropdown-cart-pay')}>
                                            <a href="./signIn.php" className={cx('link-payMoney')}>Tiến hành thanh toán</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Icon */}
                            <div className={cx('user-icon')}>
                                <FontAwesomeIcon icon={faUser} onClick={() => setUserMenuOpen(!isUserMenuOpen)} />
                                {isUserMenuOpen && (
                                    <>
                                        {!isLoggedIn ? (
                                            <ul className={cx('dropdown-user')}>
                                                <li><Link to="/login">Đăng nhập</Link></li>
                                                <li><Link to="/register">Đăng ký</Link></li>
                                            </ul>
                                        ) : (
                                            <div className={cx('dropdown-user-info')}>
                                                <div className={cx('dropdown-user-info-name')}>Tên người dùng</div>
                                                <div className={cx('dropdown-user-info-email')}>Email người dùng</div>
                                                <div className={cx('dropdown-user-info-history')}><Link to="/history">Lịch sử mua hàng</Link></div>
                                                <div className={cx('dropdown-user-info-logout')}>
                                                    <FontAwesomeIcon icon={faRightFromBracket} /> Đăng xuất
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;