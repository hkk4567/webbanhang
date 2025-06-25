import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, Button, Form, Row, Col, InputGroup, Spinner, Table, Badge } from 'react-bootstrap';
import classNames from 'classnames/bind';
import styles from './AdminOrdersPage.module.scss';

// Import các component, hook và API service
import Pagination from '../../../components/common/Pagination';
import AddressSelector from '../../../components/common/AddressSelector';
import { usePagination } from '../../../hooks/usePaginationAPI';
import { useDebounce } from '../../../hooks/useDebounce';
import { getOrders, getOrderById, updateOrderStatus } from '../../../api/orderService';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;

// Dữ liệu cho bộ lọc status gửi lên API (khớp với DB)
const statusMap = {
    pending: { label: 'Chưa xử lý', bg: 'secondary' },
    processing: { label: 'Đã xác nhận', bg: 'primary' },
    shipped: { label: 'Đang giao', bg: 'info' },
    delivered: { label: 'Giao thành công', bg: 'success' },
    cancelled: { label: 'Đã hủy', bg: 'danger' },
};
const statusFilters = [{ label: 'Tất cả trạng thái', value: '' }, ...Object.entries(statusMap).map(([value, { label }]) => ({ label, value }))];

const statusTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
};

function AdminOrdersPage() {
    // --- STATE TỪ API ---
    const [orders, setOrders] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    // Lấy giá trị của tham số 'search'
    const searchQuery = searchParams.get('search');
    const productIdQuery = searchParams.get('productId');
    // --- STATE ĐIỀU KHIỂN BỘ LỌC ---
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        startDate: '',
        endDate: '',
        province: '',
        district: '',
        ward: '',
    });
    const debouncedSearch = useDebounce(filters.search, 500);
    const { requestedPage, paginationProps, goToPage } = usePagination(paginationData);
    const isInitialMount = useRef(true);
    const [addressSelectorKey, setAddressSelectorKey] = useState(Date.now()); // Key để reset AddressSelector

    // --- STATE MODAL ---
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [currentStatusInModal, setCurrentStatusInModal] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const { status, startDate, endDate, province, district, ward } = filters;
    // --- HÀM GỌI API ---
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: requestedPage,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearch,
                status, startDate, endDate, province, district, ward,
                sort: '-created_at', // Giả sử sort order cố định
            };
            if (productIdQuery) {
                params.productId = productIdQuery;
                params.forceStatus = 'delivered';
            } else if (debouncedSearch) { // Nếu không có productId thì mới dùng search
                params.search = debouncedSearch;
            } else if (searchQuery) { // Xử lý trường hợp từ link của khách hàng
                params.search = searchQuery;
            }
            const response = await getOrders(params);
            setOrders(response.data.data.orders);
            setPaginationData(response.data.data.pagination);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng.');
        } finally {
            setIsLoading(false);
        }
        // Dependency array giờ chỉ chứa các giá trị nguyên thủy
    }, [requestedPage, debouncedSearch, status, startDate, endDate, province, district, ward, searchQuery, productIdQuery]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            // Chỉ reset trang sau lần mount đầu tiên
            goToPage(1);
        }
    }, [debouncedSearch, status, startDate, endDate, province, district, ward, productIdQuery, goToPage]);

    useEffect(() => {
        // Nếu URL có productId, hãy tự động cập nhật bộ lọc trên UI
        if (productIdQuery) {
            setFilters(prev => ({
                ...prev,
                status: 'delivered' // Tự động chọn "Giao thành công" trong dropdown
            }));
        }
    }, [productIdQuery]);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressFilterChange = useCallback((addressData) => {
        // Chỉ cập nhật nếu dữ liệu thực sự thay đổi để tránh re-render thừa
        setFilters(prev => {
            if (prev.province !== addressData.provinceName ||
                prev.district !== addressData.districtName ||
                prev.ward !== addressData.wardName) {
                return {
                    ...prev,
                    province: addressData.provinceName,
                    district: addressData.districtName,
                    ward: addressData.wardName,
                };
            }
            // Nếu không có gì thay đổi, trả về state cũ để React không re-render
            return prev;
        });
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({ search: '', status: '', startDate: '', endDate: '', province: '', district: '', ward: '' });
        setAddressSelectorKey(Date.now());
    }, []);

    const handleViewDetails = async (orderId) => {
        setSelectedOrder({ id: orderId }); // Hiển thị modal với ID trước để người dùng thấy loading
        setIsLoadingDetails(true);
        try {
            const response = await getOrderById(orderId);
            setSelectedOrder(response.data.data.order);
            setCurrentStatusInModal(response.data.data.order.status);
        } catch (err) {
            alert('Không thể tải chi tiết đơn hàng.');
            setSelectedOrder(null); // Đóng modal nếu lỗi
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSaveStatus = async () => {
        if (!selectedOrder || isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        try {
            await updateOrderStatus(selectedOrder.id, currentStatusInModal);
            setSelectedOrder(null); // Đóng modal sau khi thành công
            fetchOrders(); // Tải lại danh sách để cập nhật trạng thái
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // --- HÀM HỖ TRỢ RENDER ---
    const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
    const renderStatusBadge = (status) => {
        const { bg, label } = statusMap[status] || { bg: 'light', label: 'Không rõ' };
        return <Badge bg={bg}>{label}</Badge>;
    };

    const handleShowAll = useCallback(() => {
        // 1. Reset state của các bộ lọc về giá trị ban đầu
        setFilters({
            search: '',
            status: '',
            startDate: '',
            endDate: '',
            province: '',
            district: '',
            ward: '',
        });
        // 2. Reset component AddressSelector (quan trọng để UI đồng bộ)
        setAddressSelectorKey(Date.now());
        // 3. Xóa tất cả các tham số khỏi URL (?search=..., ?status=...)
        // Đây là bước quan trọng nhất, nó sẽ kích hoạt useEffect để tải lại dữ liệu gốc
        setSearchParams({});
    }, [setSearchParams]);

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <h1 className="fw-bold mb-3">Danh sách đơn hàng</h1>

                {/* --- BỘ LỌC (GIỮ NGUYÊN DESIGN CỦA BẠN) --- */}
                <div className={cx('filter-section', 'card', 'mb-4')}>
                    <div className="card-body">
                        <Form>
                            <Row className="g-3 align-items-end">
                                <Col lg={4} md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Tìm kiếm</Form.Label>
                                        <Form.Control name="search" type="text" placeholder="Mã đơn, Tên KH, SĐT..." value={filters.search} onChange={handleFilterChange} />
                                    </Form.Group>
                                </Col>
                                <Col lg={3} md={6}>
                                    {/* Thêm class `cx('filterGroup')` vào Form.Group */}
                                    <Form.Group className={cx('filterGroup')}>
                                        <Form.Label className="fw-bold">Trạng thái</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={filters.status}
                                            onChange={handleFilterChange}
                                            disabled={!!productIdQuery}
                                        >
                                            {statusFilters.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </Form.Select>

                                        {/* Thêm class `cx('filterNotice')` vào Form.Text */}
                                        {productIdQuery && (
                                            <Form.Text muted className={cx('filterNotice')}>
                                                Nếu muốn xem tất cả, hãy bấm vào nút hiển thị tất cả.
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={5} md={6}>
                                    <Form.Label className="fw-bold">Khoảng ngày đặt</Form.Label>
                                    <InputGroup>
                                        {/* Thêm label "Từ" */}
                                        <InputGroup.Text>Từ</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={handleFilterChange}
                                            aria-label="Ngày bắt đầu"
                                        />

                                        {/* Thêm label "Đến" */}
                                        <InputGroup.Text>Đến</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={handleFilterChange}
                                            aria-label="Ngày kết thúc"
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col>
                                    <Form.Label className="fw-bold">Lọc theo địa chỉ</Form.Label>
                                    <AddressSelector key={addressSelectorKey} onChange={handleAddressFilterChange} />
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col className="text-end">
                                    {/* Nút này chỉ xóa các ô input, hữu ích khi người dùng muốn nhập lại từ đầu */}
                                    <Button variant="outline-secondary" onClick={handleResetFilters} className="me-2">
                                        <i className="bi bi-arrow-clockwise me-2"></i> Đặt lại form
                                    </Button>
                                    {/* Nút này mạnh hơn, nó sẽ xóa bộ lọc và tải lại toàn bộ danh sách */}
                                    <Button variant="primary" onClick={handleShowAll}>
                                        <i className="bi bi-list-ul me-2"></i> Hiển thị tất cả
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
                            <Table hover responsive className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Mã ĐH</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Địa chỉ giao</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="7" className="text-center p-5"><Spinner animation="border" /></td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="7" className="text-center p-5 text-danger">{error}</td></tr>
                                    ) : orders.length > 0 ? (
                                        orders.map(order => (
                                            <tr key={order.id}>
                                                <td><strong>#{order.id}</strong></td>
                                                <td>
                                                    <div>{order.shippingName}</div>
                                                    <small className="text-muted">{order.shippingPhone}</small>
                                                </td>
                                                <td>{formatDate(order.created_at)}</td>
                                                <td>{`${order.shippingStreet}, ${order.shippingWard}, ${order.shippingDistrict}, ${order.shippingProvince}`}</td>
                                                <td>{formatCurrency(order.totalPrice)}</td>
                                                <td>{renderStatusBadge(order.status)}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-info" size="sm" onClick={() => handleViewDetails(order.id)}>
                                                        <i className="bi bi-eye"></i> Xem
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="text-center p-5">Không có đơn hàng nào khớp.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* --- PHÂN TRANG --- */}
                {!isLoading && paginationData.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4"><Pagination {...paginationProps} /></div>
                )}
            </div>

            {/* --- MODAL CHI TIẾT ĐƠN HÀNG (GIỮ NGUYÊN) --- */}
            <Modal show={!!selectedOrder} onHide={() => setSelectedOrder(null)} size="lg" centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isLoadingDetails ? 'Đang tải chi tiết...' : `Chi tiết đơn hàng: #${selectedOrder?.id}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoadingDetails ? (
                        <div className="text-center p-5"><Spinner animation="border" /></div>
                    ) : selectedOrder?.id ? (
                        <Row>
                            <Col md={6} className="mb-3">
                                <h6>Thông tin khách hàng</h6>
                                <p className="mb-1"><strong>Tên:</strong> {selectedOrder.shippingName}</p>
                                <p className="mb-1"><strong>SĐT:</strong> {selectedOrder.shippingPhone}</p>
                                <p className="mb-0"><strong>Địa chỉ:</strong> {`${selectedOrder.shippingStreet}, ${selectedOrder.shippingWard}, ${selectedOrder.shippingDistrict}, ${selectedOrder.shippingProvince}`}</p>
                            </Col>
                            <Col md={6} className="mb-3">
                                <h6>Thông tin đơn hàng</h6>
                                <p className="mb-1"><strong>Ngày đặt:</strong> {formatDate(selectedOrder.created_at)}</p>
                                <p className="mb-1"><strong>Thanh toán:</strong> {selectedOrder.paymentMethod}</p>
                                <p className="mb-0"><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</p>
                            </Col>
                            <Col xs={12} className="mt-2">
                                <h6>Các sản phẩm đã đặt</h6>
                                <Table striped bordered size="sm" responsive>
                                    <thead className='table-light'><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th><th>Thành tiền</th></tr></thead>
                                    <tbody>
                                        {selectedOrder.items?.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.productName}</td>
                                                <td className='text-center'>{item.quantity}</td>
                                                <td className='text-end'>{formatCurrency(item.productPrice)}</td>
                                                <td className='text-end'>{formatCurrency(item.productPrice * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="fw-bold fs-5">
                                            <td colSpan="3" className="text-end">Tổng cộng</td>
                                            <td className='text-end'>{formatCurrency(selectedOrder.totalPrice)}</td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </Col>
                            <Col xs={12} className="mt-2">
                                <Form.Group>
                                    <Form.Label className="fw-bold">Cập nhật trạng thái đơn hàng</Form.Label>
                                    {['delivered', 'cancelled'].includes(selectedOrder.status) ? (
                                        <div className="mt-1">{renderStatusBadge(selectedOrder.status)}</div>
                                    ) : (
                                        <Form.Select value={currentStatusInModal} onChange={(e) => setCurrentStatusInModal(e.target.value)}>
                                            <option value={selectedOrder.status}>{statusMap[selectedOrder.status].label}</option>
                                            {statusTransitions[selectedOrder.status]?.map(nextStatus => (
                                                <option key={nextStatus} value={nextStatus}>{statusMap[nextStatus].label}</option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    ) : (
                        <div className="text-center p-5 text-danger">Không thể tải chi tiết đơn hàng.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedOrder(null)} disabled={isUpdatingStatus}>Đóng</Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveStatus}
                        disabled={isUpdatingStatus || isLoadingDetails || ['delivered', 'cancelled'].includes(selectedOrder?.status) || currentStatusInModal === selectedOrder?.status}
                    >
                        {isUpdatingStatus ? <><Spinner as="span" size="sm" /> Đang lưu...</> : 'Lưu thay đổi'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminOrdersPage;