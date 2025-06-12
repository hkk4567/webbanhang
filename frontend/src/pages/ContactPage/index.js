import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ContactPage.module.scss';

// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ContactPage() {
    // State để quản lý dữ liệu của form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    // Hàm cập nhật state khi người dùng nhập liệu
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Hàm xử lý khi gửi form
    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn chặn form reload trang
        console.log('Dữ liệu form đã gửi:', formData);
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
        // Reset form sau khi gửi (tùy chọn)
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <main className={cx('wrapper')}>
            <div className="container">
                {/* 1. Breadcrumb */}
                <div className={cx('bread-crumb')}>
                    <div className="row">
                        <div className="col-12">
                            <ul className={cx('breadrumb')}>
                                <li className={cx('home')}>
                                    <Link to="/" className={cx('product-home')}>Trang chủ</Link>
                                    <FontAwesomeIcon icon={faAngleRight} className="mx-2" />
                                </li>
                                <li className={cx('breadrumb-title-page')}>Liên hệ</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 2. Page Title */}
                <div className="row">
                    <div className="col-12 text-center">
                        <h1 className={cx('page-title')}>Liên Hệ Với Chúng Tôi</h1>
                        <p className={cx('page-subtitle')}>Luôn sẵn sàng lắng nghe bạn</p>
                    </div>
                </div>

                {/* 3. Contact Info & Form */}
                <div className="row mt-5">
                    {/* Cột thông tin liên hệ */}
                    <div className="col-lg-5 mb-5 mb-lg-0">
                        <div className={cx('contact-info')}>
                            <h3 className={cx('info-title')}>Thông Tin Cửa Hàng</h3>
                            <ul className={cx('info-list')}>
                                <li>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className={cx('info-icon')} />
                                    <span>
                                        <strong>Địa chỉ:</strong> 123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
                                    </span>
                                </li>
                                <li>
                                    <FontAwesomeIcon icon={faPhone} className={cx('info-icon')} />
                                    <span>
                                        <strong>Điện thoại:</strong> (028) 3812 3456
                                    </span>
                                </li>
                                <li>
                                    <FontAwesomeIcon icon={faEnvelope} className={cx('info-icon')} />
                                    <span>
                                        <strong>Email:</strong> contact@yourcafe.com
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Cột form liên hệ */}
                    <div className="col-lg-7">
                        <form className={cx('contact-form')} onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="name" className="form-label">Họ và Tên</label>
                                    <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="email" className="form-label">Địa chỉ Email</label>
                                    <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="col-12 mb-3">
                                    <label htmlFor="subject" className="form-label">Tiêu đề</label>
                                    <input type="text" className="form-control" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                                </div>
                                <div className="col-12 mb-3">
                                    <label htmlFor="message" className="form-label">Nội dung tin nhắn</label>
                                    <textarea className="form-control" id="message" name="message" rows="5" value={formData.message} onChange={handleChange} required></textarea>
                                </div>
                                <div className="col-12">
                                    <button type="submit" className={cx('submit-btn', 'btn', 'btn-primary')}>Gửi Tin Nhắn</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 4. Google Map Section */}
            <div className={cx('map-section')}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.44791331022!2d106.69539361528621!3d10.776989792320763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9d6e3e3%3A0x743b1f5b1136b6f0!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2s!4v1665825354929!5m2!1svi!2s"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Map Location"
                ></iframe>
            </div>
        </main>
    );
}

export default ContactPage;