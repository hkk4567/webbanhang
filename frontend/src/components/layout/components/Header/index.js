import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CartItem from '../../../common/CartItem';
import {
    faBars,
    faMugHot,
    faMagnifyingGlass,
    faCartShopping,
    faUser,
    faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(styles);
const mockCartData = [
    {
        id: 2,
        name: 'Cà Phê Sữa Đá',
        price: 29000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1551030173-1a2952449856?auto=format&fit=crop&q=80&w=100',
    },
    {
        id: 7,
        name: 'Bánh Tiramisu',
        price: 55000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=100',
    }
];

// Hàm tiện ích để định dạng tiền tệ
const formatCurrency = (amount) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

function Header() {
    // === STATE MANAGEMENT ===
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);

    // --- THÊM STATE ĐỂ LƯU TỪ KHÓA TÌM KIẾM ---
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // Hook để điều hướng

    // Dữ liệu giả lập
    const { isLoggedIn, user, logout } = useAuth();
    const [cartItems, setCartItems] = useState(mockCartData);

    const cartItemCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);
    const totalPrice = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);

    // === EVENT HANDLERS FOR CART ===
    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
        } else {
            setCartItems(cartItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
        }
    };

    const handleRemoveItem = (itemId) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    // === EFFECTS ===
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // --- HÀM XỬ LÝ KHI SUBMIT FORM TÌM KIẾM ---
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Ngăn form tải lại trang
        if (searchTerm.trim()) {
            // Nếu có từ khóa, điều hướng đến trang search với query
            navigate(`/search?q=${searchTerm}`);
            // Đóng ô tìm kiếm sau khi submit
            setSearchOpen(false);
            // Xóa nội dung ô tìm kiếm
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        logout(); // Gọi hàm logout từ context
        setUserMenuOpen(false); // Đóng menu user
        navigate('/'); // Điều hướng về trang chủ
    };

    // Hàm đóng tất cả các menu con
    const closeAllMenus = () => {
        setMenuOpen(false);
        setSearchOpen(false);
        setUserMenuOpen(false);
    };

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
                                            <NavLink to="/product"
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
                                    <NavLink to="/product"
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
                                                autoFocus // Tự động focus vào ô input khi nó xuất hiện
                                            />
                                        </div>
                                        <Link to="/multiSearch">Tìm kiếm nâng cao</Link>
                                    </form>
                                )}
                            </div>

                            {/* Cart (Dropdown vẫn dùng :hover từ SCSS) */}
                            <div className={cx('cart')}>
                                <Link to="/cart" onClick={closeAllMenus} className={cx('cart-icon')}><FontAwesomeIcon icon={faCartShopping} /></Link>
                                {cartItemCount > 0 && <span className={cx('cart-number')}>{cartItemCount}</span>}

                                <div className={cx('dropdown-cart', { 'no-items': cartItemCount === 0 })}>
                                    {cartItemCount > 0 ? (
                                        <>
                                            <h4 className={cx('dropdown-cart-header')}>Giỏ hàng</h4>
                                            <ul className={cx('dropdown-cart-list')}>
                                                {/* --- SỬA 3: RENDER BẰNG COMPONENT CartItem --- */}
                                                {cartItems.map(item => (
                                                    <CartItem
                                                        key={item.id}
                                                        item={item}
                                                        onQuantityChange={handleQuantityChange}
                                                        onRemove={handleRemoveItem}
                                                    />
                                                ))}
                                            </ul>
                                            <div className={cx('dropdown-cart-footer')}>
                                                <div className={cx('dropdown-cart-total')}>
                                                    <span>Tổng cộng:</span>
                                                    <span className={cx('price-color')}>{formatCurrency(totalPrice)}</span>
                                                </div>
                                                <div className={cx('dropdown-cart-pay')}>
                                                    <Link to="/cart" className={cx('link-payMoney')} onClick={() => { /* đóng dropdown nếu cần */ }}>Xem giỏ hàng chi tiết</Link>
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
                                        {/* --- SỬA 4: SỬ DỤNG STATE isLoggedIn THẬT --- */}
                                        {!isLoggedIn ? (
                                            <ul className={cx('dropdown-user')}>
                                                <li><Link to="/login" onClick={() => setUserMenuOpen(false)}>Đăng nhập</Link></li>
                                                <li><Link to="/register" onClick={() => setUserMenuOpen(false)}>Đăng ký</Link></li>
                                            </ul>
                                        ) : (
                                            <div className={cx('dropdown-user-info')}>
                                                <div className={cx('dropdown-user-info-name')}>Xin chào, {user?.name || 'Bạn'}</div>
                                                <div className={cx('dropdown-user-info-email')}>{user?.email}</div>
                                                <div className={cx('dropdown-user-info-history')}>
                                                    <Link to="/history" onClick={() => setUserMenuOpen(false)}>Lịch sử mua hàng</Link>
                                                </div>
                                                {/* --- SỬA 5: THÊM onClick VÀO NÚT ĐĂNG XUẤT --- */}
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