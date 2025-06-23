import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../Main.module.scss'; // Giả sử dùng chung file style từ Main
import { Form, Button, InputGroup, Spinner, Alert, Row, Col } from 'react-bootstrap';

// Import API service để lấy danh mục
import { getCategories } from '../../../api/productService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faSearch } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function MultiSearch() {
    // --- STATE CHO CÁC TRƯỜNG INPUT CỦA FORM ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');

    // --- STATE ĐỂ QUẢN LÝ DỮ LIỆU VÀ TRẠNG THÁI TỪ API ---
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // --- useEffect: LẤY DANH SÁCH DANH MỤC KHI COMPONENT ĐƯỢC RENDER ---
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Gọi API getCategories với scope 'user' là phù hợp cho trang công khai
                const response = await getCategories('user');
                setCategories(response.data.data.categories);
            } catch (err) {
                console.error("Lỗi khi tải danh mục:", err);
                setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []); // Mảng dependency rỗng `[]` đảm bảo effect này chỉ chạy một lần

    // --- HÀM XỬ LÝ KHI SUBMIT FORM TÌM KIẾM ---
    const handleSearch = (e) => {
        e.preventDefault(); // Ngăn form submit và reload lại trang

        // Sử dụng URLSearchParams để xây dựng query string một cách an toàn và sạch sẽ
        const params = new URLSearchParams();

        if (searchTerm.trim()) {
            params.append('q', searchTerm.trim());
        }
        if (selectedCategory) {
            params.append('categoryId', selectedCategory);
        }
        if (priceMin) {
            params.append('price_min', priceMin);
        }
        if (priceMax) {
            params.append('price_max', priceMax);
        }

        const searchQuery = params.toString();

        // Điều hướng đến trang kết quả tìm kiếm với các tham số đã xây dựng
        navigate(`/search?${searchQuery}`);
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <Row>
                        <Col xs={12}>
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/">Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li>Tìm kiếm nâng cao</li>
                            </ul>
                            <div className={cx('title-page')}>
                                <span>Tìm kiếm nâng cao</span>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Main Search Form */}
            <div className={cx('search-main')}>
                <div className="container">
                    <Row className="justify-content-center">
                        <Col lg={8} md={10}>
                            <div className={cx('search-form-wrapper', 'p-4 p-md-5 border rounded shadow-sm')}>
                                <h3 className="text-center mb-4">Tìm kiếm sản phẩm</h3>

                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form onSubmit={handleSearch}>
                                    <Form.Group className="mb-3" controlId="search-name">
                                        <Form.Label>Tên sản phẩm</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Nhập tên sản phẩm cần tìm..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="search-category">
                                        <Form.Label>
                                            Loại sản phẩm
                                            {isLoading && <Spinner animation="border" size="sm" className="ms-2" />}
                                        </Form.Label>
                                        <Form.Select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            disabled={isLoading}
                                        >
                                            <option value="">
                                                {isLoading ? 'Đang tải danh mục...' : 'Tất cả danh mục'}
                                            </option>
                                            {!isLoading && categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Khoảng giá</Form.Label>
                                        <Row>
                                            <Col>
                                                <InputGroup>
                                                    <InputGroup.Text>Từ</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="VD: 20000"
                                                        value={priceMin}
                                                        onChange={(e) => setPriceMin(e.target.value)}
                                                        min="0"
                                                    />
                                                </InputGroup>
                                            </Col>
                                            <Col>
                                                <InputGroup>
                                                    <InputGroup.Text>Đến</InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="VD: 100000"
                                                        value={priceMax}
                                                        onChange={(e) => setPriceMax(e.target.value)}
                                                        min={priceMin || "0"}
                                                    />
                                                </InputGroup>
                                            </Col>
                                        </Row>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button type="submit" variant="primary" size="lg">
                                            <FontAwesomeIcon icon={faSearch} className="me-2" />
                                            Tìm kiếm
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
}

export default MultiSearch;