import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link, NavLink, useNavigate } from 'react-router-dom';

// Import các context
import { useCart } from '../../../../context/CartContext';
import { useAuth } from '../../../../context/AuthContext';// Dùng chung context admin cho user hoặc tạo AuthContext riêng
import CartItem from '../../../../components/common/CartItem';
// Import các thành phần UI
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faMugHot, faMagnifyingGlass, faCartShopping, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
function Header() {
    // === STATE CỦA COMPONENT ===
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // === LẤY DỮ LIỆU TỪ CONTEXT ===
    // Dùng đúng tên biến từ Auth context
    const { user, isLoggedIn, logout } = useAuth();
    // Dùng đúng tên biến từ Cart context
    const { items: cartItems, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();

    // === CÁC HÀM XỬ LÝ SỰ KIỆN ===
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchOpen(false);
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const closeAllMenus = () => {
        setMenuOpen(false);
        setSearchOpen(false);
        setUserMenuOpen(false);
    };

    // === EFFECT ĐỂ THEO DÕI SCROLL ===
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
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
                                        <li className={cx('menu-dropdown__item')}>
                                            <NavLink to="/"
                                                className={({ isActive }) => cx('nav__link', { active: isActive })}
                                                onClick={closeAllMenus}>
                                                Trang chủ
                                            </NavLink>
                                        </li>
                                        <li className={cx('menu-dropdown__item')}>
                                            <NavLink to="/aboutus"
                                                className={({ isActive }) => cx('nav__link', { active: isActive })}
                                                onClick={closeAllMenus}>
                                                Giới thiệu
                                            </NavLink>
                                        </li>
                                        <li className={cx('menu-dropdown__item')}>
                                            <NavLink to="/products"
                                                className={({ isActive }) => cx('nav__link', { active: isActive })}
                                                onClick={closeAllMenus}>
                                                Sản phẩm
                                            </NavLink>
                                        </li>
                                        <li className={cx('menu-dropdown__item')}>
                                            <NavLink to="/newspage"
                                                className={({ isActive }) => cx('nav__link', { active: isActive })}
                                                onClick={closeAllMenus}>
                                                Tin tức
                                            </NavLink>
                                        </li>
                                        <li className={cx('menu-dropdown__item')}>
                                            <NavLink to="/contactpage"
                                                className={({ isActive }) => cx('nav__link', { active: isActive })}
                                                onClick={closeAllMenus}>
                                                Liên hệ
                                            </NavLink>
                                        </li>
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
                                <li className={cx('nav__item')}>
                                    <NavLink to="/"
                                        className={({ isActive }) => cx('nav__link', { active: isActive })}
                                        onClick={closeAllMenus}>
                                        Trang chủ
                                    </NavLink>
                                </li>
                                <li className={cx('nav__item')}>
                                    <NavLink to="/aboutus"
                                        className={({ isActive }) => cx('nav__link', { active: isActive })}
                                        onClick={closeAllMenus}>
                                        Giới thiệu
                                    </NavLink>
                                </li>
                                <li className={cx('nav__item')}>
                                    <NavLink to="/products"
                                        className={({ isActive }) => cx('nav__link', { active: isActive })}
                                        onClick={closeAllMenus}>
                                        Sản phẩm
                                    </NavLink>
                                </li>
                                <li className={cx('nav__item')}>
                                    <NavLink to="/newspage"
                                        className={({ isActive }) => cx('nav__link', { active: isActive })}
                                        onClick={closeAllMenus}>
                                        Tin tức
                                    </NavLink>
                                </li>
                                <li className={cx('nav__item')}>
                                    <NavLink to="/contactpage"
                                        className={({ isActive }) => cx('nav__link', { active: isActive })}
                                        onClick={closeAllMenus}>
                                        Liên hệ
                                    </NavLink>
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
                                    <form className={cx('search-input')} onSubmit={handleSearchSubmit}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                                            <input
                                                type="text"
                                                className={cx('search-input-text')}
                                                placeholder="Tìm kiếm..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Cart (Sử dụng component CartDropdown) */}
                            <div className={cx('cart')}>
                                <Link to="/cart" onClick={closeAllMenus} className={cx('cart-icon')}>
                                    <FontAwesomeIcon icon={faCartShopping} />
                                </Link>
                                {totalItems > 0 && <span className={cx('cart-number')}>{totalItems}</span>}

                                <div className={cx('dropdown-cart', { 'no-items': !cartItems || cartItems.length === 0 })}>
                                    {cartItems && cartItems.length > 0 ? (
                                        <>
                                            <h4 className={cx('dropdown-cart-header')}>Sản phẩm đã thêm</h4>
                                            <ul className={cx('dropdown-cart-list')}>
                                                {/* Vòng lặp để render các CartItem */}
                                                {cartItems.map(item => (
                                                    <CartItem
                                                        // Sửa key thành productId để đảm bảo là duy nhất
                                                        key={item.productId}
                                                        item={item}
                                                        // Truyền các hàm xử lý xuống props
                                                        onQuantityChange={updateQuantity}
                                                        onRemove={removeFromCart}
                                                    />
                                                ))}
                                            </ul>
                                            <div className={cx('dropdown-cart-footer')}>
                                                <div className={cx('dropdown-cart-total')}>
                                                    <span>Tổng cộng:</span>
                                                    <span className={cx('price-color')}>{formatCurrency(totalPrice)}</span>
                                                </div>
                                                <div className={cx('dropdown-cart-pay')}>
                                                    <Link to="/cart" className={cx('link-payMoney')}>Xem giỏ hàng</Link>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className={cx('dropdown-cart-content')}>
                                            <p>Giỏ hàng của bạn đang trống.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Icon */}
                            <div className={cx('user-icon')}>
                                <FontAwesomeIcon icon={faUser} onClick={() => setUserMenuOpen(!isUserMenuOpen)} />
                                {isUserMenuOpen && (
                                    <>
                                        {!isLoggedIn ? (
                                            <ul className={cx('dropdown-user')}>
                                                <li><Link to="/login" onClick={closeAllMenus}>Đăng nhập</Link></li>
                                                <li><Link to="/register" onClick={closeAllMenus}>Đăng ký</Link></li>
                                            </ul>
                                        ) : (
                                            <div className={cx('dropdown-user-info')}>
                                                <div className={cx('dropdown-user-info-name')}>Xin chào, {user?.fullName || 'Bạn'}</div>
                                                <div className={cx('dropdown-user-info-email')}>{user?.email}</div>
                                                <div className={cx('dropdown-user-info-history')}>
                                                    <Link to="/history" onClick={closeAllMenus}>Lịch sử mua hàng</Link>
                                                </div>
                                                <div className={cx('dropdown-user-info-logout')} onClick={handleLogout}>
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