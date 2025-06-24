import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Spinner } from 'react-bootstrap';

// Import các component, hook và API service
import Pagination from '../../../components/common/Pagination';
import CategoryFormModal from './components/CategoryFormModal';
import { usePagination } from '../../../hooks/usePaginationAPI';
import { useDebounce } from '../../../hooks/useDebounce';
// Giả sử API service đã được tạo
import {
    getAdminCategories, // <<< Dùng hàm mới
    createCategory,
    updateCategory,
    deleteCategory
} from '../../../api/categoryService';

const ITEMS_PER_PAGE = 10;

function AdminCategoriesPage() {
    // --- STATE TỪ API ---
    const [categories, setCategories] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false); // Dùng cho Xóa, Sửa...
    const [error, setError] = useState(null);

    // --- STATE ĐIỀU KHIỂN ---
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { requestedPage, paginationProps, goToPage } = usePagination(paginationData);

    // --- STATE MODAL ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // --- HÀM GỌI API ---
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: requestedPage,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearchTerm,
                sort: '-created_at',
            };
            // Gọi đúng hàm getAdminCategories
            const response = await getAdminCategories(params); // <<< Sửa ở đây
            setCategories(response.data.data.categories);
            setPaginationData(response.data.data.pagination);
        } catch (err) {
            setError('Không thể tải danh sách danh mục.');
        } finally {
            setIsLoading(false);
        }
    }, [requestedPage, debouncedSearchTerm]);

    // Effect gọi API chính
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Effect reset trang khi bộ lọc thay đổi
    useEffect(() => {
        goToPage(1);
    }, [debouncedSearchTerm, goToPage]);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditingCategory(null);
        setDeletingCategory(null);
    };

    const handleShowAddModal = () => {
        setEditingCategory(null);
        setShowFormModal(true);
    };

    const handleShowEditModal = (category) => {
        setEditingCategory(category);
        setShowFormModal(true);
    };

    const handleShowDeleteModal = (category) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    const handleSaveCategory = async (formData) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
            } else {
                await createCategory(formData);
            }
            handleCloseModals();
            fetchCategories(); // Tải lại dữ liệu
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi: Không thể lưu danh mục.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCategory) return;

        setIsActionLoading(true);
        try {
            await deleteCategory(deletingCategory.id);
            handleCloseModals();
            if (categories.length === 1 && requestedPage > 1) {
                goToPage(requestedPage - 1);
            } else {
                fetchCategories();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi: Không thể xóa danh mục. Có thể có sản phẩm đang thuộc danh mục này.');
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <Row className="mb-3 align-items-center">
                    <Col>
                        <h1 className="fw-bold mb-0">Quản lý Danh mục</h1>
                    </Col>
                    <Col xs="auto">
                        <Button variant="primary" onClick={handleShowAddModal}>
                            <i className="bi bi-plus-circle me-2"></i> Thêm danh mục
                        </Button>
                    </Col>
                </Row>

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <Row>
                            <Col lg={6}>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                    <Form.Control type="text" placeholder="Tìm theo tên danh mục..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </InputGroup>
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
                                        <th>Tên danh mục</th>
                                        <th>Ngày tạo</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="5" className="text-center p-5"><Spinner animation="border" /></td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="5" className="text-center p-5 text-danger">{error}</td></tr>
                                    ) : categories.length > 0 ? (
                                        categories.map((cat, index) => (
                                            <tr key={cat.id}>
                                                <td>{((paginationData.currentPage - 1) * ITEMS_PER_PAGE) + index + 1}</td>
                                                <td className="fw-medium">{cat.name}</td>
                                                <td>{new Date(cat.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-primary" size="sm" className="me-2" title="Sửa" onClick={() => handleShowEditModal(cat)}>
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" title="Xóa" onClick={() => handleShowDeleteModal(cat)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center p-5">Chưa có danh mục nào.</td></tr>
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
                <CategoryFormModal
                    show={showFormModal}
                    handleClose={handleCloseModals}
                    onSave={handleSaveCategory}
                    categoryToEdit={editingCategory}
                />
            )}

            <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn xóa danh mục <strong>"{deletingCategory?.name}"</strong>?</p>
                    <p className="text-danger small">Hành động này có thể thất bại nếu có sản phẩm đang thuộc danh mục này.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals} disabled={isActionLoading}>Hủy</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm} disabled={isActionLoading}>
                        {isActionLoading ? <><Spinner as="span" size="sm" /> Đang xóa...</> : 'Xác nhận Xóa'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminCategoriesPage;