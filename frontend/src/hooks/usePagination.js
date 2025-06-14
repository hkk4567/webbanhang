import { useState, useMemo, useEffect } from 'react';

/**
 * Một custom hook để quản lý logic phân trang.
 * @param {Array} data - Mảng dữ liệu đầy đủ cần phân trang.
 * @param {number} itemsPerPage - Số lượng item trên mỗi trang.
 * @returns {object} - Trả về các giá trị và hàm để điều khiển phân trang.
 */
export function usePagination(data, itemsPerPage) {
    const [currentPage, setCurrentPage] = useState(1);

    // Tính tổng số trang, làm tròn lên
    const maxPage = Math.ceil(data.length / itemsPerPage);
    // Hook này sẽ chạy mỗi khi dữ liệu (data) được truyền vào thay đổi.
    useEffect(() => {
        // Khi người dùng lọc và kết quả thay đổi, chúng ta cần đảm bảo
        // họ luôn được đưa về trang đầu tiên của kết quả mới.
        setCurrentPage(1);
    }, [data]);

    // Sử dụng useMemo để chỉ tính toán lại dữ liệu của trang hiện tại khi cần thiết
    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return data.slice(begin, end);
    }, [data, currentPage, itemsPerPage]);

    // Hàm để chuyển đến trang tiếp theo
    const next = () => {
        setCurrentPage(page => Math.min(page + 1, maxPage));
    };

    // Hàm để quay lại trang trước
    const prev = () => {
        setCurrentPage(page => Math.max(page - 1, 1));
    };

    // Hàm để nhảy đến một trang cụ thể
    const jump = (page) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(Math.min(pageNumber, maxPage));
    };

    // Trả về tất cả những gì component UI cần
    return { next, prev, jump, currentData, currentPage, maxPage };
}