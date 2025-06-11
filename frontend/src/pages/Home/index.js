import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';

// --- 1. IMPORT HÌNH ẢNH ---
// (Hãy chắc chắn đường dẫn này đúng)
import slider1 from '../../assets/img/slider_1.webp';
import slider2 from '../../assets/img/slider_2.webp';
import moduleBanner1 from '../../assets/img/module_banner1.webp';
import moduleBanner2 from '../../assets/img/module_banner2.webp';
import moduleBanner3 from '../../assets/img/module_banner3.webp';
import bgSection from '../../assets/img/bg-section.webp';
import product1 from '../../assets/img/product1 (1).webp';
import product2 from '../../assets/img/product2-10b0f2e1-6277-49c7-95ba-ceaac7f11091.webp';
import product3 from '../../assets/img/product3.webp';
import product4 from '../../assets/img/product4.webp';
import product5 from '../../assets/img/product5.webp';
import product6 from '../../assets/img/product6.webp';
import iconCf from '../../assets/img/icon-cf.webp';
import quyTrinh1 from '../../assets/img/sec_quy_trinh_images1.webp';
import quyTrinh2 from '../../assets/img/sec_quy_trinh_images2.webp';
import quyTrinh3 from '../../assets/img/sec_quy_trinh_images3.webp';

const cx = classNames.bind(styles);

// --- 2. TẠO DỮ LIỆU ĐỂ RENDER ---
const sliderData = [
    { id: 1, image: slider1, link: '/offers/summer-sale' },
    { id: 2, image: slider2, link: '/offers/new-arrivals' },
];

const menuProducts = [
    { id: 'p1', name: 'CAFE ICE LATTE', price: '60.000₫', description: 'Cà phê đậm phong cách Ý được phối hợp với kem giúp giữ hương vị và tạo sự thơm ngon.', image: product6, link: '/product/cafe-ice-latte' },
    { id: 'p2', name: 'CAFE ESPRESSO', price: '30.000₫', description: 'Được pha chế bằng cách dùng nước nóng nén dưới áp suất cao qua bột cà phê được xay mịn.', image: product4, link: '/product/cafe-espresso' },
    { id: 'p3', name: 'CAFE AMERICANO', price: '35.000₫', description: 'Đậm chất Mỹ với nước nóng được pha vào Espresso giúp cà phê có độ đậm đặc biệt.', image: product2, link: '/product/cafe-americano' },
    { id: 'p4', name: 'CAFE MOCHA', price: '50.000₫', description: 'Hỗn hợp Espresso và chocolate nóng, kem tươi và chocolate sause béo ngậy, vị thơm.', image: product5, link: '/product/cafe-mocha' },
    { id: 'p5', name: 'CAFE CAPUCHINO', price: '45.000₫', description: 'Đậm phong cách Ý với 3 phần : Cà phê Espresso pha lượng nước gấp đôi, sữa nóng, sủi bọt.', image: product3, link: '/product/cafe-capuchino' },
    { id: 'p6', name: 'CAFE LATTE', price: '49.000₫', description: 'Cà phê sữa đậm phong cách Ý với cốc sữa lớn và được pha bằng sữa bò tươi 100% nguyên chất.', image: product1, link: '/product/cafe-latte' },
];

const processImages = [
    { id: 'proc1', image: quyTrinh1 },
    { id: 'proc2', image: quyTrinh2 },
    { id: 'proc3', image: quyTrinh3 },
];

function Home() {
    // --- 3. STATE VÀ EFFECT CHO CÁC SLIDER ---
    const [currentSlider, setCurrentSlider] = useState(0);
    const [currentProcess, setCurrentProcess] = useState(0);

    useEffect(() => {
        const sliderInterval = setInterval(() => {
            setCurrentSlider(prev => (prev + 1) % sliderData.length);
        }, 5000);
        return () => clearInterval(sliderInterval);
    }, []);

    useEffect(() => {
        const processInterval = setInterval(() => {
            setCurrentProcess(prev => (prev + 1) % processImages.length);
        }, 4000);
        return () => clearInterval(processInterval);
    }, []);

    return (
        <main>
            {/* ========= SLIDER SECTION ========= */}
            <section className={cx('slider')}>
                {sliderData.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={cx('slider-banner', { 'slider--active': index === currentSlider })}
                    >
                        <Link to={slide.link}><img src={slide.image} alt={`Slider ${index + 1}`} /></Link>
                    </div>
                ))}
                <div className={cx('slider-dot')}>
                    {sliderData.map((_, index) => (
                        <div
                            key={index}
                            className={cx('slider-dot-item', { 'dot--active': index === currentSlider })}
                            style={{ marginLeft: index === 0 ? '-13px' : '13px', marginRight: index === 0 ? '13px' : '-13px' }} // Tái tạo style inline
                            onClick={() => setCurrentSlider(index)}
                        ></div>
                    ))}
                </div>
            </section>

            {/* ========= MODULE BANNER SECTION ========= */}
            <section className={cx('module-banner')}>
                <div className="container my-5">
                    <div className="row g-4">
                        <div className="col-lg-7">
                            <Link to="/story" className={cx('module_banner1')}>
                                <img className={cx('module_banner1-img')} src={moduleBanner1} alt="Coffee hương vị mới" />
                                <div className={cx('text')}>
                                    <h3>Coffee hương vị mới</h3>
                                    <div className={cx('btn-readmore')}>Tìm hiểu</div>
                                </div>
                            </Link>
                        </div>
                        <div className="col-lg-5">
                            <div className="d-flex flex-column h-100">
                                <div>
                                    <Link to="/promotion" className={cx('module-banner2-1')}>
                                        <img className={cx('module-banner2-1-img')} src={moduleBanner2} alt="Thứ 6 ưu đãi" />
                                        <div className={cx('text1')}>
                                            <h3>Thứ 6 này 25 % ưu đãi</h3>
                                            <div className={cx('btn-readmore')}>Tìm hiểu</div>
                                        </div>
                                    </Link>
                                </div>
                                <div>
                                    <Link to="/new-menu" className={cx('module-banner2-2', 'mt-3', 'flex-grow-1')}>
                                        <img className={cx('module-banner2-2-img')} src={moduleBanner3} alt="Món mới" />
                                        <div className={cx('text2')}>
                                            <h3>Tuyệt vời món mới</h3>
                                            <div className={cx('btn-readmore')}>Tìm hiểu</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========= INTRODUCTION MENU SECTION ========= */}
            <section className={cx('introduction-menu')} style={{ backgroundImage: `url(${bgSection})` }}>
                <div className="container py-5">
                    <div className="row mb-5">
                        <div className="col-12 text-center">
                            <div className={cx('introduction-menu-header')}>
                                <h2 className={cx('introduction-menu-title')}>Khám phá menu</h2>
                                <p>Có gì đặc biệt ở đây</p>
                            </div>
                        </div>
                    </div>
                    <div className="row gy-4">
                        {menuProducts.map(product => (
                            <div key={product.id} className="col-lg-6">
                                <div className={cx('product-box')}>
                                    <img src={product.image} alt={product.name} />
                                    <div className={cx('product-box-content')}>
                                        <div className={cx('product-box-content-introduction')}>
                                            <Link to={product.link}>{product.name}</Link>
                                            <span>{product.price}</span>
                                        </div>
                                        <div className={cx('product-box-description')}>{product.description}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="row mt-5">
                        <div className="col-12 text-center" style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/san-pham" className={cx('btn-readmore')}>Xem thêm menu</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========= PRODUCT ADVERTISING SECTION ========= */}
            <section className={cx('product-advertising', "py-5")}>
                <div className=" container">
                    <div className="row mb-5" style={{ marginBottom: '20px' }}>
                        <div className="col-12 text-center" style={{ textAlign: 'center' }}>
                            <h2 className={cx('product-advertising-title')}>
                                <Link to="/story">Coffee là hương vị của bạn</Link>
                            </h2>
                            <p>Có gì bất ngờ tại đây</p>
                        </div>
                    </div>
                    {/* Phần product-item-box nếu có sẽ được thêm vào đây */}
                    <div className="row align-items-center g-5">
                        <div className="col-md-6">
                            <div className={cx('product-advertising-banner')}>
                                <h2>Quy trình làm<br />COFFEE</h2>
                                <p>Chúng tôi muốn bạn tự hào cho chính bản thân mình hương vị cà phê theo ý thích. Đó là bản chất cơ bản nhất để có những tách cà phê thơm ngon nhất</p>
                                <Link to="/process" className={cx('btn-readmore')}>Khám phá quy trình</Link>
                                <div className={cx('product-advertising-banner-icon')}>
                                    <img src={iconCf} alt="Coffee icon" />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div style={{ marginTop: '40px' }}>
                                {processImages.map((item, index) => (
                                    <div key={item.id} className={cx('product-advertising-banner-img', { 'banner-img--active': index === currentProcess })}>
                                        <img className={cx('product-advertising-banner2')} src={item.image} alt={`Quy trình ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                            <div className={cx('img-dots')}>
                                {processImages.map((_, index) => (
                                    <div key={index} className={cx('dot', { 'dot--active': index === currentProcess })} onClick={() => setCurrentProcess(index)}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;