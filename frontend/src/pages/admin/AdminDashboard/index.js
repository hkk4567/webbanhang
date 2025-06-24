import React, { useState, useEffect } from 'react';
import { Modal, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AdminDashboard.module.scss';

// Import các component con
import StatCard from './components/StatCard';
import ChartCard from './components/ChartCard';
import TableCard from './components/TableCard';

import {
    getOverviewStats,
    getTopProducts,
    getTopCustomers,
    getProductSalesDetails
} from '../../../api/statsService';

import { getOrdersByUserId } from '../../../api/orderService';
const cx = classNames.bind(styles);
function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        productsSold: 0,
        newCustomers: 0,
        pendingOrders: 0,
    });
    const [topSelling, setTopSelling] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topFlop, setTopFlop] = useState([]);
    // State quản lý loading và lỗi
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho Modal (giữ nguyên)
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const navigate = useNavigate();
    // --- BƯỚC 3: useEffect ĐỂ GỌI TẤT CẢ API KHI MOUNT ---
    useEffect(() => {
        const testApis = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // --- TEST TỪNG API MỘT ---
                const overviewRes = await getOverviewStats();
                setStats(overviewRes.data.data);

                const topSellingRes = await getTopProducts({ limit: 5, sort: 'desc' });
                setTopSelling(topSellingRes.data.data.products);

                const topFlopRes = await getTopProducts({ limit: 5, sort: 'asc' });
                setTopFlop(topFlopRes.data.data.products);

                const topCustomersRes = await getTopCustomers({ limit: 5 });
                setTopCustomers(topCustomersRes.data.data.customers);


            } catch (err) {
                // Log ra lỗi từ Axios để xem chi tiết
                if (err.response) {
                    setError(err.response.data.message || "Có lỗi xảy ra.");
                } else if (err.request) {
                    setError("Không nhận được phản hồi từ server.");
                } else {
                    setError("Lỗi khi thiết lập yêu cầu.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        testApis();
    }, []);  // Mảng rỗng đảm bảo chỉ chạy một lần

    const handleCloseModal = () => {
        setShowModal(false);
        // Reset content để tránh hiển thị nội dung cũ khi mở lại
        setModalContent(null);
        setModalTitle('');
    };

    // --- HÀM XỬ LÝ KHI CLICK VÀO NÚT "XEM HÓA ĐƠN" ---
    const handleViewCustomerOrders = async (customer) => {
        console.log('Clicked on customer:', customer);

        setModalTitle(`Đơn hàng của: ${customer.fullName}`);
        setShowModal(true); // Mở modal ngay
        setIsModalLoading(true); // Bật spinner trong modal
        setError(null); // Reset lỗi cũ

        try {
            // Gọi API lấy 5 đơn hàng gần nhất của khách hàng này
            const response = await getOrdersByUserId(customer.id, { limit: 5, sort: '-created_at' });
            const orders = response.data.data.orders;

            // Tạo nội dung JSX từ dữ liệu API
            const customerOrdersContent = (
                orders.length > 0 ? (
                    <ListGroup variant="flush">
                        {orders.map(order => (
                            <ListGroup.Item key={order.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Link to={`/admin/orders?search=${order.id}`}>Đơn hàng #{order.id}</Link>
                                    <small className="d-block text-muted">Ngày: {new Date(order.created_at).toLocaleDateString('vi-VN')}</small>
                                </div>
                                <Badge bg="success">{formatCurrency(order.totalPrice)}</Badge>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p>Khách hàng này chưa có đơn hàng nào.</p>
                )
            );
            setModalContent(customerOrdersContent);
        } catch (err) {
            setModalContent(<Alert variant="danger">Không thể tải lịch sử đơn hàng.</Alert>);
        } finally {
            setIsModalLoading(false); // Tắt spinner trong modal
        }
    };

    // --- SỬA LẠI HÀM XỬ LÝ KHI CLICK "XEM CHI TIẾT" SẢN PHẨM ---
    const handleViewOrdersForProduct = (product) => {
        // Không cần encodeURIComponent nữa vì ID là một con số an toàn
        navigate(`/admin/orders?productId=${product.id}`);
    };
    const handleViewProductSales = async (product) => {
        setModalTitle(`Thống kê bán hàng: ${product.name}`);
        setShowModal(true);
        setIsModalLoading(true);
        setError(null);

        try {
            const response = await getProductSalesDetails(product.id);
            const details = response.data.data;

            // Nâng cấp nội dung modal để chứa cả thông tin và nút hành động
            const productSalesDetailsContent = (
                <>
                    {/* Phần thông tin thống kê giữ nguyên */}
                    <div>
                        <p>Tổng số lượng đã bán: <strong>{details.totalQuantitySold.toLocaleString('vi-VN')}</strong></p>
                        <p>Số đơn hàng có chứa sản phẩm: <strong>{details.orderCount.toLocaleString('vi-VN')}</strong></p>
                    </div>

                    <hr /> {/* Thêm một đường kẻ để phân cách */}

                    {/* Phần nút hành động mới */}
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                // 1. Đóng modal hiện tại
                                handleCloseModal();
                                // 2. Điều hướng đến trang orders
                                handleViewOrdersForProduct(product);
                            }}
                        >
                            <i className="bi bi-card-list me-2"></i>
                            Xem các đơn hàng chứa sản phẩm này
                        </button>
                    </div>
                </>
            );
            setModalContent(productSalesDetailsContent);
        } catch (err) {
            setModalContent(<Alert variant="danger">Không thể tải dữ liệu thống kê.</Alert>);
        } finally {
            setIsModalLoading(false);
        }
    };
    const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });


    // --- BƯỚC 4: RENDER JSX VỚI DỮ LIỆU THẬT ---
    if (isLoading) {
        return (
            <main className={cx('main-content', 'text-center', 'p-5')}>
                <Spinner animation="border" />
                <h3 className="mt-3">Đang tải dữ liệu Dashboard...</h3>
            </main>
        );
    }

    if (error) {
        return (
            <main className={cx('main-content', 'p-5')}>
                <Alert variant="danger">{error}</Alert>
            </main>
        );
    }
    return (
        <main className={cx('main-content')}>
            <h1 className="fw-bold mb-4">Tổng quan</h1>

            {/* Section 1: Thống kê nhanh */}
            <div className="row">
                <StatCard title="Tổng doanh thu tháng" value={formatCurrency(stats.revenue)} linkTo="#sales-chart" />
                <StatCard title="Sản phẩm đã bán" value={stats.productsSold.toLocaleString('vi-VN')} unit="sản phẩm" linkTo="#product-stats" />
                <StatCard title="Khách hàng mới" value={stats.newCustomers.toLocaleString('vi-VN')} linkTo="#customer-stats" />
                <StatCard title="Đơn hàng chờ xử lý" value={stats.pendingOrders.toLocaleString('vi-VN')} linkTo="/admin/orders" />
            </div>

            {/* Section 2: Biểu đồ doanh thu */}
            <div id="sales-chart" className="my-5">
                <div className="row">
                    <div className="col-12">
                        <ChartCard />
                    </div>
                </div>
            </div>

            {/* Section 3: Thống kê sản phẩm */}
            <div id="product-stats" className="my-5">
                <div className="row">
                    <div className="col-md-6 mb-4">
                        <TableCard
                            title="Top 5 sản phẩm bán chạy"
                            headers={['#', 'Tên sản phẩm', 'Số lượng đã bán']}
                            // Chuyển đổi dữ liệu API thành định dạng mà TableCard cần
                            data={topSelling.map((product, index) => [
                                index + 1,
                                product.name,
                                product.totalSold.toLocaleString('vi-VN') // Giả sử API trả về `totalSold`
                            ])}
                            action={{ label: 'Xem chi tiết' }}
                            // Truyền cả ID và tên để hiển thị trên modal
                            onActionClick={(product) => handleViewProductSales(product)}
                            originalData={topSelling} // Truyền dữ liệu gốc để lấy ID
                        />
                    </div>
                    <div className="col-md-6 mb-4">
                        <TableCard
                            title="Top 5 sản phẩm bán ít nhất"
                            headers={['#', 'Tên sản phẩm', 'Số lượng đã bán']}
                            data={topFlop.map((product, index) => [
                                index + 1,
                                product.name,
                                product.totalSold.toLocaleString('vi-VN')
                            ])}
                            action={{ label: 'Xem chi tiết' }}
                            onActionClick={(product) => handleViewProductSales(product)}
                            originalData={topFlop} // Dùng dữ liệu từ state topFlop
                        />
                    </div>
                </div>
            </div>

            {/* Section 4: Thống kê khách hàng */}
            <div id="customer-stats" className="my-5">
                <TableCard
                    title="Top 5 khách hàng thân thiết"
                    headers={['#', 'Tên khách hàng', 'Tổng chi tiêu']}
                    data={topCustomers.map((customer, index) => [
                        index + 1,
                        customer.fullName,
                        formatCurrency(customer.totalSpent) // Giả sử API trả về `totalSpent`
                    ])}
                    action={{ label: 'Xem hóa đơn' }}
                    onActionClick={(customer) => handleViewCustomerOrders(customer)}
                    originalData={topCustomers} // Truyền dữ liệu gốc để lấy ID
                />
            </div>

            {/* --- MODAL ĐA NĂNG ĐỂ HIỂN THỊ CHI TIẾT --- */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isModalLoading ? (
                        <div className="text-center"><Spinner animation="border" /></div>
                    ) : (
                        modalContent
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={handleCloseModal}>
                        Đóng
                    </button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminDashboard;