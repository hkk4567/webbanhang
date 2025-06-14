import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Main.module.scss'; // Giả sử file SCSS của bạn nằm ở đây

// Import icon cần thiết từ Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Khởi tạo hàm cx để sử dụng CSS Modules
const cx = classNames.bind(styles);

// Đặt tên component theo chuẩn PascalCase
function MultiSearch() {
    // Sử dụng useState để quản lý trạng thái của các input
    const [searchTerm, setSearchTerm] = useState('');
    const [productType, setProductType] = useState('');
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const navigate = useNavigate();
    // Hàm xử lý khi nhấn nút tìm kiếm
    const handleSearch = () => {
        // Sử dụng URLSearchParams để xây dựng query string một cách an toàn
        const params = new URLSearchParams();

        if (searchTerm.trim()) {
            params.append('q', searchTerm.trim());
        }
        if (productType) {
            params.append('type', productType);
        }
        if (priceFrom) {
            params.append('price_from', priceFrom);
        }
        if (priceTo) {
            params.append('price_to', priceTo);
        }

        const searchQuery = params.toString();

        // Điều hướng đến trang kết quả với các tham số đã xây dựng
        navigate(`/search?${searchQuery}`);
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
                                    <Link to="/" >Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li>Trang tìm kiếm</li>
                            </ul>
                            <div className={cx('title-page')}>
                                <span>Tìm kiếm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Search Form */}
            <div className={cx('search-main')}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {/* Bọc mỗi group bằng div.mb-3 của Bootstrap để tạo khoảng cách */}
                            <div className="mb-3">
                                <label className={cx('search-text-label-input')} htmlFor="search-name">
                                    Nhập tên sản phẩm:
                                </label>
                                <input
                                    className={cx('input-multi-search', 'form-control')}
                                    id="search-name"
                                    type="text"
                                    placeholder="Nhập tên sản phẩm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className={cx('search-text-label-input')} htmlFor="search-type">
                                    Chọn loại sản phẩm:
                                </label>
                                <select
                                    className={cx('input-multi-search', 'form-select')}
                                    name="search-type"
                                    id="search-type"
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value)}
                                >
                                    <option value="">Chọn loại sản phẩm</option>
                                    <option value="Cafe">Cafe</option>
                                    <option value="Nước ép">Nước ép</option>
                                    <option value="Nước có ga">Nước có ga</option>
                                    <option value="Cocktail">Cocktail</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className={cx('search-text-label-input')}>Nhập khoảng giá sản phẩm:</label>
                                {/* Dùng flexbox của Bootstrap để sắp xếp các input trên một hàng */}
                                <div className="d-flex align-items-center">
                                    <label className={cx('search-from-to', 'me-2')} htmlFor="search-from">
                                        Từ:
                                    </label>
                                    <input
                                        className="form-control me-3"
                                        style={{ width: '150px' }}
                                        type="text"
                                        id="search-from"
                                        placeholder="VD: 20000"
                                        value={priceFrom}
                                        onChange={(e) => setPriceFrom(e.target.value)}
                                    />
                                    <label className={cx('search-from-to', 'me-2')} htmlFor="search-to">
                                        - Đến:
                                    </label>
                                    <input
                                        className="form-control"
                                        style={{ width: '150px' }}
                                        type="text"
                                        id="search-to"
                                        placeholder="VD: 100000"
                                        value={priceTo}
                                        onChange={(e) => setPriceTo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                className={cx('btn-multi-search', 'btn', 'btn-primary', 'mt-3')}
                                onClick={handleSearch}
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MultiSearch;