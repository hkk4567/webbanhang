import React, { useState, useEffect, useRef } from 'react'; // Import thêm useRef
import { Link, NavLink, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';

// Import các context
import { useCart } from '../../../../context/CartContext';
import { useAuth } from '../../../../context/AuthContext';
import CartItem from '../../../../components/common/CartItem';

// Import các thành phần UI
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faMugHot, faMagnifyingGlass, faCartShopping, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'react-bootstrap'; // Import Spinner để hiển thị loading giỏ hàng

const cx = classNames.bind(styles);
function Header() {
    // === STATE CỦA COMPONENT ===
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // === TẠO REF CHO CÁC DROPDOWN ===
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const cartRef = useRef(null);
    // === LẤY DỮ LIỆU TỪ CONTEXT ===
    const { user, isLoggedIn, logout } = useAuth();
    // Đổi tên `items` thành `cartItems` cho khớp với component
    const {
        cartItems,
        totalItems,
        totalPrice,
        updateQuantity,
        removeFromCart,
        isLoading: isCartLoading // Lấy trạng thái loading của giỏ hàng
    } = useCart();

    // === CÁC HÀM XỬ LÝ SỰ KIỆN ===
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // ===> THAY ĐỔI CỐT LÕI Ở ĐÂY
            // Đổi tên tham số từ 'q' thành 'search' để khớp với SearchResultsPage
            navigate(`/search?search=${encodeURIComponent(searchTerm.trim())}`);

            closeAllMenus();
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        logout();
        closeAllMenus();
        navigate('/');
    };

    // Hàm này được gọi khi click vào các link trong menu
    const closeAllMenus = () => {
        setMenuOpen(false);
        setSearchOpen(false);
        setUserMenuOpen(false);
        setCartOpen(false);
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            // Hiển thị thông báo lỗi từ server cho người dùng
            const errorMessage = error.response?.data?.message || 'Thao tác thất bại. Vui lòng thử lại.';
            alert(errorMessage); // Dùng alert() cho đơn giản, hoặc một thư viện toast
        }
    };

    const handleRemove = async (productId) => {
        try {
            await removeFromCart(productId);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa sản phẩm.';
            alert(errorMessage);
        }
    };

    // === CÁC EFFECT ===
    // Effect để đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setMenuOpen(false);
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setCartOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Effect theo dõi scroll (không đổi)
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
                    <div className="d-lg-none col-md-1 col-2" ref={mobileMenuRef}>
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
                            <div className={cx('search')} ref={searchRef}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} onClick={() => setSearchOpen(!isSearchOpen)} />
                                {isSearchOpen && (
                                    <div className={cx('search-dropdown')}>
                                        <form className={cx('search-form')} onSubmit={handleSearchSubmit}>
                                            <FontAwesomeIcon icon={faMagnifyingGlass} className={cx('search-form-icon')} />
                                            <input
                                                type="text"
                                                className={cx('search-form-input')}
                                                placeholder="Tìm sản phẩm..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                autoFocus
                                            />
                                        </form>
                                        <div className={cx('search-advanced')}>
                                            <Link to="/multisearch" onClick={closeAllMenus}>
                                                Tìm kiếm nâng cao
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cart (Sử dụng component CartDropdown) */}
                            <div className={cx('cart')} ref={cartRef}>
                                <div className={cx('cart-icon-wrapper')} onClick={() => setCartOpen(!isCartOpen)}>
                                    <FontAwesomeIcon icon={faCartShopping} />
                                </div>
                                {totalItems > 0 && <span className={cx('cart-number')}>{totalItems}</span>}
                                {isCartOpen && (
                                    <div className={cx('dropdown-cart', { 'no-items': !cartItems || cartItems.length === 0 })}>
                                        {isCartLoading ? (
                                            <div className={cx('cart-loading')}>
                                                <Spinner animation="border" size="sm" />
                                            </div>
                                        ) : cartItems && cartItems.length > 0 ? (
                                            <>
                                                <h4 className={cx('dropdown-cart-header')}>Sản phẩm đã thêm</h4>
                                                <ul className={cx('dropdown-cart-list')}>
                                                    {cartItems.map(item => (
                                                        <CartItem
                                                            key={item.productId}
                                                            item={item}
                                                            onQuantityChange={handleUpdateQuantity}
                                                            onRemove={handleRemove}
                                                        />
                                                    ))}
                                                </ul>
                                                <div className={cx('dropdown-cart-footer')}>
                                                    <div className={cx('dropdown-cart-total')}>
                                                        <span>Tổng cộng:</span>
                                                        <span className={cx('price-color')}>{formatCurrency(totalPrice)}</span>
                                                    </div>
                                                    <div className={cx('dropdown-cart-pay')}>
                                                        <Link to="/cart" className={cx('link-payMoney')} onClick={closeAllMenus}>Xem giỏ hàng</Link>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={cx('dropdown-cart-content')}>
                                                <p>Giỏ hàng của bạn đang trống.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User Icon */}
                            <div className={cx('user-icon')} ref={userMenuRef}>
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