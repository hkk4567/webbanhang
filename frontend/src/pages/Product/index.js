import React from 'react';
import { Link } from 'react-router-dom'; // Import Link để điều hướng
import classNames from 'classnames/bind';
import styles from '../Main.module.scss';
import ProductCard from '../../components/common/ProductCard'; // Import component
import { mockAllProducts } from '../../data/products'; // Import dữ liệu giả

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleRight,
    faTableCells,
    faList,
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
// Khởi tạo hàm cx để sử dụng CSS Modules
const cx = classNames.bind(styles);

function Product() {
    // --- Các hàm xử lý sự kiện mẫu ---
    // Bạn sẽ thay thế logic bên trong bằng logic thật của ứng dụng
    const handleCategoryFilter = (category) => {
        console.log(`Đang lọc sản phẩm theo danh mục: ${category}`);
        // Ví dụ: setFilterState({ ...filterState, category: category });
    };

    const handlePagination = (direction) => {
        console.log(`Chuyển trang: ${direction}`);
        // Ví dụ: setCurrentPage(currentPage + (direction === 'next' ? 1 : -1));
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    {/* SỬA 1: Dùng Link của React Router cho điều hướng */}
                                    <Link to="/" >Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className={cx('icon-spacing')} />
                                </li>
                                <li className={cx('breadrumb-title-page')} style={{ textTransform: 'capitalize' }}>
                                    Tất cả sản phẩm
                                </li>
                            </ul>
                            <div className={cx('title-page')}>Tất cả sản phẩm</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={cx('search-main')}>
                <div className="container">
                    <div className="row">
                        {/* Sidebar: Danh mục & Bộ lọc */}
                        <div className={cx('Category-container', 'col-lg-3', 'd-none', 'd-lg-block')}>
                            {/* Danh mục */}
                            <div className={cx('Category')}>
                                <h2 className={cx('mgb-20px')}>Danh mục</h2>
                                <ul className={cx('category-list')}>
                                    {/* SỬA 2: Chuyển các link filter thành <button> */}
                                    <li>
                                        <button
                                            type="button"
                                            className={cx('btn-link-style', 'btn-coffee')}
                                            onClick={() => handleCategoryFilter('coffee')}
                                        >
                                            <FontAwesomeIcon icon={faAngleRight} />
                                            Cafe
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            className={cx('btn-link-style', 'btn-juice')}
                                            onClick={() => handleCategoryFilter('juice')}
                                        >
                                            <FontAwesomeIcon icon={faAngleRight} />
                                            Nước ép
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            className={cx('btn-link-style', 'btn-cake')}
                                            onClick={() => handleCategoryFilter('soda')}
                                        >
                                            <FontAwesomeIcon icon={faAngleRight} />
                                            Nước có ga
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            type="button"
                                            className={cx('btn-link-style', 'btn-cocktail')}
                                            onClick={() => handleCategoryFilter('cocktail')}
                                        >
                                            <FontAwesomeIcon icon={faAngleRight} />
                                            Cocktail
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Bộ lọc */}
                            <div className={cx('filter')}>
                                <h2 className={cx('filter-header')}>Bộ lọc</h2>
                                <h3 className={cx('filter-sup-header')}>Giá sản phẩm</h3>
                                <ul className={cx('filter-list')}>
                                    <li className={cx('filter-item')}>
                                        <input type="checkbox" id="price-under-100" />
                                        <label htmlFor="price-under-100">Giá dưới 100.000đ</label>
                                    </li>
                                    <li className={cx('filter-item')}>
                                        <input type="checkbox" id="price-100-300" />
                                        <label htmlFor="price-100-300">100.000đ - 300.000đ</label>
                                    </li>
                                    <li className={cx('filter-item')}>
                                        <input type="checkbox" id="price-300-500" />
                                        <label htmlFor="price-300-500">300.000đ - 500.000đ</label>
                                    </li>
                                    <li className={cx('filter-item')}>
                                        <input type="checkbox" id="price-above-500" />
                                        <label htmlFor="price-above-500">Giá trên 500.000đ</label>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Product List & Pagination */}
                        <div className="col-lg-9 col-md-12 col-12">
                            {/* Thanh sắp xếp */}
                            <div className={cx('sortPagiBar')}>
                                <div className={cx('sort-icon')}>
                                    <span className={cx('sort-icon--active')}>
                                        <FontAwesomeIcon icon={faTableCells} />
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faList} />
                                    </span>
                                </div>
                                <div className={cx('sort-by')}>
                                    <span>Sắp xếp:</span>
                                    <select name="sort-by" id="sort-by">
                                        <option value="default">Sắp xếp theo</option>
                                        <option value="name-asc">Tên (A-Z)</option>
                                        <option value="name-desc">Tên (Z-A)</option>
                                        <option value="price-asc">Giá (từ thấp đến cao)</option>
                                        <option value="price-desc">Giá (từ cao đến thấp)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Danh sách sản phẩm (render sản phẩm vào đây) */}
                            <div className={cx('product-search-item', 'row')}>
                                {mockAllProducts.map(product => (
                                    // Bọc mỗi card trong một cột của Bootstrap
                                    <div key={product.id} className="col-lg-4 col-md-6 mb-5">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            {/* Phân trang */}
                            <div className={cx('product-search-pagination-container')}>
                                {/* SỬA 3: Chuyển nút phân trang thành <button> */}
                                <button
                                    type="button"
                                    className={cx('pagination-button', 'left-pagination-button')}
                                    onClick={() => handlePagination('prev')}
                                    aria-label="Trang trước"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <div className={cx('product-search-pagination')}>
                                    {/* Logic render các nút số trang sẽ ở đây */}
                                </div>
                                <button
                                    type="button"
                                    className={cx('pagination-button', 'right-pagination-button')}
                                    onClick={() => handlePagination('next')}
                                    aria-label="Trang sau"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Product;