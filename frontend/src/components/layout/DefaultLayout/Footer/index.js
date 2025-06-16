import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Footer.module.scss';

// 1. IMPORT HÌNH NỀN
// Đường dẫn này có thể cần điều chỉnh tùy thuộc vào cấu trúc thư mục của bạn
import footerBg from '../../../../assets/img/banner-footer.webp';

// 2. IMPORT CÁC ICON TỪ FONT AWESOME
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMugHot, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import {
    faFacebookSquare,
    faInstagram,
    faYoutube,
    faSquarePinterest
} from '@fortawesome/free-brands-svg-icons';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'; // faXTwitter là icon mới cho Twitter

const cx = classNames.bind(styles);

function Footer() {
    return (
        // 3. ÁP DỤNG BACKGROUND IMAGE VÀO STYLE
        <footer className={cx('footer')} style={{ backgroundImage: `url(${footerBg})` }}>
            <div className="container"> {/* Sử dụng container của Bootstrap */}

                {/* Logo Section */}
                <div className="row justify-content-center">
                    <div className="col-12">
                        {/* Bạn có thể tách phần Logo này ra thành một component riêng để tái sử dụng */}
                        <div className={cx('logo', 'mgt-40px', 'mgb-20px')}>
                            <Link to="/">
                                <div className={cx('logo-content')}></div>
                                <FontAwesomeIcon icon={faMugHot} className={cx('logo-icon')} />
                                <div className={cx('logo-text')}>cafe</div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="row">
                    {/* Column 1: Kết nối */}
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className={cx('connect', 'mgb-20px')}>
                            <h2 className={cx('mgb-20px')}>Kết nối với chúng tôi</h2>
                            <p>
                                Chúng tôi mong muốn tạo nên hương vị thức uống tuyệt vời nhất.
                                Là điểm đến đầu tiên dành cho bạn khi muốn thưởng thức trọn vẹn
                                của tách Coffee
                            </p>
                            <ul className={cx('social-media', 'mgb-20px')}>
                                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebookSquare} /></a></li>
                                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} /></a></li>
                                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faXTwitter} /></a></li>
                                <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faYoutube} /></a></li>
                                <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faSquarePinterest} /></a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Hệ thống cửa hàng */}
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className={cx('info', 'mgb-20px')}>
                            <h2 className={cx('mgb-20px')}>Hệ Thống cửa hàng</h2>
                            <div className={cx('info-store')}>
                                <div className={cx('company')}>
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    <span>Coffe Doi Can</span>
                                </div>
                                <div className={cx('address')}>Địa chỉ: Ladeco Building, 266 Doi Can Street, Ba Dinh District, Ha Noi</div>
                                <div className={cx('hotline')}>Hotline: <a href='/'>09xxxxxxxx</a></div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Chính sách */}
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className={cx('policy')}>
                            <h2 className={cx('mgb-20px')}>Chính sách</h2>
                            <ul className={cx('policy-list')}>
                                <li><Link to="/">Trang chủ</Link></li>
                                <li><Link to="/aboutus">Giới thiệu</Link></li>
                                <li><Link to="/products">Sản phẩm</Link></li>
                                <li><Link to="/newspage">Tin tức</Link></li>
                                <li><Link to="/contactpage">Liên hệ</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 4: Liên hệ */}
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className={cx('contact')}>
                            <h2 className={cx('mgb-20px')}>Liên hệ</h2>
                            <p>
                                Thứ 2 - Thứ 6: 6am - 9pm <br />
                                Thứ Bảy - Chủ Nhật: 6am - 10pm <br />
                                Mở cửa toàn bộ các ngày trong năm (Chỉ đóng cửa vào ngày lễ).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="row">
                    <div className="col-12">
                        <div className={cx('copyright', 'mgt-20px')}>
                            <p>© Bản quyền thuộc về ??? | Cung cấp bởi ???</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;