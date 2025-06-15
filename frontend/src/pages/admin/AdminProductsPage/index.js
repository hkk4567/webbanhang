import React, { useState, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import classNames from 'classnames/bind';
import styles from './AdminProductsPage.module.scss';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';
import ProductFormModal from './components/ProductFormModal';
import { mockAllProducts } from '../../../data/products';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 10; // Ngưỡng cảnh báo sắp hết hàng

// Lấy danh sách danh mục duy nhất từ dữ liệu sản phẩm để lọc
const productCategories = ['Tất cả', ...Array.from(new Set(mockAllProducts.map(p => p.category)))];
const statusFilters = ['Tất cả', 'Còn hàng', 'Sắp hết hàng', 'Hết hàng'];

function AdminProductsPage() {
    const [products, setProducts] = useState(mockAllProducts);

    // --- STATE MỚI CHO UX ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Tất cả');
    const [filterStatus, setFilterStatus] = useState('Tất cả');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    // --- State cho Modal ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState(null);

    function removeDiacritics(str) {
        return str
            .normalize('NFD') // Tách ký tự và dấu (e.g., 'á' -> 'a' + '´')
            .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
            .replace(/đ/g, 'd').replace(/Đ/g, 'D'); // Chuyển 'đ' thành 'd'
    }

    // --- LOGIC XỬ LÝ DỮ LIỆU: TÌM KIẾM, LỌC, SẮP XẾP ---
    const processedProducts = useMemo(() => {
        let filteredProducts = [...products];

        // 1. Lọc theo trạng thái
        if (filterStatus !== 'Tất cả') {
            filteredProducts = filteredProducts.filter(p => {
                if (filterStatus === 'Còn hàng') return p.stock > LOW_STOCK_THRESHOLD;
                if (filterStatus === 'Sắp hết hàng') return p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
                if (filterStatus === 'Hết hàng') return p.stock === 0;
                return true;
            });
        }

        // 2. Lọc theo danh mục
        if (filterCategory !== 'Tất cả') {
            filteredProducts = filteredProducts.filter(p => p.category === filterCategory);
        }

        // 3. Tìm kiếm
        if (searchTerm) {
            // Chuẩn hóa từ khóa tìm kiếm: bỏ dấu, chuyển sang chữ thường, xóa khoảng trắng
            const normalizedSearchTerm = removeDiacritics(searchTerm.toLowerCase().trim());

            filteredProducts = filteredProducts.filter(p =>
                // Chuẩn hóa tên sản phẩm trước khi so sánh
                removeDiacritics(p.name.toLowerCase()).includes(normalizedSearchTerm) ||
                p.id.toString().toLowerCase().includes(normalizedSearchTerm)
            );
        }

        // 4. Sắp xếp
        if (sortConfig.key) {
            filteredProducts.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredProducts;
    }, [products, searchTerm, filterCategory, filterStatus, sortConfig]);

    const { currentData, currentPage, maxPage, jump } = usePagination(processedProducts, ITEMS_PER_PAGE);

    // --- CÁC HÀM HỖ TRỢ ---
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <i className="bi bi-sort-up ms-1"></i> : <i className="bi bi-sort-down ms-1"></i>;
    };

    const renderStatusBadge = (stock) => {
        if (stock === 0) {
            return <span className={cx('status-badge', 'status-danger')}>Hết hàng</span>;
        }
        if (stock <= LOW_STOCK_THRESHOLD) {
            return <span className={cx('status-badge', 'status-warning')}>Sắp hết</span>;
        }
        return <span className={cx('status-badge', 'status-success')}>Còn hàng</span>;
    };

    const formatCurrency = (amount) => amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditingProduct(null);
        setDeletingProductId(null);
    };

    const handleShowAddModal = () => {
        setEditingProduct(null);
        setShowFormModal(true);
    };

    const handleShowEditModal = (product) => {
        setEditingProduct(product);
        setShowFormModal(true);
    };

    const handleShowDeleteModal = (id) => {
        setDeletingProductId(id);
        setShowDeleteModal(true);
    };

    // --- HÀM XỬ LÝ CRUD ---
    const handleSaveProduct = (productData) => {
        const finalStock = productData.status === 'hidden' ? 0 : (parseInt(productData.stock, 10) || 0);

        if (productData.id) {
            setProducts(products.map(p =>
                p.id === productData.id ? { ...p, ...productData, stock: finalStock } : p
            ));
            alert(`Đã cập nhật sản phẩm "${productData.name}"`);
        } else {
            const newProduct = {
                ...productData,
                id: `SP${Date.now()}`,
                slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
                stock: finalStock,
            };
            setProducts([newProduct, ...products]);
            alert(`Đã thêm sản phẩm mới "${productData.name}"`);
        }
    };

    const handleDeleteConfirm = () => {
        setProducts(products.filter(p => p.id !== deletingProductId));
        handleCloseModals();
    };

    const productToDelete = products.find(p => p.id === deletingProductId);

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <div className="row">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="fw-bold mb-0">Quản lý Sản phẩm</h1>
                        <Button variant="primary" onClick={handleShowAddModal}>
                            <i className="bi bi-plus-circle me-2"></i> Thêm sản phẩm
                        </Button>
                    </div>
                </div>

                {/* --- KHU VỰC TÌM KIẾM VÀ LỌC --- */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <Row className="g-3">
                            <Col lg={5}>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm theo tên hoặc ID sản phẩm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col lg={4} md={6}>
                                <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                    {productCategories.map(cat => <option key={cat} value={cat}>{cat === 'Tất cả' ? 'Tất cả danh mục' : cat}</option>)}
                                </Form.Select>
                            </Col>
                            <Col lg={3} md={6}>
                                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    {statusFilters.map(status => <option key={status} value={status}>{status === 'Tất cả' ? 'Tất cả trạng thái' : status}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>STT</th>
                                        <th onClick={() => requestSort('name')} className="cursor-pointer">Tên sản phẩm {getSortIcon('name')}</th>
                                        <th>Trạng thái</th>
                                        <th onClick={() => requestSort('stock')} className="cursor-pointer text-center">Số lượng {getSortIcon('stock')}</th>
                                        <th onClick={() => requestSort('price')} className="cursor-pointer">Giá tiền {getSortIcon('price')}</th>
                                        <th>Danh mục</th>
                                        <th className="text-center">Tùy chỉnh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.length > 0 ? (
                                        currentData.map((product, index) => (
                                            <tr key={product.id}>
                                                <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                                <td>
                                                    <img src={product.image} alt={product.name} className={cx('product-image')} />
                                                    <span className="ms-2">{product.name}</span>
                                                </td>
                                                <td>{renderStatusBadge(product.stock)}</td>
                                                <td className="text-center fw-bold">{product.stock}</td>
                                                <td>{formatCurrency(product.price)}</td>
                                                <td>{product.category}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-primary" size="sm" className="me-2" title="Sửa" onClick={() => handleShowEditModal(product)}>
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" title="Xóa" onClick={() => handleShowDeleteModal(product.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4">Không tìm thấy sản phẩm nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {processedProducts.length > ITEMS_PER_PAGE && (
                    <div className="mt-4">
                        <Pagination currentPage={currentPage} totalPageCount={maxPage} onPageChange={page => jump(page)} />
                    </div>
                )}
            </div>

            {/* --- CÁC MODAL --- */}
            {showFormModal && (
                <ProductFormModal
                    show={showFormModal}
                    handleClose={handleCloseModals}
                    onSave={handleSaveProduct}
                    productToEdit={editingProduct}
                    categories={productCategories.filter(c => c !== 'Tất cả')} // Truyền danh sách category vào form
                />
            )}

            <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {productToDelete && <img src={productToDelete.image} alt={productToDelete.name} className={cx('product-image-large', 'mb-3')} />}
                    <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>"{productToDelete?.name}"</strong>?</p>
                    <p className="text-danger">Hành động này không thể hoàn tác.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals}>Hủy</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Xác nhận Xóa</Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminProductsPage;