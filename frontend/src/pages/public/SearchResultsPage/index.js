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
import { searchProducts } from '../../../api/searchService';

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
    const [categoryNameForTitle, setCategoryNameForTitle] = useState('');
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- LẤY PARAMS TỪ URL ---
    const [searchParams] = useSearchParams();
    const query = searchParams.get('search') || ''; // Sửa 'q' thành 'search'
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
                // Xây dựng bộ lọc (filter) cho Meilisearch
                const filters = [];
                if (categoryId) {
                    filters.push(`categoryId = ${categoryId}`);
                }
                if (priceMin) {
                    filters.push(`price >= ${priceMin}`);
                }
                if (priceMax) {
                    filters.push(`price <= ${priceMax}`);
                }
                // Thêm điều kiện chỉ lấy sản phẩm 'active'
                filters.push(`status = 'active'`);

                const meiliOptions = {
                    limit: ITEMS_PER_PAGE,
                    offset: (requestedPage - 1) * ITEMS_PER_PAGE,
                    filter: filters.join(' AND '),
                    // Có thể thêm sort ở đây nếu cần, ví dụ: sort: ['price:asc']
                };
                console.log("Đang tìm kiếm với Meilisearch:", { query, options: meiliOptions });
                // Gọi API tìm kiếm mới
                const response = await searchProducts(query, meiliOptions);

                // Cập nhật state với dữ liệu từ Meilisearch
                setSearchResults(response.hits);
                console.log("Kết quả tìm kiếm từ Meilisearch:", response.hits);
                setPaginationData({
                    totalItems: response.estimatedTotalHits,
                    totalPages: Math.ceil(response.estimatedTotalHits / ITEMS_PER_PAGE),
                    currentPage: requestedPage,
                });
                if (categoryId && response.hits.length > 0 && response.hits[0].category) {
                    setCategoryNameForTitle(response.hits[0].category.name);
                } else {
                    setCategoryNameForTitle(''); // Reset nếu không lọc theo danh mục
                }
            } catch (err) {
                console.error("Lỗi khi tìm kiếm sản phẩm với Meilisearch:", err);
                setError("Không thể tải kết quả tìm kiếm. Vui lòng thử lại.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, categoryId, priceMin, priceMax, requestedPage]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        goToPage(1);
    }, [query, categoryId, priceMin, priceMax, goToPage]);

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
        if (categoryNameForTitle) {
            titleParts.push(
                <React.Fragment key="category">
                    trong danh mục <span className={cx('search-value')}>{categoryNameForTitle}</span>
                </React.Fragment>
            );
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