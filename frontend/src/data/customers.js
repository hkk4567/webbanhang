export const mockAllCustomers = [
    {
        id: 'KH001',
        name: 'Nguyễn Văn An',
        type: 'Thành viên Bạc',
        email: 'an.nguyen@example.com',
        phone: '0901234567',
        address: '123 Đường ABC',
        city: 'Thành phố Hồ Chí Minh', // Dữ liệu này đã đúng
        district: 'Quận 1',             // Dữ liệu này đã đúng
        ward: 'Phường Bến Nghé'      // Dữ liệu này đã đúng
    },
    {
        id: 'KH002',
        name: 'Trần Thị Bình',
        type: 'Thành viên Vàng',
        email: 'binh.tran@example.com',
        phone: '0912345678',
        address: '456 Đường XYZ',
        city: 'Thành phố Hà Nội',       // Sửa: 'Hà Nội' -> 'Thành phố Hà Nội'
        district: 'Quận Ba Đình',         // Sửa: 'Ba Đình' -> 'Quận Ba Đình'
        ward: 'Phường Kim Mã'
    },
    {
        id: 'KH003',
        name: 'Lê Quốc Cường',
        type: 'Thành viên Bạc',
        email: 'cuong.le@example.com',
        phone: '0923456789',
        address: '789 Đường Lê Lợi',
        city: 'Thành phố Đà Nẵng',      // Sửa: 'Đà Nẵng' -> 'Thành phố Đà Nẵng'
        district: 'Quận Hải Châu',        // Sửa: 'Hải Châu' -> 'Quận Hải Châu'
        ward: 'Phường Thạch Thang'
    },
    {
        id: 'KH004',
        name: 'Phạm Hồng Đào',
        type: 'Khách mới',
        email: 'dao.pham@example.com',
        phone: '0934567890',
        address: '12 Nguyễn Trãi',
        city: 'Thành phố Cần Thơ',      // Sửa: 'Cần Thơ' -> 'Thành phố Cần Thơ'
        district: 'Quận Ninh Kiều',       // Sửa: 'Ninh Kiều' -> 'Quận Ninh Kiều'
        ward: 'Phường Tân An'
    },
    {
        id: 'KH005',
        name: 'Võ Minh Đức',
        type: 'Thành viên Kim Cương',
        email: 'duc.vo@example.com',
        phone: '0945678901',
        address: '34 Trần Hưng Đạo',
        city: 'Tỉnh Thừa Thiên Huế',    // Sửa: 'Huế' là thành phố thuộc tỉnh này
        district: 'Thành phố Huế',        // Sửa: 'Phú Nhuận' không thuộc Huế, district đúng là 'Thành phố Huế'
        ward: 'Phường Vĩnh Ninh'
    },
    {
        id: 'KH006',
        name: 'Hoàng Thị Em',
        type: 'Khách mới',
        email: 'em.hoang@example.com',
        phone: '0956789012',
        address: '56 Lý Thường Kiệt',
        city: 'Thành phố Hà Nội',       // Sửa: 'Hà Nội' -> 'Thành phố Hà Nội'
        district: 'Quận Hoàn Kiếm',       // Sửa: 'Hoàn Kiếm' -> 'Quận Hoàn Kiếm'
        ward: 'Phường Hàng Bài'
    },
    {
        id: 'KH007',
        name: 'Đinh Văn Giao',
        type: 'Thành viên Bạc',
        email: 'giao.dinh@example.com',
        phone: '0967890123',
        address: '78 Nguyễn Văn Cừ',
        city: 'Thành phố Hải Phòng',    // Sửa: 'Hải Phòng' -> 'Thành phố Hải Phòng'
        district: 'Quận Lê Chân',         // Sửa: 'Lê Chân' -> 'Quận Lê Chân'
        ward: 'Phường An Biên'
    },
    {
        id: 'KH008',
        name: 'Lý Ngọc Hà',
        type: 'Thành viên Vàng',
        email: 'ha.ly@example.com',
        phone: '0978901234',
        address: '90 Trường Chinh',
        city: 'Tỉnh Khánh Hòa',         // Sửa: 'Nha Trang' là thành phố thuộc tỉnh này
        district: 'Thành phố Nha Trang',  // Sửa: 'Vĩnh Thọ' là phường, district đúng là 'Thành phố Nha Trang'
        ward: 'Phường Xương Huân'
    },
    {
        id: 'KH009',
        name: 'Bùi Trung Hiếu',
        type: 'Thành viên Kim Cương',
        email: 'hieu.bui@example.com',
        phone: '0989012345',
        address: '101 Lạc Long Quân',
        city: 'Tỉnh Đồng Nai',           // Sửa: 'Biên Hòa' là thành phố thuộc tỉnh này
        district: 'Thành phố Biên Hòa',   // Sửa: 'Tân Phong' là phường, district đúng là 'Thành phố Biên Hòa'
        ward: 'Phường Tân Tiến'
    },
    {
        id: 'KH010',
        name: 'Ngô Thị Hương',
        type: 'Khách mới',
        email: 'huong.ngo@example.com',
        phone: '0990123456',
        address: '112 Hoàng Diệu',
        city: 'Tỉnh Thái Nguyên',       // Sửa: 'Thái Nguyên' -> 'Tỉnh Thái Nguyên'
        district: 'Thành phố Thái Nguyên',// Sửa: district đúng là 'Thành phố Thái Nguyên'
        ward: 'Phường Trưng Vương'
    },
    {
        id: 'KH011',
        name: 'Đỗ Văn Khang',
        type: 'Thành viên Vàng',
        email: 'khang.do@example.com',
        phone: '0901122334',
        address: '124 Điện Biên Phủ',
        city: 'Tỉnh Bà Rịa - Vũng Tàu',  // Sửa: 'Vũng Tàu' là thành phố thuộc tỉnh này
        district: 'Thành phố Vũng Tàu',   // Sửa: 'Thắng Nhất' là phường, district đúng là 'Thành phố Vũng Tàu'
        ward: 'Phường 7'
    }
];