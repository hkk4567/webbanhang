import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AboutUsPage.module.scss';

// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faSeedling, faMugHot, faUsers } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function AboutUsPage() {
    return (
        <>
            {/* 1. Breadcrumb */}
            <div className={cx('bread-crumb')}>
                <div className="container mt-4">
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/" >Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li className={cx('breadrumb-title-page')}>Giới thiệu</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Page Header - Hero Section */}
            <header className={cx('page-header')}>
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h1 className={cx('page-title')}>Câu Chuyện Về Những Tách Cà Phê</h1>
                            <p className={cx('page-subtitle')}>Nơi đam mê và nghệ thuật pha chế gặp gỡ</p>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* 3. Our Story Section */}
                <section className={cx('section-padding')}>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 mb-4 mb-lg-0">
                                <img
                                    src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=700&q=80"
                                    alt="Máy rang cà phê chuyên nghiệp tại quán"
                                    className="img-fluid rounded shadow"
                                />
                            </div>
                            <div className="col-lg-6">
                                <h2 className={cx('section-title')}>Hành Trình Của Chúng Tôi</h2>
                                <p>
                                    Bắt đầu từ một tình yêu mãnh liệt với hương vị cà phê nguyên bản, chúng tôi đã đi
                                    khắp nơi để tìm kiếm những hạt cà phê Arabica và Robusta chất lượng nhất. Hành
                                    trình đó đã dạy chúng tôi rằng mỗi tách cà phê không chỉ là một thức uống, mà còn là
                                    kết tinh của đất trời, của sự chăm sóc tỉ mỉ từ người nông dân và tâm huyết của
                                    người thợ rang xay.
                                </p>
                                <p>
                                    Quán cà phê của chúng tôi ra đời với mong muốn chia sẻ những câu chuyện đó, tạo ra
                                    một không gian nơi mọi người có thể dừng lại, thưởng thức và cảm nhận trọn vẹn
                                    hương vị cuộc sống trong từng giọt cà phê.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Our Values Section */}
                <section className={cx('section-padding', 'bg-light')}>
                    <div className="container">
                        <div className="row text-center">
                            <div className="col-12">
                                <h2 className={cx('section-title')}>Giá Trị Cốt Lõi</h2>
                                <p className="lead mb-5">Ba điều chúng tôi luôn cam kết với bạn.</p>
                            </div>
                        </div>
                        <div className="row text-center">
                            {/* Value 1 */}
                            <div className="col-md-4 mb-4">
                                <div className={cx('value-card')}>
                                    <div className={cx('value-icon')}>
                                        <FontAwesomeIcon icon={faSeedling} />
                                    </div>
                                    <h3 className="h5">Chất Lượng Hạt</h3>
                                    <p>
                                        Chúng tôi cam kết sử dụng 100% hạt cà phê có nguồn gốc rõ ràng, được tuyển chọn
                                        kỹ lưỡng và rang mới mỗi ngày.
                                    </p>
                                </div>
                            </div>
                            {/* Value 2 */}
                            <div className="col-md-4 mb-4">
                                <div className={cx('value-card')}>
                                    <div className={cx('value-icon')}>
                                        <FontAwesomeIcon icon={faMugHot} />
                                    </div>
                                    <h3 className="h5">Không Gian Ấm Cúng</h3>
                                    <p>
                                        Thiết kế không gian mở, gần gũi với thiên nhiên, là nơi lý tưởng để bạn làm
                                        việc, gặp gỡ bạn bè hay chỉ đơn giản là thư giãn.
                                    </p>
                                </div>
                            </div>
                            {/* Value 3 */}
                            <div className="col-md-4 mb-4">
                                <div className={cx('value-card')}>
                                    <div className={cx('value-icon')}>
                                        <FontAwesomeIcon icon={faUsers} />
                                    </div>
                                    <h3 className="h5">Gắn Kết Cộng Đồng</h3>
                                    <p>
                                        Chúng tôi tin rằng cà phê là chất xúc tác tuyệt vời để kết nối mọi người. Quán
                                        là ngôi nhà chung cho những ai yêu cà phê.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Call to Action Section */}
                <section className={cx('section-padding', 'text-center')}>
                    <div className="container">
                        <h2 className={cx('section-title')}>Sẵn Sàng Trải Nghiệm?</h2>
                        <p className="lead mb-4">
                            Khám phá thực đơn đa dạng từ cà phê truyền thống đến các món đá xay sáng tạo của chúng tôi.
                        </p>
                        <Link to="/product" className="btn btn-primary btn-lg">
                            Xem Thực Đơn
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export default AboutUsPage;