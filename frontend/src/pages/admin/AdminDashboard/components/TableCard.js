import React from 'react';

/**
 * Component hiển thị một bảng dữ liệu có thể tái sử dụng.
 * @param {object} props
 * @param {string} props.title - Tiêu đề của card.
 * @param {string[]} props.headers - Mảng các tiêu đề của cột.
 * @param {Array<Array<any>>} props.data - Mảng 2 chiều chứa dữ liệu của các hàng.
 * @param {object} [props.action] - Tùy chọn: đối tượng chứa thông tin về nút hành động.
 * @param {string} props.action.label - Nhãn của nút (ví dụ: 'Xem chi tiết').
 * @param {function} props.onActionClick - Hàm callback được gọi khi nút hành động được nhấn, nhận vào ID của hàng.
 */
function TableCard({ title, headers, data, action, onActionClick, originalData }) {
    return (
        <div className="card shadow-sm h-100">
            <div className="card-header">{title}</div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                {/* Thêm cột "Hành động" nếu có */}
                                {headers.map((header, index) => <th key={index}>{header}</th>)}
                                {action && <th>{action.label || 'Hành động'}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => {
                                // Giả sử phần tử đầu tiên của mỗi hàng là ID duy nhất
                                return (
                                    <tr key={rowIndex}>
                                        {/* Render các ô dữ liệu */}
                                        {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}

                                        {/* Render nút hành động nếu có */}
                                        {action && onActionClick && (
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => onActionClick(originalData[rowIndex])}
                                                >
                                                    {action.label || 'Xem'}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TableCard;