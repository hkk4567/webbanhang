import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';
import CustomerFormModal from './components/CustomerFormModal';
import { mockAllCustomers } from '../../../data/customers';

const ITEMS_PER_PAGE = 10;

function AdminCustomersPage() {
    const [customers, setCustomers] = useState(mockAllCustomers);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);

    const { currentData, currentPage, maxPage, jump } = usePagination(customers, ITEMS_PER_PAGE);

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
        if (customerData.id) {
            setCustomers(customers.map(c => (c.id === customerData.id ? { ...c, ...customerData } : c)));
        } else {
            const newCustomer = { ...customerData, id: `KH${Date.now()}` };
            setCustomers([newCustomer, ...customers]);
        }
    };

    const handleDeleteConfirm = () => {
        setCustomers(customers.filter(c => c.id !== deletingCustomerId));
        handleCloseModals();
    };

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <div className="row">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h1 className="fw-bold">Danh sách khách hàng</h1>
                        <Button variant="outline-success" onClick={handleShowAddModal}>
                            <i className="bi bi-person-plus-fill me-2"></i> Thêm khách hàng
                        </Button>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>STT</th>
                                        <th>ID</th>
                                        <th>Tên khách hàng</th>
                                        <th>Loại</th>
                                        <th>Email</th>
                                        <th>Tỉnh/Thành</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((customer, index) => (
                                        <tr key={customer.id}>
                                            <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                            <td>{customer.id}</td>
                                            <td>{customer.name}</td>
                                            <td><span className="badge bg-secondary">{customer.type}</span></td>
                                            <td>{customer.email}</td>
                                            <td>{customer.city}</td>
                                            <td className="text-center">
                                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(customer)}>
                                                    <i className="bi bi-pencil-square"></i>
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleShowDeleteModal(customer.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <Pagination currentPage={currentPage} totalPageCount={maxPage} onPageChange={page => jump(page)} />
                </div>
            </div>

            <CustomerFormModal
                show={showFormModal}
                handleClose={handleCloseModals}
                onSave={handleSaveCustomer}
                customerToEdit={editingCustomer}
            />

            <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa khách hàng này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals}>Hủy</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Xóa</Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminCustomersPage;