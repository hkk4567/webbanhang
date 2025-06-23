import React, { useState, useEffect, useRef } from 'react'; // Import thêm useRef
import { Link, useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './SearchResultsPage.module.scss';
import { Spinner, Alert } from 'react-bootstrap';

// Import các thành phần và hooks cần thiết
import Pagination from '../../../components/common/Pagination';
import ProductCard from '../../../components/common/ProductCard';
import ProductQuickViewModal from '../../../components/common/ProductQuickViewModal';
import { usePagination } from '../../../hooks/usePaginationAPI';
import { getProducts } from '../../../api/productService';
import { getCategories } from '../../../api/productService'; // Import thêm getCategories

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 12;

function SearchResultsPage() {
    // --- STATE CHO UI ---
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // --- STATE CHO DỮ LIỆU TỪ API ---
    const [searchResults, setSearchResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- LẤY PARAMS TỪ URL ---
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const priceMin = searchParams.get('price_min') || '';
    const priceMax = searchParams.get('price_max') || '';

    // --- HOOKS ---
    const { requestedPage, paginationProps, goToPage } = usePagination(paginationData);
    // Ref để theo dõi lần render đầu tiên của component
    const isInitialMount = useRef(true);

    // --- CÁC EFFECT ---

    // Effect 1: Chỉ chịu trách nhiệm GỌI API lấy sản phẩm
    // Nó sẽ chạy lại khi một trong các bộ lọc thay đổi, hoặc khi người dùng chuyển trang
    useEffect(() => {
        const fetchSearchResults = async () => {
            // Không tìm kiếm nếu không có bất kỳ tiêu chí nào
            if (!query && !categoryId && !priceMin && !priceMax) {
                setIsLoading(false);
                setSearchResults([]);
                setPaginationData({});
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const params = {
                    page: requestedPage,
                    limit: ITEMS_PER_PAGE,
                };
                if (query) params.search = query;
                if (categoryId) params.categoryId = categoryId;
                if (priceMin) params.price_min = priceMin;
                if (priceMax) params.price_max = priceMax;

                const response = await getProducts(params);

                setSearchResults(response.data.data.products);
                setPaginationData(response.data.data.pagination);

            } catch (err) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", err);
                setError("Không thể tải kết quả tìm kiếm. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, categoryId, priceMin, priceMax, requestedPage]); // Phụ thuộc vào tất cả các yếu tố có thể trigger việc gọi lại API

    // Effect 2: Chỉ chịu trách nhiệm RESET trang về 1 khi BỘ LỌC thay đổi
    useEffect(() => {
        // Ở lần render đầu tiên, `isInitialMount.current` là true.
        // Chúng ta đánh dấu nó thành false và thoát ra để không reset trang.
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Từ những lần render sau, nếu bất kỳ bộ lọc nào thay đổi,
        // effect này sẽ chạy và gọi goToPage(1).
        // Hook `usePagination` sẽ xử lý việc chỉ cập nhật `requestedPage` nếu nó khác 1.
        goToPage(1);

    }, [query, categoryId, priceMin, priceMax, goToPage]); // Phụ thuộc vào các BỘ LỌC và hàm goToPage

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories('user');
                setCategories(response.data.data.categories);
            } catch (err) {
                console.error("Không thể tải danh mục:", err);
                // Không cần set lỗi chính ở đây vì nó không phải là chức năng cốt lõi
            }
        };
        fetchCategories();
    }, []);


    // --- CÁC HÀM HANDLER ---
    const handleShowModal = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const renderSearchTitle = () => {
        if (!query && !categoryId && !priceMin && !priceMax) {
            return <span>Vui lòng nhập tiêu chí để tìm kiếm</span>;
        }

        let titleParts = [];

        // 1. Xử lý từ khóa tìm kiếm
        if (query) {
            titleParts.push(
                <React.Fragment key="query">
                    từ khóa <span className={cx('search-value')}>"{query}"</span>
                </React.Fragment>
            );
        }

        // 2. Xử lý danh mục
        if (categoryId) {
            // Tìm tên danh mục từ mảng categories đã fetch
            const categoryName = categories.find(cat => String(cat.id) === categoryId)?.name;
            if (categoryName) {
                titleParts.push(
                    <React.Fragment key="category">
                        trong danh mục <span className={cx('search-value')}>{categoryName}</span>
                    </React.Fragment>
                );
            }
        }

        // 3. Xử lý khoảng giá
        if (priceMin || priceMax) {
            let priceText = '';
            if (priceMin && priceMax) {
                priceText = `từ ${Number(priceMin).toLocaleString('vi-VN')}đ đến ${Number(priceMax).toLocaleString('vi-VN')}đ`;
            } else if (priceMin) {
                priceText = `từ ${Number(priceMin).toLocaleString('vi-VN')}đ trở lên`;
            } else if (priceMax) {
                priceText = `dưới ${Number(priceMax).toLocaleString('vi-VN')}đ`;
            }

            if (priceText) {
                titleParts.push(
                    <React.Fragment key="price">
                        với giá <span className={cx('search-value')}>{priceText}</span>
                    </React.Fragment>
                );
            }
        }

        // 4. Kết hợp các phần lại
        if (titleParts.length === 0) {
            return <span>Trang tìm kiếm</span>;
        }

        return (
            <span>
                Kết quả cho {titleParts.map((part, index) => (
                    // Nối các phần bằng dấu phẩy, trừ phần cuối cùng
                    <span key={index}>{part}{index < titleParts.length - 1 ? ', ' : ''}</span>
                ))}
            </span>
        );
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
                                    <Link to="/">Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li>Kết quả tìm kiếm</li>
                            </ul>
                            <div className={cx('title-page')}>
                                {renderSearchTitle()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Search Results */}
            <div className={cx('search-main')}>
                <div className="container">
                    {isLoading ? (
                        <div className="text-center py-5" style={{ minHeight: '40vh' }}>
                            <Spinner animation="border" />
                            <h3 className="mt-3">Đang tìm kiếm...</h3>
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="text-center">{error}</Alert>
                    ) : (
                        <>
                            <div className="row">
                                <div className="col-12">
                                    <p className={cx('search-text')}>
                                        Có <span className={cx('search-product-quantity')}>{paginationData.totalItems || 0}</span> kết quả
                                        tìm kiếm phù hợp.
                                    </p>
                                </div>
                            </div>

                            <div className={cx('product-search-item', 'row', 'mt-4')}>
                                {searchResults.length > 0 ? (
                                    searchResults.map(product => (
                                        <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-5">
                                            <ProductCard product={product} onViewProduct={handleShowModal} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5">
                                        <h3>Không tìm thấy sản phẩm nào.</h3>
                                        <p className="text-muted">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                                    </div>
                                )}
                            </div>

                            {paginationData.totalPages > 1 && (
                                <Pagination {...paginationProps} />
                            )}
                        </>
                    )}
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

export default SearchResultsPage;