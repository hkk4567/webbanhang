import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './AdminDashboard.module.scss';
import { Modal } from 'react-bootstrap'; // Import Modal
// Import các component con
import StatCard from './components/StatCard';
import ChartCard from './components/ChartCard';
import TableCard from './components/TableCard';

const cx = classNames.bind(styles);

// Dữ liệu giả cho các bảng
const topSellingData = {
    headers: ['#', 'Tên sản phẩm', 'Số lượng bán'],
    data: [
        [1, 'Cà Phê Sữa Đá', '1,205'],
        [2, 'Trà Đào Cam Sả', '980'],
        [3, 'Bạc Xỉu', '850'],
    ]
};
const topCustomersData = {
    headers: ['#', 'Tên khách hàng', 'Tổng chi tiêu'],
    data: [
        [1, 'Nguyễn Văn A', '5,250,000đ'],
        [2, 'Trần Thị B', '4,800,000đ'],
        [3, 'Lê Văn C', '4,100,000đ'],
    ]
};

function AdminDashboard() {
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState(null);

    const handleCloseModal = () => setShowModal(false);

    // --- HÀM XỬ LÝ KHI CLICK VÀO NÚT "XEM HÓA ĐƠN" ---
    const handleViewCustomerOrders = (customerId) => {
        setModalTitle(`Lịch sử đơn hàng của khách hàng: ${customerId}`);
        // Trong thực tế, bạn sẽ fetch API để lấy dữ liệu đơn hàng của khách hàng này
        const customerOrders = (
            <ul>
                <li>Đơn hàng #CF12345 - 250,000đ</li>
                <li>Đơn hàng #CF12340 - 180,000đ</li>
            </ul>
        );
        setModalContent(customerOrders);
        setShowModal(true);
    };

    // --- HÀM XỬ LÝ KHI CLICK VÀO NÚT "XEM CHI TIẾT" SẢN PHẨM ---
    const handleViewProductSales = (productId) => {
        setModalTitle(`Chi tiết bán của sản phẩm: ID ${productId}`);
        // Fetch API để lấy chi tiết...
        const productSalesDetails = (
            <p>Sản phẩm này đã xuất hiện trong <strong>50</strong> hóa đơn khác nhau.</p>
        );
        setModalContent(productSalesDetails);
        setShowModal(true);
    };

    return (
        <main className={cx('main-content')}>
            <h1 className="fw-bold mb-4">Tổng quan</h1>

            {/* Section 1: Thống kê nhanh */}
            <div className="row">
                <StatCard title="Tổng doanh thu tháng" value="25,000,000đ" linkTo="#sales-chart" />
                <StatCard title="Tổng sản phẩm bán được" value="3,500" unit="sản phẩm" linkTo="#product-stats" />
                <StatCard title="Số lượng khách hàng mới" value="150" linkTo="#customer-stats" />
                <StatCard title="Đơn hàng chờ xử lý" value="12" linkTo="/admin/orders" />
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
                            title="Top 5 món bán chạy"
                            headers={topSellingData.headers}
                            data={topSellingData.data}
                            action={{ label: 'Xem chi tiết' }}
                            onActionClick={handleViewProductSales} // Truyền hàm xử lý
                        />
                    </div>
                    <div className="col-md-6 mb-4">
                        <TableCard
                            title="Top 5 món bán chậm"
                            headers={topSellingData.headers}
                            data={topSellingData.data}
                            action={{ label: 'Xem chi tiết' }}
                            onActionClick={handleViewProductSales} // Tái sử dụng hàm
                        />
                    </div>
                </div>
            </div>

            {/* Section 4: Thống kê khách hàng */}
            <div id="customer-stats" className="my-5">
                <TableCard
                    title="Top 5 khách hàng thân thiết"
                    headers={topCustomersData.headers}
                    data={topCustomersData.data}
                    action={{ label: 'Xem hóa đơn' }}
                    onActionClick={handleViewCustomerOrders} // Truyền hàm xử lý
                />
            </div>

            {/* --- MODAL ĐA NĂNG ĐỂ HIỂN THỊ CHI TIẾT --- */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalContent}
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