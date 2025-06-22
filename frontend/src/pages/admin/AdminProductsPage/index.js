import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Spinner, Image } from 'react-bootstrap';
import classNames from 'classnames/bind';
import styles from './AdminProductsPage.module.scss';

// Import các component, hook và API service
import Pagination from '../../../components/common/Pagination';
import ProductFormModal from './components/ProductFormModal';
import { usePagination } from '../../../hooks/usePaginationAPI';
import { useDebounce } from '../../../hooks/useDebounce';
import { getAdminProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../../api/productService';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;

// Các bộ lọc sẽ được gửi lên API
const statusFilters = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Đã ẩn', value: 'inactive' },
    { label: 'Hết hàng', value: 'out_of_stock' },
];

function AdminProductsPage() {
    // --- STATE TỪ API ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    // --- STATE ĐIỀU KHIỂN ---
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortOrder, setSortOrder] = useState('-created_at');
    const { requestedPage, paginationProps, goToPage } = usePagination(paginationData);

    // --- STATE MODAL ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);

    // --- HÀM GỌI API ---
    const fetchApiData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Lấy danh sách sản phẩm và danh mục đồng thời
            const params = {
                page: requestedPage,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearchTerm,
                categoryId: filterCategory,
                status: filterStatus,
                sort: sortOrder,
            };

            const [prodResponse, catResponse] = await Promise.all([
                getAdminProducts(params),
                categories.length === 0 ? getCategories() : Promise.resolve(null),
            ]);

            setProducts(prodResponse.data.data.products);
            setPaginationData(prodResponse.data.data.pagination);
            if (catResponse) {
                setCategories(catResponse.data.data.categories);
            }

        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [requestedPage, debouncedSearchTerm, filterCategory, filterStatus, sortOrder, categories.length]);

    // Effect gọi API chính
    useEffect(() => {
        fetchApiData();
    }, [fetchApiData]);

    // Effect reset trang khi bộ lọc thay đổi
    useEffect(() => {
        goToPage(1);
    }, [debouncedSearchTerm, filterCategory, filterStatus, sortOrder, goToPage]);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleSortRequest = (key) => {
        // key bây giờ là 'name', 'price', 'status', 'quantity', 'created_at'
        const currentSort = sortOrder;

        // Nếu đang sắp xếp theo key này và là tăng dần, đổi thành giảm dần
        if (currentSort === `${key}-asc` || currentSort === key) {
            setSortOrder(`${key}-desc`);
        }
        // Ngược lại, đổi thành tăng dần
        else {
            setSortOrder(`${key}-asc`);
        }
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditingProduct(null);
        setDeletingProduct(null);
    };

    const handleShowAddModal = () => {
        setEditingProduct(null);
        setShowFormModal(true);
    };

    const handleShowEditModal = (product) => {
        setEditingProduct(product);
        setShowFormModal(true);
    };

    const handleShowDeleteModal = (product) => {
        setDeletingProduct(product);
        setShowDeleteModal(true);
    };

    const handleSaveProduct = async (formData) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
            } else {
                await createProduct(formData);
            }
            handleCloseModals();
            fetchApiData(); // Tải lại dữ liệu
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi: Không thể lưu sản phẩm.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingProduct) return;

        setIsDeleting(true); // <<== BẮT ĐẦU LOADING

        try {
            await deleteProduct(deletingProduct.id);
            handleCloseModals();
            // Tải lại dữ liệu sau khi xóa thành công
            if (products.length === 1 && requestedPage > 1) {
                goToPage(requestedPage - 1);
            } else {
                // Phải gọi lại fetchApiData để nó chạy lại
                // Chúng ta sẽ cần điều chỉnh lại fetchApiData một chút
                fetchApiData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi: Không thể xóa sản phẩm.');
        } finally {
            setIsDeleting(false); // <<== KẾT THÚC LOADING (dù thành công hay thất bại)
        }
    };

    // --- CÁC HÀM HỖ TRỢ RENDER ---
    const getSortIcon = (key) => {
        if (sortOrder.includes(key)) {
            return sortOrder.endsWith('-asc') ?
                <i className="bi bi-sort-up ms-1"></i> :
                <i className="bi bi-sort-down ms-1"></i>;
        }
        return <i className="bi bi-arrow-down-up ms-1 text-muted"></i>;
    };

    const renderStatusBadge = (status) => {
        const variants = {
            'active': { bg: 'success', text: 'Đang hoạt động' },
            'inactive': { bg: 'secondary', text: 'Đã ẩn' },
            'out_of_stock': { bg: 'warning', text: 'Hết hàng' },
        };
        const variant = variants[status] || { bg: 'light', text: 'Không xác định' };
        return <span className={`badge bg-${variant.bg}`}>{variant.text}</span>;
    };

    const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <Row className="mb-3">
                    <Col>
                        <h1 className="fw-bold mb-0">Quản lý Sản phẩm</h1>
                    </Col>
                    <Col className="text-end">
                        <Button variant="primary" onClick={handleShowAddModal}>
                            <i className="bi bi-plus-circle me-2"></i> Thêm sản phẩm
                        </Button>
                    </Col>
                </Row>

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <Row className="g-3">
                            <Col lg={5}>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                    <Form.Control type="text" placeholder="Tìm theo tên sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </InputGroup>
                            </Col>
                            <Col lg={4} md={6}>
                                <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </Form.Select>
                            </Col>
                            <Col lg={3} md={6}>
                                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    {statusFilters.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light" style={{ userSelect: 'none' }}>
                                    <tr>
                                        <th>STT</th>
                                        <th onClick={() => handleSortRequest('name')} className="cursor-pointer">Tên sản phẩm {getSortIcon('name')}</th>
                                        <th onClick={() => handleSortRequest('status')} className="cursor-pointer">Trạng thái {getSortIcon('status')}</th>
                                        <th onClick={() => handleSortRequest('quantity')} className="cursor-pointer text-center">Tồn kho {getSortIcon('quantity')}</th>
                                        <th onClick={() => handleSortRequest('price')} className="cursor-pointer">Giá bán {getSortIcon('price')}</th>
                                        <th>Danh mục</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="7" className="text-center p-5"><Spinner animation="border" /></td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="7" className="text-center p-5 text-danger">{error}</td></tr>
                                    ) : products.length > 0 ? (
                                        products.map((product, index) => (
                                            <tr key={product.id}>
                                                <td>{((paginationData.currentPage - 1) * ITEMS_PER_PAGE) + index + 1}</td>
                                                <td>
                                                    <Image src={product.imageUrl || 'https://via.placeholder.com/60'} alt={product.name} className={cx('product-image')} rounded />
                                                    <span className="ms-2 fw-medium">{product.name}</span>
                                                </td>
                                                <td>{renderStatusBadge(product.status)}</td>
                                                <td className="text-center fw-bold">{product.quantity}</td>
                                                <td>{formatCurrency(product.price)}</td>
                                                <td>{product.category?.name || 'N/A'}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-primary" size="sm" className="me-2" title="Sửa" onClick={() => handleShowEditModal(product)}>
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" title="Xóa" onClick={() => handleShowDeleteModal(product)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="text-center p-5">Không tìm thấy sản phẩm nào khớp.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {!isLoading && paginationData.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination {...paginationProps} />
                    </div>
                )}
            </div>

            {showFormModal && (
                <ProductFormModal
                    show={showFormModal}
                    handleClose={handleCloseModals}
                    onSave={handleSaveProduct}
                    productToEdit={editingProduct}
                    categories={categories}
                />
            )}

            <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {deletingProduct && <Image src={deletingProduct.imageUrl || 'https://via.placeholder.com/150'} alt={deletingProduct.name} className={cx('product-image-large', 'mb-3')} rounded />}
                    <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deletingProduct?.name}"</strong>?</p>
                    <p className="text-danger small">Hành động này sẽ ẩn sản phẩm nếu đã có người mua, hoặc xóa vĩnh viễn nếu chưa có.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals}>Hủy</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                <span className="ms-2">Đang xóa...</span>
                            </>
                        ) : (
                            'Xác nhận Xóa'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminProductsPage;