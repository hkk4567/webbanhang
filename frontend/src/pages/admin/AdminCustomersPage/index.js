import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Spinner } from 'react-bootstrap';

// Import các component và hook cần thiết
import Pagination from '../../../components/common/Pagination';
import CustomerFormModal from './components/CustomerFormModal';
import { useDebounce } from '../../../hooks/useDebounce';
// Giả sử hook phân trang của bạn đã được nâng cấp cho server-side
import { usePagination } from '../../../hooks/usePaginationAPI';

// Import các hàm API từ service
import { getUsers, createUser, updateUser, deleteUser } from '../../../api/userService';

const ITEMS_PER_PAGE = 10;

function AdminCustomersPage() {
    // --- STATE QUẢN LÝ DỮ LIỆU TỪ API ---
    const [customers, setCustomers] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- STATE CHO BỘ LỌC, TÌM KIẾM, SẮP XẾP ---
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Trì hoãn 500ms
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'DESC' }); // Sắp xếp theo DB
    // filterType sẽ được gửi lên API trong tương lai, tạm thời chưa dùng
    const [roleFilter, setRoleFilter] = useState('');
    // --- STATE CHO MODAL ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCustomer, setDeletingCustomer] = useState(null);

    // --- SỬ DỤNG HOOK PHÂN TRANG CHO SERVER ---
    const { requestedPage, paginationProps, goToPage } = usePagination(paginationData);

    // --- HÀM GỌI API LẤY DỮ LIỆU ---
    const fetchCustomers = useCallback(async (pageToFetch) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: pageToFetch,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearchTerm,
                // Gửi tên trường và hướng sắp xếp lên API
                sort: `${sortConfig.direction === 'DESC' ? '-' : ''}${sortConfig.key}`,
            };
            if (roleFilter) {
                params.role = roleFilter;
            }
            const response = await getUsers(params);

            setCustomers(response.data.data.users);
            setPaginationData(response.data.data.pagination);
        } catch (err) {
            setError('Không thể tải danh sách khách hàng. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, sortConfig, roleFilter]); // Phụ thuộc vào debouncedSearchTerm và sortConfig

    // Effect chính để gọi API khi các tham số thay đổi
    useEffect(() => {
        // `requestedPage` thay đổi khi người dùng nhấn phân trang
        fetchCustomers(requestedPage);
    }, [requestedPage, fetchCustomers]);

    // Effect để reset về trang 1 khi người dùng tìm kiếm hoặc sắp xếp
    useEffect(() => {
        // Khi người dùng gõ tìm kiếm, đổi bộ lọc, hoặc đổi cách sắp xếp,
        // chúng ta gọi goToPage(1) để yêu cầu tải lại từ trang đầu.
        goToPage(1);
        // Dependency array chỉ chứa các state của bộ lọc, KHÔNG chứa requestedPage
    }, [debouncedSearchTerm, sortConfig, roleFilter, goToPage]);


    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleSortRequest = (key) => {
        let direction = 'ASC';
        if (sortConfig.key === key && sortConfig.direction === 'ASC') {
            direction = 'DESC';
        }
        setSortConfig({ key, direction });
    };

    const handleShowDeleteModal = (customer) => {
        setDeletingCustomer(customer);
        setShowDeleteModal(true);
    };

    // Các hàm xử lý modal giữ nguyên logic nhưng gọi API
    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditingCustomer(null);
        setDeletingCustomer(null);
    };

    const handleSaveCustomer = async (customerData) => {
        // Thêm logic loading cho button trong modal nếu cần
        try {
            if (customerData.id) {
                await updateUser(customerData.id, customerData);
            } else {
                await createUser(customerData);
            }
            handleCloseModals();
            fetchCustomers(requestedPage); // Tải lại trang hiện tại
        } catch (err) {
            // Hiển thị lỗi ngay trong modal thì sẽ tốt hơn
            alert('Đã xảy ra lỗi. Vui lòng kiểm tra lại thông tin.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCustomer) return;
        try {
            await deleteUser(deletingCustomer.id);
            handleCloseModals();
            // Sau khi xóa, nên quay về trang 1 hoặc tải lại trang hiện tại
            fetchCustomers(1);
            goToPage(1);
        } catch (err) {
            alert('Đã xảy ra lỗi khi xóa khách hàng.');
        }
    };


    // --- CÁC HÀM HỖ TRỢ RENDER ---
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <i className="bi bi-arrow-down-up ms-1 text-muted"></i>;
        return sortConfig.direction === 'ASC' ? <i className="bi bi-sort-up ms-1"></i> : <i className="bi bi-sort-down ms-1"></i>;
    };

    // Hàm này có thể cần cập nhật để phù hợp với dữ liệu `role` từ backend
    const renderRoleBadge = (role) => {
        const variants = {
            'admin': 'danger',
            'staff': 'warning',
            'customer': 'success',
        };
        return <span className={`badge bg-${variants[role] || 'secondary'}`}>{role}</span>;
    };


    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                {/* Header của trang */}
                <Row>
                    <Col>
                        <h1 className="fw-bold mb-3">Quản lý Khách hàng</h1>
                    </Col>
                    <Col className="text-end">
                        <Button variant="primary" onClick={() => setShowFormModal(true)}>
                            <i className="bi bi-person-plus-fill me-2"></i> Thêm mới
                        </Button>
                    </Col>
                </Row>

                {/* --- KHU VỰC TÌM KIẾM VÀ LỌC --- */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <Row>
                            <Col md={8}>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={4}>
                                <Form.Select
                                    aria-label="Lọc theo vai trò"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">Tất cả vai trò</option>
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="customer">Customer</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* --- BẢNG DỮ LIỆU --- */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th onClick={() => handleSortRequest('id')} className="cursor-pointer">ID {getSortIcon('id')}</th>
                                        <th onClick={() => handleSortRequest('fullName')} className="cursor-pointer">Tên khách hàng {getSortIcon('fullName')}</th>
                                        <th onClick={() => handleSortRequest('role')} className="cursor-pointer">Vai trò {getSortIcon('role')}</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th onClick={() => handleSortRequest('created_at')} className="cursor-pointer">Ngày tham gia {getSortIcon('created_at')}</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center p-5">
                                                <Spinner animation="border" variant="primary" />
                                                <p className="mt-2 mb-0">Đang tải dữ liệu...</p>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="8" className="text-center p-5 text-danger">
                                                <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                                                <p className="mt-2 mb-0">{error}</p>
                                            </td>
                                        </tr>
                                    ) : customers.length > 0 ? (
                                        customers.map((customer, index) => (
                                            <tr key={customer.id}>
                                                <td>{(paginationData.currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                                <td><strong>{customer.id}</strong></td>
                                                <td>{customer.fullName}</td>
                                                <td>{renderRoleBadge(customer.role)}</td>
                                                <td>{customer.email}</td>
                                                <td>{customer.phone || 'N/A'}</td>
                                                <td>{new Date(customer.createdAt).toLocaleDateString('vi-VN')}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-primary" size="sm" className="me-2" title="Sửa" onClick={() => { setEditingCustomer(customer); setShowFormModal(true); }}>
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" title="Xóa" onClick={() => handleShowDeleteModal(customer)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center p-5">
                                                <p className="mb-0">Không tìm thấy khách hàng nào.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* --- PHÂN TRANG --- */}
                {!isLoading && paginationData.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination {...paginationProps} />
                    </div>
                )}
            </div>

            {/* --- CÁC MODAL --- */}
            {showFormModal && (
                <CustomerFormModal
                    show={showFormModal}
                    handleClose={handleCloseModals}
                    onSave={handleSaveCustomer}
                    customerToEdit={editingCustomer}
                />
            )}

            <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa khách hàng <strong>{deletingCustomer?.fullName}</strong> (ID: {deletingCustomer?.id}) không? Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals}>Hủy</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Xác nhận Xóa</Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminCustomersPage;