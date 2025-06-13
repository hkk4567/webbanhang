import React, { useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './Pagination.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const DOTS = '...';

// Hàm tạo một mảng số từ start đến end
const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};

function Pagination({ onPageChange, totalPageCount, currentPage }) {
    // Logic để tạo ra các số trang hiển thị (ví dụ: 1, 2, ..., 10)
    const paginationRange = useMemo(() => {
        // Nếu số trang ít, hiển thị tất cả
        if (totalPageCount <= 5) {
            return range(1, totalPageCount);
        }

        const leftSiblingIndex = Math.max(currentPage - 1, 1);
        const rightSiblingIndex = Math.min(currentPage + 1, totalPageCount);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftRange = range(1, 3);
            return [...leftRange, DOTS, totalPageCount];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightRange = range(totalPageCount - 2, totalPageCount);
            return [1, DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [1, DOTS, ...middleRange, DOTS, totalPageCount];
        }
    }, [totalPageCount, currentPage]);

    if (currentPage === 0 || paginationRange.length < 2) {
        return null;
    }

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    return (
        <ul className={cx('pagination-container')}>
            {/* Nút Previous */}
            <li className={cx('pagination-item', { disabled: currentPage === 1 })}>
                <button onClick={onPrevious} disabled={currentPage === 1} aria-label="Trang trước">
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
            </li>

            {/* Các nút số trang */}
            {paginationRange.map((pageNumber, index) => {
                if (pageNumber === DOTS) {
                    return <li key={index} className={cx('pagination-item', 'dots')}>…</li>;
                }

                return (
                    <li key={index} className={cx('pagination-item', { selected: pageNumber === currentPage })}>
                        <button onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>
                    </li>
                );
            })}

            {/* Nút Next */}
            <li className={cx('pagination-item', { disabled: currentPage === totalPageCount })}>
                <button onClick={onNext} disabled={currentPage === totalPageCount} aria-label="Trang sau">
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </li>
        </ul>
    );
}

export default Pagination;