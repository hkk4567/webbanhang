import React, { useState, useEffect } from 'react';
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
import { mockAllProducts } from '../../data/products'; // Giả sử bạn có file này
const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 12;
function SearchResultsPage() {
    // Lấy query param từ URL (ví dụ: /search?q=cafe)
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || ''; // Lấy giá trị của 'q'

    // State để lưu trữ kết quả tìm kiếm và trạng thái tải
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect để "tìm kiếm" mỗi khi query thay đổi
    useEffect(() => {
        setIsLoading(true);

        // Mô phỏng việc gọi API
        const timer = setTimeout(() => {
            if (query) {
                const filteredProducts = mockAllProducts.filter((product) =>
                    product.name.toLowerCase().includes(query.toLowerCase()),
                );
                setSearchResults(filteredProducts);
            } else {
                setSearchResults([]); // Nếu không có query, không hiển thị kết quả
            }
            setIsLoading(false);
        }, 500); // Giả lập độ trễ mạng

        return () => clearTimeout(timer); // Cleanup function
    }, [query]);
    //  SỬ DỤNG HOOK PHÂN TRANG VỚI KẾT QUẢ TÌM KIẾM ---
    const {
        currentData,
        currentPage,
        maxPage,
        jump
    } = usePagination(searchResults, ITEMS_PER_PAGE);

    useEffect(() => {
        jump(1);
    }, [searchResults, jump]);
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
                            {isLoading ? (
                                <p className={cx('search-text')}>Đang tìm kiếm...</p>
                            ) : (
                                <p className={cx('search-text')}>
                                    Có <span className={cx('search-product-quantity')}>{searchResults.length}</span> kết quả
                                    tìm kiếm phù hợp.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className={cx('product-search-item', 'row', 'mt-4')}>
                        {!isLoading && currentData.length > 0 &&
                            currentData.map(product => (
                                <div key={product.id} className="col-lg-3 col-md-6 mb-5">
                                    <ProductCard product={product} />
                                </div>
                            ))
                        }
                        {!isLoading && searchResults.length === 0 && query && (
                            <div className="col-12 text-center py-5">
                                <h3>Không tìm thấy sản phẩm nào cho từ khóa "{query}"</h3>
                                <p>Vui lòng thử với từ khóa khác.</p>
                            </div>
                        )}
                    </div>

                    {/* --- BƯỚC 5: SỬ DỤNG COMPONENT PHÂN TRANG --- */}
                    {!isLoading && searchResults.length > ITEMS_PER_PAGE && (
                        <Pagination
                            currentPage={currentPage}
                            totalPageCount={maxPage}
                            onPageChange={page => jump(page)}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default SearchResultsPage;