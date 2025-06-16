import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom'; // Import Link để điều hướng
import classNames from 'classnames/bind';
import styles from '../Main.module.scss';
// --- IMPORT CÁC THÀNH PHẦN CẦN THIẾT ---
import ProductCard from '../../../components/common/ProductCard'; // Import component
import ProductQuickViewModal from '../../../components/common/ProductQuickViewModal';
import Pagination from '../../../components/common/Pagination';
import { mockAllProducts } from '../../../data/products'; // Import dữ liệu giả
import { usePagination } from '../../../hooks/usePagination';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleRight,
    faTableCells,
    faList,
} from '@fortawesome/free-solid-svg-icons';
// Khởi tạo hàm cx để sử dụng CSS Modules
const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 9; // Đặt số sản phẩm mỗi trang

const priceRanges = {
    'under-100': {
        min: 0,
        max: 100000,
        label: 'Dưới 100.000đ'
    },
    '100-300': {
        min: 100000,
        max: 300000,
        label: '100.000đ - 300.000đ'
    },
    '300-500': {
        min: 300000,
        max: 500000,
        label: '300.000đ - 500.000đ'
    },
    'above-500': {
        min: 500000,
        max: Infinity,
        label: 'Trên 500.000đ'
    },
};

const slugify = (str) => {
    if (!str) return '';
    str = str.toString().toLowerCase().trim();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-');
    return str;
};

function Product() {
    const { categoryName } = useParams(); // Lấy 'categoryName' từ URL (vd: /products/Rau-củ)
    const navigate = useNavigate(); // Hook để điều hướng
    // --- STATE MANAGEMENT CHO VIỆC LỌC VÀ SẮP XẾP ---
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [sortOrder, setSortOrder] = useState('default');
    const [viewMode, setViewMode] = useState('grid');

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    // Lấy danh sách danh mục duy nhất từ dữ liệu sản phẩm
    const categories = useMemo(() => {
        return ['Tất cả', ...new Set(mockAllProducts.map(p => p.category))];
    }, []);
    const categoryLookupMap = useMemo(() => {
        const map = {};
        categories.forEach(cat => {
            map[slugify(cat)] = cat;
        });
        return map;
    }, [categories]);

    useEffect(() => {
        // Tìm tên danh mục gốc từ slug trên URL
        // Nếu slug tồn tại và hợp lệ, lấy tên gốc từ map. Ngược lại, là 'Tất cả'
        const categoryFromURL = categoryName ? categoryLookupMap[categoryName] : 'Tất cả';
        setActiveCategory(categoryFromURL || 'Tất cả');

        // Reset các bộ lọc khác
        setSelectedPriceRanges([]);
        setSortOrder('default');
    }, [categoryName, categoryLookupMap]);
    // --- 3. LOGIC LỌC VÀ SẮP XẾP SẢN PHẨM ---
    const processedProducts = useMemo(() => {
        // BƯỚC 1: Bắt đầu với một mảng tạm thời từ danh sách gốc
        let filteredProducts = [...mockAllProducts];

        // BƯỚC 2: Lọc theo danh mục
        if (activeCategory !== 'Tất cả') {
            filteredProducts = filteredProducts.filter(product => product.category === activeCategory);
        }

        // BƯỚC 3: Lọc theo khoảng giá (trên kết quả đã lọc theo danh mục)
        if (selectedPriceRanges.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
                selectedPriceRanges.some(rangeKey => {
                    const range = priceRanges[rangeKey];
                    return product.price >= range.min && product.price < range.max;
                })
            );
        }


        const sortedProducts = [...filteredProducts]; // <-- TẠO MỘT BẢN SAO MỚI

        switch (sortOrder) {
            case 'price-asc':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Không cần làm gì vì thứ tự đã đúng
                break;
        }

        return sortedProducts;
    }, [activeCategory, selectedPriceRanges, sortOrder]);

    // --- 4. SỬ DỤNG HOOK PHÂN TRANG VỚI DỮ LIỆU ĐÃ ĐƯỢC XỬ LÝ ---
    const { currentData, currentPage, maxPage, jump } = usePagination(processedProducts, ITEMS_PER_PAGE);
    // --- 5. CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleCategoryFilter = (category) => {
        if (category === 'Tất cả') {
            // Điều hướng đến URL mới cho tất cả sản phẩm
            navigate('/products');
        } else {
            // Điều hướng đến URL mới cho danh mục cụ thể
            const slug = slugify(category);
            navigate(`/products/${slug}`);
        }
    };

    const handlePriceChange = (e) => {
        const { value, checked } = e.target;
        setSelectedPriceRanges(prev =>
            checked ? [...prev, value] : prev.filter(range => range !== value)
        );
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    // Hàm cho Modal
    const handleShowModal = (product) => { setSelectedProduct(product); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedProduct(null); };


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
                                    {activeCategory}
                                </li>
                            </ul>
                            <div className={cx('title-page')}>{activeCategory}</div>
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
                                    {categories.map((cat, index) => (
                                        <li key={index}>
                                            <button type="button" className={cx('btn-link-style', { 'active-category': activeCategory === cat })} onClick={() => handleCategoryFilter(cat)}>
                                                <FontAwesomeIcon icon={faAngleRight} className={cx('mr-8')} />
                                                <span>{cat}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bộ lọc */}
                            <div className={cx('filter')}>
                                <h2 className={cx('filter-header')}>Bộ lọc</h2>
                                <h3 className={cx('filter-sup-header')}>Giá sản phẩm</h3>
                                <ul className={cx('filter-list')}>
                                    {Object.keys(priceRanges).map((key) => (
                                        <li key={key} className={cx('filter-item')}>
                                            <input
                                                type="checkbox"
                                                id={key}
                                                value={key}
                                                onChange={handlePriceChange}
                                                className={cx('mr-8')}
                                                // Kiểm tra xem range này có đang được chọn hay không
                                                checked={selectedPriceRanges.includes(key)}
                                            />
                                            <label htmlFor={key}>{priceRanges[key].label}</label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Product List & Pagination */}
                        <div className="col-lg-9 col-md-12 col-12">
                            {/* Thanh sắp xếp */}
                            <div className={cx('sortPagiBar')}>
                                <div className={cx('sort-icon')}>
                                    <span
                                        className={cx('sort-icon-item', { 'sort-icon--active': viewMode === 'grid' })}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <FontAwesomeIcon icon={faTableCells} />
                                    </span>
                                    <span
                                        className={cx('sort-icon-item', { 'sort-icon--active': viewMode === 'list' })}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <FontAwesomeIcon icon={faList} />
                                    </span>
                                </div>
                                <div className={cx('sort-by')}>
                                    <span>Sắp xếp:</span>
                                    <select name="sort-by" id="sort-by" onChange={handleSortChange} value={sortOrder}>
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
                                {currentData.length > 0 ? (
                                    currentData.map(product => {
                                        // Xác định class cột dựa trên viewMode
                                        const columnClass = viewMode === 'grid' ? 'col-lg-4 col-md-6' : 'col-12';

                                        return (
                                            <div key={product.id} className={`${columnClass} mb-5`}>
                                                <ProductCard
                                                    product={product}
                                                    onViewProduct={handleShowModal}
                                                    viewMode={viewMode} // <-- TRUYỀN PROP XUỐNG
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <h4>Không có sản phẩm nào phù hợp.</h4>
                                    </div>
                                )}
                            </div>


                            {/* Phân trang */}
                            <Pagination
                                currentPage={currentPage}
                                totalPageCount={maxPage}
                                onPageChange={page => jump(page)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <ProductQuickViewModal
                show={showModal}
                handleClose={handleCloseModal}
                product={selectedProduct}
            />
        </>
    );
}

export default Product;