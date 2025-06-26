import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Main.module.scss';
import { Spinner, Form } from 'react-bootstrap'; // Import Spinner và Form

// --- IMPORT CÁC THÀNH PHẦN CẦN THIẾT ---
import ProductCard from '../../../components/common/ProductCard';
import ProductQuickViewModal from '../../../components/common/ProductQuickViewModal';
import Pagination from '../../../components/common/Pagination';
import { usePagination } from '../../../hooks/usePaginationAPI'; // Hook đã nâng cấp cho server
import { getProducts, getCategories } from '../../../api/productService'; // API services

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faTableCells, faList } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 9;

// Dữ liệu cho bộ lọc giá
const priceRanges = {
    'under-100': { min: 0, max: 100000, label: 'Dưới 100.000đ' },
    '100-300': { min: 100000, max: 300000, label: '100.000đ - 300.000đ' },
    '300-500': { min: 300000, max: 500000, label: '300.000đ - 500.000đ' },
    'above-500': { min: 500000, max: Infinity, label: 'Trên 500.000đ' },
};

// Dữ liệu cho bộ lọc sắp xếp (khớp với backend)
const sortOptions = [
    { label: 'Mặc định (Mới nhất)', value: '-created_at' },
    { label: 'Tên: A-Z', value: 'name-asc' },
    { label: 'Tên: Z-A', value: 'name-desc' },
    { label: 'Giá: Thấp đến cao', value: 'price-asc' },
    { label: 'Giá: Cao đến thấp', value: 'price-desc' },
];

function Product() {
    const { categoryId } = useParams(); // Lấy categoryId từ URL
    const navigate = useNavigate();
    const isInitialMount = useRef(true);
    // --- STATE TỪ API ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- STATE ĐIỀU KHIỂN BỘ LỌC VÀ HIỂN THỊ ---
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [sortOrder, setSortOrder] = useState('-created_at');
    const [viewMode, setViewMode] = useState('grid');

    const { requestedPage, paginationProps, goToPage } = usePagination(paginationData);

    // --- STATE CHO MODAL ---
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // --- HÀM GỌI API ---
    useEffect(() => {
        const fetchApiData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Lấy danh mục chỉ một lần khi component mount
                if (categories.length === 0) {
                    const catResponse = await getCategories();
                    setCategories([{ id: '', name: 'Tất cả' }, ...catResponse.data.data.categories]);
                }

                // --- BẮT ĐẦU SỬA LỖI LOGIC GỬI PARAMS ---
                // 1. Xây dựng đối tượng params cơ bản
                const params = {
                    page: requestedPage,
                    limit: ITEMS_PER_PAGE,
                    sort: sortOrder,
                };

                // 2. Chỉ thêm categoryId nếu nó tồn tại
                if (categoryId) {
                    params.categoryId = categoryId;
                }

                // 3. Xử lý và thêm các tham số giá một cách tường minh
                if (selectedPriceRanges.length > 0) {
                    params.price_ranges = selectedPriceRanges; // Gửi dưới tên 'price_ranges'
                }
                // --- KẾT THÚC SỬA LỖI ---

                const prodResponse = await getProducts(params);
                setProducts(prodResponse.data.data.products);
                setPaginationData(prodResponse.data.data.pagination);

            } catch (err) {
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
                console.error("API Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApiData();
        // Dependency array này đảm bảo useEffect chạy lại khi các bộ lọc thay đổi
    }, [requestedPage, categoryId, selectedPriceRanges, sortOrder, categories.length]);

    // Effect RIÊNG để reset trang về 1 khi bộ lọc thay đổi
    useEffect(() => {
        // Bỏ qua lần render đầu tiên để không reset trang khi vừa tải
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Chỉ reset khi trang hiện tại khác 1 để tránh gọi lại API không cần thiết
        goToPage(1);
        // Thêm các dependency còn thiếu vào mảng
    }, [categoryId, selectedPriceRanges, sortOrder, goToPage]);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleCategoryFilter = (catId) => {
        navigate(catId ? `/products/${catId}` : '/products');
    };

    const handlePriceChange = (e) => {
        const { value, checked } = e.target;
        setSelectedPriceRanges(prev =>
            checked ? [...prev, value] : prev.filter(range => range !== value)
        );
    };

    const handleShowModal = (product) => { setSelectedProduct(product); setShowModal(true); };
    const handleCloseModal = () => { setSelectedProduct(null); setShowModal(false); };

    const activeCategoryName = categories.find(c => c.id === parseInt(categoryId))?.name || 'Tất cả sản phẩm';

    return (
        <>
            {/* Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/" >Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className={cx('icon-spacing')} />
                                </li>
                                <li className={cx('breadrumb-title-page')} style={{ textTransform: 'capitalize' }}>
                                    {activeCategoryName}
                                </li>
                            </ul>
                            <div className={cx('title-page')}>{activeCategoryName}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={cx('search-main')}>
                <div className="container">
                    <div className="row">
                        {/* Sidebar */}
                        <div className={cx('Category-container', 'col-lg-3', 'd-none', 'd-lg-block')}>
                            <div className={cx('Category')}>
                                <h2 className={cx('mgb-20px')}>Danh mục</h2>
                                <ul className={cx('category-list')}>
                                    {categories.map(cat => (
                                        <li key={cat.id || 'all'}>
                                            <button onClick={() => handleCategoryFilter(cat.id)} className={cx('btn-link-style', { 'active-category': (cat.id ? parseInt(categoryId) : !categoryId) === cat.id })}>
                                                <FontAwesomeIcon icon={faAngleRight} className={cx('mr-8')} />
                                                <span>{cat.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={cx('filter')}>
                                <h2 className={cx('filter-header')}>Bộ lọc</h2>
                                <h3 className={cx('filter-sup-header')}>Giá sản phẩm</h3>
                                <ul className={cx('filter-list')}>
                                    {Object.keys(priceRanges).map((key) => (
                                        <li key={key} style={{ userSelect: 'none' }} className={cx('filter-item')}>
                                            <input type="checkbox" id={key} value={key} onChange={handlePriceChange} checked={selectedPriceRanges.includes(key)} className={cx('mr-8')} />
                                            <label htmlFor={key}>{priceRanges[key].label}</label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="col-lg-9 col-md-12 col-12">
                            <div className={cx('sortPagiBar')}>
                                <div className={cx('sort-icon')}>
                                    <span className={cx('sort-icon-item', { 'sort-icon--active': viewMode === 'grid' })} onClick={() => setViewMode('grid')}><FontAwesomeIcon icon={faTableCells} /></span>
                                    <span className={cx('sort-icon-item', { 'sort-icon--active': viewMode === 'list' })} onClick={() => setViewMode('list')}><FontAwesomeIcon icon={faList} /></span>
                                </div>
                                <div className={cx('sort-by', 'd-flex', 'align-items-center')}>

                                    <span className="text-muted me-2">Sắp xếp:</span>

                                    <Form.Select
                                        size="sm"
                                        className="w-auto"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        // Thêm style trực tiếp vào đây
                                        style={{
                                            paddingTop: '0.55rem',
                                            paddingBottom: '0.55rem',
                                            paddingRight: '2rem',
                                            fontSize: '0.8rem',
                                            height: 'auto',
                                        }}
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </Form.Select>

                                </div>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-5" style={{ minHeight: '500px' }}><Spinner animation="border" /></div>
                            ) : error ? (
                                <div className="text-center py-5 text-danger">{error}</div>
                            ) : (
                                <div className={cx('product-search-item', 'row')}>
                                    {products.length > 0 ? (
                                        products.map(product => (
                                            <div key={product.id} className={viewMode === 'grid' ? 'col-lg-4 col-md-6 col-sm-6 ' : 'col-12 mt-3'}>
                                                <ProductCard product={product} onViewProduct={handleShowModal} viewMode={viewMode} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-5"><h4>Không có sản phẩm nào phù hợp.</h4></div>
                                    )}
                                </div>
                            )}

                            {!isLoading && paginationData.totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4"><Pagination {...paginationProps} /></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ProductQuickViewModal show={showModal} handleClose={handleCloseModal} product={selectedProduct} />
        </>
    );
}

export default Product;