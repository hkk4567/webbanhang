import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PurchaseHistoryPage.module.scss';

import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 5;
// Dữ liệu giả lập - Trong thực tế, bạn sẽ fetch dữ liệu này từ API sau khi người dùng đăng nhập
const mockPurchaseHistory = [
    {
        orderId: '#CF12345',
        date: '15/10/2023',
        totalPrice: 124000,
        status: 'Đã giao hàng',
        items: [
            { id: 2, name: 'Cà Phê Sữa Đá', quantity: 2, price: 29000, image: 'https://images.unsplash.com/photo-1551030173-1a2952449856?auto=format&fit=crop&q=80&w=150' },
            { id: 6, name: 'Trà Đào Cam Sả', quantity: 1, price: 40000, image: 'https://images.unsplash.com/photo-1625218544320-a2353a25a397?auto=format&fit=crop&q=80&w=150' },
        ],
    },
    {
        orderId: '#CF12340',
        date: '02/10/2023',
        totalPrice: 45000,
        status: 'Đã giao hàng',
        items: [
            { id: 4, name: 'Cappuccino', quantity: 1, price: 45000, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e234?auto=format&fit=crop&q=80&w=150' },
        ],
    },
    {
        orderId: '#CF12333',
        date: '28/09/2023',
        totalPrice: 90000,
        status: 'Đã hủy',
        items: [
            { id: 8, name: 'Sinh Tố Bơ', quantity: 2, price: 45000, image: 'https://images.unsplash.com/photo-1611930022073-b4a62a81b867?auto=format&fit=crop&q=80&w=150' },
        ],
    },
];

function PurchaseHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentData, currentPage, maxPage, jump } = usePagination(orders, ITEMS_PER_PAGE);
    // Mô phỏng việc lấy dữ liệu lịch sử mua hàng từ API
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setOrders(mockPurchaseHistory);
            setIsLoading(false);
        }, 1000); // Giả lập độ trễ mạng

        return () => clearTimeout(timer); // Cleanup function
    }, []);

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

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
                            {isLoading ? (
                                <div className="text-center py-5">Đang tải lịch sử mua hàng...</div>
                            ) : orders.length > 0 ? (
                                // --- BƯỚC 3: RENDER DỮ LIỆU TỪ `currentData` THAY VÌ `orders` ---
                                currentData.map((order) => (
                                    <div key={order.orderId} className={cx('history-user')}>
                                        {/* ... Phần JSX hiển thị chi tiết một đơn hàng giữ nguyên ... */}
                                        <div className={cx('order-header')}>
                                            <span>Mã đơn hàng: <strong>{order.orderId}</strong></span>
                                            <span className={cx('order-status', `status--${order.status.replace(/\s+/g, '-').toLowerCase()}`)}>
                                                {order.status}
                                            </span>
                                        </div>
                                        {order.items.map((item) => (
                                            <div key={item.id} className={cx('product-history')}>
                                                <div className={cx('product-history-detail')}>
                                                    <img src={item.image} alt={item.name} />
                                                    <div className={cx('product-info')}>
                                                        <div className={cx('product-name')}>{item.name}</div>
                                                        <div className={cx('product-quantity')}>x {item.quantity}</div>
                                                    </div>
                                                </div>
                                                <div className={cx('product-price')}>
                                                    {formatCurrency(item.price)}
                                                </div>
                                            </div>
                                        ))}
                                        <div className={cx('order-footer')}>
                                            <div className={cx('product-history-date')}>Ngày đặt: {order.date}</div>
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

                        {/* Pagination (chỉ hiển thị khi có đơn hàng) */}
                        {!isLoading && orders.length > ITEMS_PER_PAGE && (
                            <div className="col-12 mt-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPageCount={maxPage}
                                    onPageChange={page => jump(page)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default PurchaseHistoryPage;