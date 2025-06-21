import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * Một custom hook để quản lý state và logic cho việc phân trang phía server.
 * Nó không xử lý dữ liệu, chỉ quản lý số trang và thông tin phân trang.
 *
 * @param {object} paginationData - Object phân trang nhận về từ API.
 *   Ví dụ: { totalItems: 100, totalPages: 10, currentPage: 1, limit: 10 }
 * @returns {object} - Trả về các giá trị và hàm để điều khiển phân trang.
 */
export function usePagination(paginationData = {}) {
    const {
        currentPage: serverCurrentPage = 1,
        totalPages: serverTotalPages = 1,
    } = paginationData;

    const [requestedPage, setRequestedPage] = useState(1);

    useEffect(() => {
        // Đồng bộ state nội bộ với state từ server
        setRequestedPage(serverCurrentPage);
    }, [serverCurrentPage]);

    // Sử dụng useCallback để đảm bảo các hàm không bị tạo lại không cần thiết
    const goToPage = useCallback((page) => {
        const newPage = Math.max(1, Math.min(page, serverTotalPages || 1));
        setRequestedPage(newPage);
    }, [serverTotalPages]);

    const next = useCallback(() => {
        // Chỉ cho phép "next" nếu chưa phải trang cuối
        if (serverCurrentPage < serverTotalPages) {
            goToPage(serverCurrentPage + 1);
        }
    }, [serverCurrentPage, serverTotalPages, goToPage]);

    const prev = useCallback(() => {
        // Chỉ cho phép "prev" nếu không phải trang đầu
        if (serverCurrentPage > 1) {
            goToPage(serverCurrentPage - 1);
        }
    }, [serverCurrentPage, goToPage]);

    // Props dành riêng cho component Pagination UI
    const paginationProps = useMemo(() => ({
        currentPage: serverCurrentPage,
        totalPageCount: serverTotalPages,
        onPageChange: goToPage,
    }), [serverCurrentPage, serverTotalPages, goToPage]);

    // Trả về một bộ công cụ đầy đủ
    return {
        requestedPage,      // Trang đang được yêu cầu, để useEffect theo dõi
        paginationProps,    // Props cho component <Pagination />
        goToPage,           // Hàm để nhảy đến trang cụ thể
        next,               // Hàm để sang trang tiếp theo
        prev,               // Hàm để về trang trước
        // Thêm các cờ hữu ích để component cha có thể dễ dàng disable nút
        hasNextPage: serverCurrentPage < serverTotalPages,
        hasPreviousPage: serverCurrentPage > 1,
    };
}