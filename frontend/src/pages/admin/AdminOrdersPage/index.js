import React, { useState, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import classNames from 'classnames/bind';
import styles from './AdminOrdersPage.module.scss';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';
import AddressSelector from '../../../components/common/AddressSelector';
import { mockAllOrders } from '../../../data/orders';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;
const orderStatusesForSelect = ['Chưa xử lý', 'Đã xác nhận', 'Đang giao', 'Giao thành công', 'Đã hủy'];
const orderStatusesForFilter = ['Tất cả', ...orderStatusesForSelect];
const statusTransitions = {
    'Chưa xử lý': ['Đã xác nhận', 'Đang giao', 'Giao thành công', 'Đã hủy'],
    'Đã xác nhận': ['Đang giao', 'Giao thành công', 'Đã hủy'],
    'Đang giao': ['Giao thành công', 'Đã hủy'],
    // 'Giao thành công' và 'Đã hủy' là trạng thái cuối, không có trong key
};
// --- Initial State for Filters ---
const initialFilters = {
    status: 'all',
    address: { city: '', district: '', ward: '' },
    date: { start: '', end: '' }
};
function AdminOrdersPage() {
    // --- STATE QUẢN LÝ DỮ LIỆU VÀ GIAO DIỆN ---
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState(mockAllOrders); // Quản lý danh sách đơn hàng bằng state
    // --- STATE Lọc ---
    const [filters, setFilters] = useState(initialFilters);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [addressSelectorKey, setAddressSelectorKey] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    // --- phần khác ---
    const [currentStatusInModal, setCurrentStatusInModal] = useState(''); // State riêng cho dropdown trong modal
    function removeDiacritics(str) {
        return str
            .normalize('NFD') // Tách ký tự và dấu (e.g., 'ệ' -> 'e' + '̣')
            .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
            .replace(/đ/g, 'd').replace(/Đ/g, 'D'); // Chuyển 'đ' thành 'd'
    }
    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredOrders = useMemo(() => {
        // Chuẩn bị từ khóa tìm kiếm: chuyển về chữ thường, bỏ dấu, và xóa khoảng trắng thừa
        const lowerCaseSearchTerm = removeDiacritics(searchTerm.toLowerCase().trim());

        return orders.filter(order => {
            // 1. Logic tìm kiếm (MỚI)
            const searchMatch = !lowerCaseSearchTerm ||
                order.id.toLowerCase().includes(lowerCaseSearchTerm) ||
                removeDiacritics(order.customerName.toLowerCase()).includes(lowerCaseSearchTerm) ||
                order.phone.includes(lowerCaseSearchTerm);

            // 2. Các bộ lọc khác (Giữ nguyên)
            const statusMatch = filters.status === 'all' || order.status === filters.status;
            const cityMatch = !filters.address.city || order.address.city === filters.address.city;
            const districtMatch = !filters.address.district || order.address.district === filters.address.district;
            const wardMatch = !filters.address.ward || order.address.ward === filters.address.ward;

            const orderDate = new Date(order.date);
            const startDate = filters.date.start ? new Date(filters.date.start) : null;
            const endDate = filters.date.end ? new Date(filters.date.end) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);
            const startDateMatch = !startDate || orderDate >= startDate;
            const endDateMatch = !endDate || orderDate <= endDate;

            // Kết hợp tất cả điều kiện
            return searchMatch && statusMatch && cityMatch && districtMatch && wardMatch && startDateMatch && endDateMatch;
        });
    }, [filters, orders, searchTerm]);

    const { currentData, currentPage, maxPage, jump } = usePagination(filteredOrders, ITEMS_PER_PAGE);

    // --- CÁC HÀM XỬ LÝ ---
    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters(initialFilters);
        setDateRange({ start: '', end: '' });
        setAddressSelectorKey(prevKey => prevKey + 1);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressFilterChange = (addressData) => {
        setFilters(prev => ({ ...prev, address: addressData }));
    };

    const handleDateInputChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    // Hàm này được gọi khi nhấn nút "Áp dụng"
    const applyDateFilter = () => {
        // Cập nhật bộ lọc chính với giá trị từ state tạm
        setFilters(prev => ({ ...prev, date: dateRange }));
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setCurrentStatusInModal(order.status); // Set trạng thái ban đầu cho modal
    };

    const handleSaveStatus = () => {
        // Cập nhật trạng thái trong danh sách chính
        const updatedOrders = orders.map(order =>
            order.id === selectedOrder.id ? { ...order, status: currentStatusInModal } : order
        );
        setOrders(updatedOrders);
        alert(`Đã cập nhật trạng thái đơn hàng ${selectedOrder.id} thành "${currentStatusInModal}"`);
        setSelectedOrder(null); // Đóng modal
    };

    const formatCurrency = (amount) => amount.toLocaleString('vi-VN') + 'đ';

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <div className="row">
                    <h1 className="fw-bold mb-3">Danh sách đơn hàng</h1>
                </div>

                {/* --- BỘ LỌC --- */}
                <div className={cx('filter-section', 'card', 'mb-4')}>
                    <div className="card-body">
                        <Form>
                            <Row className="g-3 align-items-end">
                                {/* Search Input */}
                                <Col lg={4} md={12}>
                                    <Form.Group controlId="searchTerm">
                                        <Form.Label className="fw-bold">Tìm kiếm</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Mã đơn, Tên KH, SĐT..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Status Filter */}
                                <Col lg={3} md={6}>
                                    <Form.Group controlId="statusFilter">
                                        <Form.Label className="fw-bold">Trạng thái</Form.Label>
                                        <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                                            {orderStatusesForFilter.map(status => <option key={status} value={status === 'Tất cả' ? 'all' : status}>{status}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Date Range Filter */}
                                <Col lg={5} md={6}>
                                    <Form.Label className="fw-bold">Khoảng ngày đặt</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="date" name="start" value={dateRange.start} onChange={handleDateInputChange} />
                                        <Form.Control type="date" name="end" value={dateRange.end} onChange={handleDateInputChange} />
                                        <Button variant="primary" onClick={applyDateFilter}>Áp dụng</Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            {/* Address Selector */}
                            <Row className="mt-3">
                                <Col>
                                    <Form.Label className="fw-bold">Lọc theo địa chỉ</Form.Label>
                                    <AddressSelector key={addressSelectorKey} onChange={handleAddressFilterChange} />
                                </Col>
                            </Row>

                            {/* Action Buttons */}
                            <Row className="mt-3">
                                <Col className="text-end">
                                    <Button variant="outline-secondary" onClick={handleResetFilters}>
                                        <i className="bi bi-arrow-clockwise"></i> Xóa bộ lọc
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>
                {/* --- BẢNG DỮ LIỆU --- */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên khách hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Địa chỉ</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.length > 0 ? (
                                        currentData.map((order, index) => (
                                            <tr key={order.id}>
                                                <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                                <td>{order.customerName}</td>
                                                <td>{order.date}</td>
                                                <td>{`${order.address.ward}, ${order.address.district}, ${order.address.city}`}</td>
                                                <td>{order.total.toLocaleString('vi-VN')}đ</td>
                                                <td>
                                                    <span
                                                        className={cx(
                                                            'status-badge',
                                                            `status--${removeDiacritics(order.status).replace(/\s+/g, '-').toLowerCase()}`
                                                        )}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <Button variant="outline-info" size="sm" onClick={() => handleViewDetails(order)}>
                                                        <i className="bi bi-eye"></i> Xem
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4">Không tìm thấy đơn hàng nào.</td>
                                        </tr>
                                    )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <Pagination currentPage={currentPage} totalPageCount={maxPage} onPageChange={page => jump(page)} />
                </div>
            </div>

            {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
            <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} size="lg" centered>
                {selectedOrder && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>Chi tiết đơn hàng: {selectedOrder.id}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Row>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Tên khách hàng</Form.Label><Form.Control type="text" value={selectedOrder.customerName} disabled /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control type="text" value={selectedOrder.phone} disabled /></Form.Group></Col>
                                    <Col xs={12}><Form.Group className="mb-3"><Form.Label>Địa chỉ giao hàng</Form.Label><Form.Control type="text" value={`${selectedOrder.address.street}, ${selectedOrder.address.ward}, ${selectedOrder.address.district}, ${selectedOrder.address.city}`} disabled /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Ngày đặt hàng</Form.Label><Form.Control type="text" value={selectedOrder.date} disabled /></Form.Group></Col>
                                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Phương thức thanh toán</Form.Label><Form.Control type="text" value={selectedOrder.paymentMethod} disabled /></Form.Group></Col>

                                    <Col xs={12}>
                                        <Form.Label>Sản phẩm đã đặt</Form.Label>
                                        <div className={cx('product-list-modal')}>
                                            {selectedOrder.products.map(p => (
                                                <p key={p.id}>
                                                    {p.name} (x{p.quantity}) - <strong>{formatCurrency(p.price * p.quantity)}</strong>
                                                </p>
                                            ))}
                                        </div>
                                    </Col>

                                    <Col md={4} className="mt-3">
                                        <Form.Group>
                                            <Form.Label>Tổng số lượng</Form.Label>
                                            <Form.Control type="text" value={selectedOrder.products.reduce((total, p) => total + p.quantity, 0)} disabled />
                                        </Form.Group>
                                    </Col>

                                    <Col md={8} className="mt-3">
                                        <Form.Group>
                                            <Form.Label>Tình trạng đơn hàng</Form.Label>
                                            {(selectedOrder.status === 'Giao thành công' || selectedOrder.status === 'Đã hủy') ? (
                                                // Nếu là trạng thái cuối, hiển thị text và vô hiệu hóa
                                                <Form.Control type="text" value={selectedOrder.status} disabled />
                                            ) : (
                                                // Nếu không, hiển thị dropdown với các lựa chọn hợp lệ
                                                <Form.Select value={currentStatusInModal} onChange={(e) => setCurrentStatusInModal(e.target.value)}>
                                                    {/* Luôn hiển thị trạng thái hiện tại */}
                                                    <option value={selectedOrder.status}>{selectedOrder.status}</option>

                                                    {/* Hiển thị các trạng thái tiếp theo có thể chuyển đến */}
                                                    {statusTransitions[selectedOrder.status].map(nextStatus => (
                                                        <option key={nextStatus} value={nextStatus}>
                                                            {nextStatus}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12} className="mt-3">
                                        <Form.Group>
                                            <Form.Label>Ghi chú đơn hàng</Form.Label>
                                            <Form.Control as="textarea" rows={3} value={selectedOrder.note} disabled />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Hủy Bỏ</Button>
                            <Button variant="success" onClick={handleSaveStatus}>Lưu thay đổi</Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </main>
    );
}

export default AdminOrdersPage;