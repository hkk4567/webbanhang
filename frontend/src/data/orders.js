export const mockAllOrders = [
    {
        id: '#DH001',
        customerName: 'Nguyễn Văn An',
        phone: '0901234567',
        date: '2023-10-26',
        address: {
            street: '123 Đường ABC',
            ward: 'Phường Bến Nghé',
            district: 'Quận 1',
            city: 'Thành phố Hồ Chí Minh'
        },
        total: 98000,
        status: 'Chưa xử lý',
        paymentMethod: 'COD',
        note: 'Giao hàng sau 5h chiều.',
        products: [
            { id: 'P01', name: 'Cà phê sữa đá', quantity: 2, price: 29000 },
            { id: 'P02', name: 'Trà đào cam sả', quantity: 1, price: 40000 }
        ]
    },
    {
        id: '#DH002',
        customerName: 'Trần Thị Bình',
        phone: '0912345678',
        date: '2023-10-25',
        address: {
            street: '456 Đường XYZ',
            ward: 'Phường Kim Mã',
            district: 'Quận Ba Đình',
            city: 'Thành phố Hà Nội'
        },
        total: 125000,
        status: 'Giao thành công',
        paymentMethod: 'Thẻ ngân hàng',
        note: '',
        products: [
            { id: 'P03', name: 'Bạc xỉu', quantity: 1, price: 35000 },
            { id: 'P04', name: 'Bánh mì chảo', quantity: 2, price: 45000 }
        ]
    }, {
        id: '#DH003',
        customerName: 'Lê Quốc Cường',
        phone: '0923456789',
        date: '2023-10-24',
        address: {
            street: '789 Đường Lê Lợi',
            ward: 'Phường Thạch Thang',
            district: 'Quận Hải Châu',
            city: 'Thành phố Đà Nẵng'
        },
        total: 150000,
        status: 'Đã xác nhận',
        paymentMethod: 'COD',
        note: 'Hàng dễ vỡ, xin nhẹ tay.',
        products: [
            { id: 'P05', name: 'Nước ép cam', quantity: 2, price: 45000 },
            { id: 'P06', name: 'Bánh Tiramisu', quantity: 1, price: 60000 }
        ]
    },
    {
        id: '#DH004',
        customerName: 'Phạm Hồng Đào',
        phone: '0934567890',
        date: '2023-10-23',
        address: {
            street: '12 Nguyễn Trãi',
            ward: 'Phường Tân An',
            district: 'Quận Ninh Kiều',
            city: 'Thành phố Cần Thơ'
        },
        total: 85000,
        status: 'Đã hủy',
        paymentMethod: 'Thẻ ngân hàng',
        note: 'Khách hàng báo hủy.',
        products: [
            { id: 'P07', name: 'Trà sữa trân châu', quantity: 1, price: 45000 },
            { id: 'P08', name: 'Trà vải', quantity: 1, price: 40000 }
        ]
    },
    {
        id: '#DH005',
        customerName: 'Võ Minh Đức',
        phone: '0945678901',
        date: '2023-10-22',
        address: {
            street: '34 Trần Hưng Đạo',
            ward: 'Phường Vĩnh Ninh',
            district: 'Thành phố Huế',
            city: 'Tỉnh Thừa Thiên Huế'
        },
        total: 110000,
        status: 'Giao thành công',
        paymentMethod: 'COD',
        note: '',
        products: [
            { id: 'P09', name: 'Sinh tố bơ', quantity: 2, price: 55000 }
        ]
    },
    {
        id: '#DH006',
        customerName: 'Hoàng Thị Em',
        phone: '0956789012',
        date: '2023-10-21',
        address: {
            street: '56 Lý Thường Kiệt',
            ward: 'Phường Hàng Bài',
            district: 'Quận Hoàn Kiếm',
            city: 'Thành phố Hà Nội'
        },
        total: 210000,
        status: 'Giao thành công',
        paymentMethod: 'Thẻ ngân hàng',
        note: 'Giao trong giờ hành chính.',
        products: [
            { id: 'P01', name: 'Cà phê sữa đá', quantity: 3, price: 29000 },
            { id: 'P10', name: 'Bánh Croissant', quantity: 3, price: 41000 }
        ]
    },
    {
        id: '#DH007',
        customerName: 'Đinh Văn Giao',
        phone: '0967890123',
        date: '2023-10-20',
        address: {
            street: '78 Nguyễn Văn Cừ',
            ward: 'Phường An Biên',
            district: 'Quận Lê Chân',
            city: 'Thành phố Hải Phòng'
        },
        total: 75000,
        status: 'Chưa xử lý',
        paymentMethod: 'COD',
        note: 'Gọi trước khi giao.',
        products: [
            { id: 'P03', name: 'Bạc xỉu', quantity: 1, price: 35000 },
            { id: 'P02', name: 'Trà đào cam sả', quantity: 1, price: 40000 }
        ]
    },
    {
        id: '#DH008',
        customerName: 'Lý Ngọc Hà',
        phone: '0978901234',
        date: '2023-10-19',
        address: {
            street: '90 Trường Chinh',
            ward: 'Phường Xương Huân',
            district: 'Thành phố Nha Trang',
            city: 'Tỉnh Khánh Hòa'
        },
        total: 130000,
        status: 'Giao thành công',
        paymentMethod: 'COD',
        note: '',
        products: [
            { id: 'P11', name: 'Mojito Chanh', quantity: 2, price: 65000 }
        ]
    },
    {
        id: '#DH009',
        customerName: 'Bùi Trung Hiếu',
        phone: '0989012345',
        date: '2023-10-18',
        address: {
            street: '101 Lạc Long Quân',
            ward: 'Phường Tân Tiến',
            district: 'Thành phố Biên Hòa',
            city: 'Tỉnh Đồng Nai'
        },
        total: 180000,
        status: 'Đã xác nhận',
        paymentMethod: 'Thẻ ngân hàng',
        note: 'Cẩn thận với ly thủy tinh.',
        products: [
            { id: 'P06', name: 'Bánh Tiramisu', quantity: 3, price: 60000 }
        ]
    },
    {
        id: '#DH010',
        customerName: 'Ngô Thị Hương',
        phone: '0990123456',
        date: '2025-06-14',
        address: {
            street: '112 Hoàng Diệu',
            ward: 'Phường Trưng Vương',
            district: 'Thành phố Thái Nguyên',
            city: 'Tỉnh Thái Nguyên'
        },
        total: 58000,
        status: 'Đã hủy',
        paymentMethod: 'COD',
        note: 'Không liên lạc được với khách hàng.',
        products: [
            { id: 'P01', name: 'Cà phê sữa đá', quantity: 2, price: 29000 }
        ]
    },
    {
        id: '#DH011',
        customerName: 'Đỗ Văn Khang',
        phone: '0901122334',
        date: '2025-06-15',
        address: {
            street: '124 Điện Biên Phủ',
            ward: 'Phường 7',
            district: 'Thành phố Vũng Tàu',
            city: 'Tỉnh Bà Rịa - Vũng Tàu'
        },
        total: 105000,
        status: 'Chưa xử lý',
        paymentMethod: 'Thẻ ngân hàng',
        note: '',
        products: [
            { id: 'P03', name: 'Bạc xỉu', quantity: 3, price: 35000 }
        ]
    },
    {
        id: '#DH012',
        customerName: 'Nguyễn Văn An',
        phone: '0901234567',
        date: '2025-06-15',
        address: {
            street: '123 Đường ABC',
            ward: 'Phường Bến Nghé',
            district: 'Quận 1',
            city: 'Thành phố Hồ Chí Minh'
        },
        total: 250000,
        status: 'Giao thành công',
        paymentMethod: 'COD',
        note: 'Khách quen.',
        products: [
            { id: 'P04', name: 'Bánh mì chảo', quantity: 2, price: 45000 },
            { id: 'P05', name: 'Nước ép cam', quantity: 2, price: 45000 },
            { id: 'P02', name: 'Trà đào cam sả', quantity: 1, price: 40000 }
        ]
    }
    // Thêm các đơn hàng khác với cấu trúc tương tự...
];