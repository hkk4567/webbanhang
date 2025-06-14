import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './NewsPage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

// Import component con
import NewsArticleCard from './components/NewsArticleCard';

const cx = classNames.bind(styles);

// Dữ liệu tin tức giả (bạn sẽ thay thế bằng dữ liệu từ API sau này)
const mockNewsData = [
    {
        id: 1,
        title: 'Bí Quyết Chọn Hạt Cà Phê Ngon Cho Người Mới Bắt Đầu',
        slug: 'bi-quyet-chon-hat-ca-phe-ngon',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        excerpt: 'Khám phá sự khác biệt giữa Arabica và Robusta, và cách chọn loại hạt phù hợp với gu thưởng thức của bạn.',
        date: '15 THÁNG 10, 2023',
    },
    {
        id: 2,
        title: 'Nghệ Thuật Pha Chế Cold Brew Tại Nhà Đơn Giản',
        slug: 'nghe-thuat-pha-che-cold-brew',
        image: 'https://90sstore.vn/wp-content/uploads/2023/06/ca-phe-cold-brew-la-gi-1.jpg',
        excerpt: 'Chỉ với vài bước đơn giản, bạn có thể tự tay pha một ly Cold Brew đậm đà, mượt mà ngay tại nhà.',
        date: '10 THÁNG 10, 2023',
    },
    {
        id: 3,
        title: 'Top 5 Quán Cà Phê Có Không Gian Làm Việc Lý Tưởng',
        slug: 'top-5-quan-ca-phe-khong-gian-lam-viec',
        image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        excerpt: 'Tổng hợp những quán cà phê yên tĩnh, có wifi mạnh và đồ uống ngon để bạn có một ngày làm việc hiệu quả.',
        date: '05 THÁNG 10, 2023',
    },
];

function NewsPage() {
    return (
        <main className={cx('wrapper')}>
            <div className="container">
                {/* Breadcrumb */}
                <div className={cx('bread-crumb')}>
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/" >Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li className={cx('breadrumb-title-page')}>Tin tức</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Page Title */}
                <div className="row">
                    <div className="col-12 text-center">
                        <h1 className={cx('page-title')}>Tin Tức & Sự Kiện</h1>
                        <p className={cx('page-subtitle')}>Cập nhật những câu chuyện mới nhất từ thế giới cà phê</p>
                    </div>
                </div>

                {/* News Grid */}
                <div className="row mt-5">
                    {mockNewsData.map((article) => (
                        <div key={article.id} className="col-lg-4 col-md-6 mb-4">
                            <NewsArticleCard article={article} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default NewsPage;