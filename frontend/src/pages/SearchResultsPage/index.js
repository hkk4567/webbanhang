import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './SearchResultsPage.module.scss';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Dữ liệu giả - Trong thực tế, bạn sẽ lấy từ API
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/common/Pagination';
import ProductCard from '../../components/common/ProductCard'; // Import component
import ProductQuickViewModal from '../../components/common/ProductQuickViewModal';
import { mockAllProducts } from '../../data/products'; // Giả sử bạn có file này
const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 12;
function SearchResultsPage() {
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    // --- HÀM ĐỂ MỞ MODAL ---
    // Hàm này sẽ được truyền xuống cho ProductCard
    const handleShowModal = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    // --- HÀM ĐỂ ĐÓNG MODAL ---
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null); // Reset sản phẩm đã chọn
    };
    // Lấy query param từ URL (ví dụ: /search?q=cafe)
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || ''; // Lấy giá trị của 'q'
    const type = searchParams.get('type') || '';
    const priceFrom = searchParams.get('price_from') || '';
    const priceTo = searchParams.get('price_to') || '';

    // useEffect để "tìm kiếm" mỗi khi query thay đổi
    const searchResults = useMemo(() => {
        if (!query && !type && !priceFrom && !priceTo) {
            return [];
        }
        return mockAllProducts.filter((product) => {
            const nameMatch = query ? product.name.toLowerCase().includes(query.toLowerCase()) : true;
            const typeMatch = type ? product.category === type : true;
            const priceFromMatch = priceFrom ? product.price >= Number(priceFrom) : true;
            const priceToMatch = priceTo ? product.price <= Number(priceTo) : true;
            return nameMatch && typeMatch && priceFromMatch && priceToMatch;
        });
    }, [query, type, priceFrom, priceTo]);
    //  SỬ DỤNG HOOK PHÂN TRANG VỚI KẾT QUẢ TÌM KIẾM ---
    const {
        currentData,
        currentPage,
        maxPage,
        jump
    } = usePagination(searchResults, ITEMS_PER_PAGE);
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
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li>Trang tìm kiếm</li>
                            </ul>
                            <div className={cx('title-page')}>
                                <span>Tìm kiếm cho: </span>
                                <span className={cx('search-value')}>"{query}"</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Search Results */}
            <div className={cx('search-main')}>
                <div className="container">
                    {/* Kết quả tìm kiếm */}
                    <div className="row">
                        <div className="col-12">
                            <p className={cx('search-text')}>
                                Có <span className={cx('search-product-quantity')}>{searchResults.length}</span> kết quả
                                tìm kiếm phù hợp.
                            </p>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className={cx('product-search-item', 'row', 'mt-4')}>
                        {currentData.length > 0 ? (
                            currentData.map(product => (
                                <div key={product.id} className="col-lg-3 col-md-6 mb-5">
                                    <ProductCard product={product} onViewProduct={handleShowModal} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <h3>Không tìm thấy sản phẩm nào.</h3>
                                <p>Vui lòng thử lại với các tiêu chí khác.</p>
                            </div>
                        )}
                    </div>

                    {/* Phân trang */}
                    {searchResults.length > ITEMS_PER_PAGE && (
                        <Pagination
                            currentPage={currentPage}
                            totalPageCount={maxPage}
                            onPageChange={page => jump(page)}
                        />
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