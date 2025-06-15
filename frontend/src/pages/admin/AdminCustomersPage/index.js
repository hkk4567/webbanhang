import React, { useState, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';
import CustomerFormModal from './components/CustomerFormModal';
// Cập nhật mock data để có thêm thông tin
import { mockAllCustomers } from '../../../data/customers';

const ITEMS_PER_PAGE = 10;
// Định nghĩa các loại khách hàng để lọc
const customerTypes = ['Tất cả', 'Thường', 'Thân thiết', 'VIP'];

function AdminCustomersPage() {
    const [customers, setCustomers] = useState(mockAllCustomers);
    // --- STATE MỚI CHO UX ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Tất cả');
    const [sortConfig, setSortConfig] = useState({ key: 'joinDate', direction: 'descending' }); // Sắp xếp mặc định theo ngày tham gia mới nhất

    // --- State cho Modal ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);

    // --- LOGIC XỬ LÝ DỮ LIỆU: TÌM KIẾM, LỌC, SẮP XẾP ---
    const processedCustomers = useMemo(() => {
        let filteredCustomers = [...customers];

        // 1. Lọc theo loại khách hàng
        if (filterType !== 'Tất cả') {
            filteredCustomers = filteredCustomers.filter(c => c.type === filterType);
        }

        // 2. Tìm kiếm
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredCustomers = filteredCustomers.filter(c =>
                c.name.toLowerCase().includes(lowercasedTerm) ||
                c.email.toLowerCase().includes(lowercasedTerm) ||
                c.id.toLowerCase().includes(lowercasedTerm) ||
                c.phone?.includes(lowercasedTerm)
            );
        }

        // 3. Sắp xếp
        if (sortConfig.key) {
            filteredCustomers.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Xử lý sắp xếp ngày tháng
                if (sortConfig.key === 'joinDate') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredCustomers;
    }, [customers, searchTerm, filterType, sortConfig]);

    const { currentData, currentPage, maxPage, jump } = usePagination(processedCustomers, ITEMS_PER_PAGE);

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

    const renderTypeBadge = (type) => {
        const variants = {
            'Admin': 'danger',
            'VIP': 'warning',
            'Thân thiết': 'success',
            'Thường': 'secondary'
        };
        return <span className={`badge bg-${variants[type] || 'light'}`}>{type}</span>
    };

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditingCustomer(null);
        setDeletingCustomerId(null);
    };

    const handleShowAddModal = () => {
        setEditingCustomer(null);
        setShowFormModal(true);
    };

    const handleShowEditModal = (customer) => {
        setEditingCustomer(customer);
        setShowFormModal(true);
    };

    const handleShowDeleteModal = (id) => {
        setDeletingCustomerId(id);
        setShowDeleteModal(true);
    };

    const handleSaveCustomer = (customerData) => {
        let message = '';
        if (customerData.id) {
            setCustomers(customers.map(c => (c.id === customerData.id ? { ...c, ...customerData } : c)));
            message = `Đã cập nhật thông tin khách hàng ${customerData.name}!`;
        } else {
            const newCustomer = { ...customerData, id: `KH${Date.now()}`, joinDate: new Date().toISOString() };
            setCustomers([newCustomer, ...customers]);
            message = `Đã thêm khách hàng mới ${customerData.name}!`;
        }
        alert(message); // Có thể thay thế bằng react-toastify
    };

    const handleDeleteConfirm = () => {
        const customerToDelete = customers.find(c => c.id === deletingCustomerId);
        if (customerToDelete) {
            setCustomers(customers.filter(c => c.id !== deletingCustomerId));
            alert(`Đã xóa khách hàng ${customerToDelete.name}.`); // Cụ thể hơn
        }
        handleCloseModals();
    };

    // Tìm khách hàng để hiển thị tên trong modal xóa
    const customerToDelete = customers.find(c => c.id === deletingCustomerId);

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <div className="row">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="fw-bold mb-0">Danh sách khách hàng</h1>
                        <Button variant="primary" onClick={handleShowAddModal}>
                            <i className="bi bi-person-plus-fill me-2"></i> Thêm khách hàng
                        </Button>
                    </div>
                </div>

                {/* --- KHU VỰC TÌM KIẾM VÀ LỌC --- */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <Row className="g-3">
                            <Col md={7}>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm theo tên, email, ID, SĐT..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={5}>
                                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    {customerTypes.map(type => <option key={type} value={type}>{type === 'Tất cả' ? 'Tất cả loại khách hàng' : type}</option>)}
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
                                        <th onClick={() => requestSort('id')} className="cursor-pointer">ID{getSortIcon('id')}</th>
                                        <th onClick={() => requestSort('name')} className="cursor-pointer">Tên khách hàng{getSortIcon('name')}</th>
                                        <th>Loại</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th onClick={() => requestSort('joinDate')} className="cursor-pointer">Ngày tham gia{getSortIcon('joinDate')}</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.length > 0 ? (
                                        currentData.map((customer, index) => (
                                            <tr key={customer.id}>
                                                <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                                <td><strong>{customer.id}</strong></td>
                                                <td>{customer.name}</td>
                                                <td>{renderTypeBadge(customer.type)}</td>
                                                <td>{customer.email}</td>
                                                <td>{customer.phone || 'N/A'}</td>
                                                <td>{new Date(customer.joinDate).toLocaleDateString('vi-VN')}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-primary" size="sm" className="me-2" title="Sửa" onClick={() => handleShowEditModal(customer)}>
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" title="Xóa" onClick={() => handleShowDeleteModal(customer.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center p-4">Không tìm thấy khách hàng nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {processedCustomers.length > ITEMS_PER_PAGE && (
                    <div className="mt-4">
                        <Pagination currentPage={currentPage} totalPageCount={maxPage} onPageChange={page => jump(page)} />
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
                    Bạn có chắc chắn muốn xóa khách hàng <strong>{customerToDelete?.name}</strong> (ID: {customerToDelete?.id}) không? Hành động này không thể hoàn tác.
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