import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PurchaseHistoryPage.module.scss';
import { Spinner, Alert } from 'react-bootstrap';

// --- BƯỚC 1: IMPORT CÁC HOOK VÀ API CẦN THIẾT ---
import { usePagination } from '../../../hooks/usePaginationAPI'; // Hook cho server
import Pagination from '../../../components/common/Pagination';
import { getMyOrdersApi } from '../../../api/orderService'; // API lấy đơn hàng
import { useAuth } from '../../../context/AuthContext'; // Để kiểm tra đăng nhập

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 5; // Số đơn hàng mỗi trang

function PurchaseHistoryPage() {
    // --- BƯỚC 2: THIẾT LẬP CÁC STATE ---
    const [orders, setOrders] = useState([]);
    const [paginationData, setPaginationData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { isLoggedIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { requestedPage, paginationProps } = usePagination(paginationData);

    // --- BƯỚC 3: useEffect ĐỂ GỌI API ---
    useEffect(() => {
        // Chờ cho đến khi AuthContext kiểm tra xong session
        if (authLoading) {
            return; // Không làm gì cả khi đang kiểm tra
        }

        // Nếu kiểm tra xong và không đăng nhập, điều hướng ngay lập tức
        if (!isLoggedIn) {
            navigate('/login', { state: { from: '/history' } });
            return;
        }

        // Chỉ gọi fetchOrders khi đã chắc chắn là đã đăng nhập
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const params = {
                    page: requestedPage,
                    limit: ITEMS_PER_PAGE,
                };
                const response = await getMyOrdersApi(params);
                setOrders(response.data.data.orders);
                setPaginationData(response.data.data.pagination);
            } catch (err) {
                console.error("Lỗi khi tải lịch sử mua hàng:", err);
                // Nếu API trả về 401 (token hết hạn giữa chừng), cũng đá về trang login
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError("Không thể tải lịch sử mua hàng. Vui lòng thử lại.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
        // Chạy lại mỗi khi user thay đổi (đăng nhập/đăng xuất) hoặc chuyển trang
    }, [isLoggedIn, authLoading, requestedPage, navigate]);

    // --- HÀM HỖ TRỢ RENDER ---
    if (authLoading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Đang kiểm tra phiên đăng nhập...</p>
            </div>
        )
    }
    const formatCurrency = (amount) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    return (
        <>
            {/* Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container">
                    <ul className={cx('breadrumb')}>
                        <li className={cx('home')}>
                            <Link to="/">Trang chủ</Link>
                            <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                        </li>
                        <li>Lịch sử mua hàng</li>
                    </ul>
                    <div className={cx('title-page')}>
                        <span>Lịch sử mua hàng</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={cx('main')}>
                <div className="container">
                    <div className="row">
                        <div className={cx('container-history-user', 'col-12')}>
                            <h2 className="mb-4">Các đơn hàng của bạn</h2>

                            {/* --- BƯỚC 4: RENDER DỰA TRÊN CÁC TRẠNG THÁI --- */}
                            {isLoading ? (
                                <div className="text-center py-5"><Spinner animation="border" /></div>
                            ) : error ? (
                                <Alert variant="danger">{error}</Alert>
                            ) : orders.length > 0 ? (
                                // Render danh sách đơn hàng từ state `orders`
                                orders.map((order) => (
                                    <div key={order.id} className={cx('history-user', 'mb-4')}>
                                        <div className={cx('order-header')}>
                                            <span>Mã đơn hàng: <strong>#{order.id}</strong></span>
                                            {/* Giả sử bạn có 1 component/hàm để render badge */}
                                            <span className={cx('order-status', `status--${order.status.replace(/\s+/g, '-').toLowerCase()}`)}>
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* ===== START: THÊM WRAPPER NÀY VÀO ===== */}
                                        <div className={cx('order-items-list')}>
                                            {order.items.map((item) => (
                                                <div key={item.id} className={cx('product-history')}>
                                                    <div className={cx('product-history-detail')}>

                                                        {/* ===== START: Bọc ảnh trong container ===== */}
                                                        <div className={cx('product-image-container')}>
                                                            <img src={item.productImage} alt={item.productName} />
                                                        </div>
                                                        {/* ===== END: Bọc ảnh trong container ===== */}

                                                        <div className={cx('product-info')}>
                                                            <div className={cx('product-name')}>{item.productName}</div>
                                                            <div className={cx('product-quantity')}>x {item.quantity}</div>
                                                        </div>
                                                    </div>
                                                    <div className={cx('product-price')}>
                                                        {formatCurrency(item.productPrice)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* ===== END: THÊM WRAPPER NÀY VÀO ===== */}

                                        <div className={cx('order-footer')}>
                                            <div className={cx('product-history-date')}>
                                                Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className={cx('product-history-total-price')}>
                                                Thành tiền: <strong>{formatCurrency(order.totalPrice)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <h3>Bạn chưa có đơn hàng nào.</h3>
                                    <Link to="/products" className="btn btn-primary mt-3">Bắt đầu mua sắm</Link>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {!isLoading && paginationData.totalPages > 1 && (
                            <div className="col-12 mt-4">
                                <Pagination {...paginationProps} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default PurchaseHistoryPage;