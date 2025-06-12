// src/data/products.js

// Dữ liệu giả này mô phỏng kết quả trả về từ một API sản phẩm.
// Các ảnh được lấy từ Unsplash và đã được kiểm tra.

import denDaImage from '../assets/img/06-dau-tay-600x600.webp';
import suaDaImage from '../assets/img/product1-8ed5cdf2-9430-402c-be6e-a529af32a714.webp';
import bacXiuImage from '../assets/img/product2-9f7b1cca-7c88-4df7-8315-1204b77afec7.webp';
import cappuccinoImage from '../assets/img/product4-cea6cdbf-a3f7-4737-be00-1d507f7c4c4c.webp';
import camTuoiImage from '../assets/img/product6.webp';
import traDaoImage from '../assets/img/product5.webp';
import tiramisuImage from '../assets/img/product1-8ed5cdf2-9430-402c-be6e-a529af32a714.webp';
import sinhToBoImage from '../assets/img/product4-cea6cdbf-a3f7-4737-be00-1d507f7c4c4c.webp';
import americanoImage from '../assets/img/product3.webp';


export const mockAllProducts = [
    {
        id: 1,
        name: 'Cà Phê Đen Đá',
        slug: 'ca-phe-den-da',
        price: 25000,
        category: 'Cà phê',
        description: 'Hương vị cà phê Robusta đậm đà, nguyên chất, đánh thức mọi giác quan.',
        image: denDaImage,
        rating: 4.8,
        stock: 50,
    },
    {
        id: 2,
        name: 'Cà Phê Sữa Đá',
        slug: 'ca-phe-sua-da',
        price: 29000,
        category: 'Cà phê',
        description: 'Sự kết hợp hoàn hảo giữa cà phê đậm đà và sữa đặc ngọt ngào, một hương vị Sài Gòn đặc trưng.',
        image: suaDaImage,
        rating: 4.9,
        stock: 45,
    },
    {
        id: 3,
        name: 'Bạc Xỉu',
        slug: 'bac-xiu',
        price: 32000,
        category: 'Cà phê',
        description: 'Nhiều sữa hơn, ít cà phê hơn, Bạc Xỉu là lựa chọn nhẹ nhàng cho những ai yêu thích vị béo ngậy.',
        image: bacXiuImage,
        rating: 4.7,
        stock: 30,
    },
    {
        id: 4,
        name: 'Cappuccino',
        slug: 'cappuccino',
        price: 45000,
        category: 'Cà phê',
        description: 'Một tác phẩm nghệ thuật từ Espresso, sữa nóng và lớp bọt sữa dày mịn trên bề mặt.',
        image: cappuccinoImage,
        rating: 4.6,
        stock: 25,
    },
    {
        id: 5,
        name: 'Nước Ép Cam Tươi',
        slug: 'nuoc-ep-cam-tuoi',
        price: 35000,
        category: 'Nước ép',
        description: '100% cam tươi nguyên chất, không đường, không phụ gia, giàu Vitamin C.',
        image: camTuoiImage,
        rating: 4.9,
        stock: 40,
    },
    {
        id: 6,
        name: 'Trà Đào Cam Sả',
        slug: 'tra-dao-cam-sa',
        price: 40000,
        category: 'Trà',
        description: 'Thức uống giải nhiệt hoàn hảo với vị ngọt của đào, chua nhẹ của cam và hương thơm thư giãn từ sả.',
        image: traDaoImage,
        rating: 4.8,
        stock: 35,
    },
    {
        id: 7,
        name: 'Bánh Tiramisu',
        slug: 'banh-tiramisu',
        price: 55000,
        category: 'Bánh ngọt',
        description: 'Chiếc bánh mềm mại từ Ý với lớp kem phô mai Mascarpone, xen kẽ hương cà phê và rượu rum nồng nàn.',
        image: tiramisuImage,
        rating: 5.0,
        stock: 20,
    },
    {
        id: 8,
        name: 'Sinh Tố Bơ',
        slug: 'sinh-to-bo',
        price: 45000,
        category: 'Nước ép',
        description: 'Bơ sáp dẻo thơm xay mịn cùng sữa tươi, tạo nên một ly sinh tố béo ngậy, bổ dưỡng.',
        image: sinhToBoImage,
        rating: 4.7,
        stock: 28,
    },
    {
        id: 9,
        name: 'Cà Phê Americano',
        slug: 'ca-phe-americano',
        price: 38000,
        category: 'Cà phê',
        description: 'Espresso pha loãng với nước nóng, mang lại hương vị cà phê nhẹ nhàng hơn nhưng vẫn giữ trọn vẹn sự tinh tế.',
        image: americanoImage,
        rating: 4.5,
        stock: 33,
    },
];