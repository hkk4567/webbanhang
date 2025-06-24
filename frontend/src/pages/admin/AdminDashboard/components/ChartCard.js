import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Spinner, Alert } from 'react-bootstrap'; // Import thêm
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // <-- BƯỚC 1: IMPORT FILLER PLUGIN
} from 'chart.js';
// Import hàm API
import { getSalesChartData } from '../../../../api/statsService';

// --- BƯỚC 2: ĐĂNG KÝ FILLER PLUGIN ---
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);



// Hàm helper để định dạng ngày (không đổi)
const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
};

function ChartCard() {
    // --- State Management ---
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    // State cho việc chọn ngày
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // Sửa lại để lấy đủ 7 ngày

    const [startDate, setStartDate] = useState(formatDateForInput(sevenDaysAgo));
    const [endDate, setEndDate] = useState(formatDateForInput(today));

    // --- BƯỚC 3: THÊM STATE CHO LOADING VÀ LỖI ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- BƯỚC 4: SỬA LẠI HÀM LỌC DỮ LIỆU ĐỂ GỌI API ---
    // Dùng useCallback để tối ưu hóa
    const fetchChartData = useCallback(async () => {
        // Validation ngày
        if (!startDate || !endDate) {
            alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = { startDate, endDate };
            // Gọi API thật sự
            const response = await getSalesChartData(params);
            const apiData = response.data.data; // Giả sử API trả về { labels: [...], data: [...] }

            // Cập nhật state cho Chart.js
            setChartData({
                labels: apiData.labels,
                datasets: [{
                    label: 'Doanh Thu (VND)',
                    data: apiData.data,
                    fill: true, // Cho phép tô màu nền
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.3,
                }]
            });

        } catch (err) {
            console.error("Lỗi khi tải dữ liệu biểu đồ:", err);
            setError("Không thể tải dữ liệu biểu đồ. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]); // Phụ thuộc vào startDate và endDate


    // Tải dữ liệu lần đầu khi component được render
    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]); // Phụ thuộc vào hàm đã được useCallback


    // --- Render Component ---
    return (
        <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                <h5 className="mb-0">Biểu Đồ Doanh Thu</h5>

                {/* Khu vực chọn khoảng thời gian */}
                <div className="d-flex flex-wrap justify-content-end align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <label htmlFor="startDate" className="form-label mb-0 fw-medium small">Từ:</label>
                        <input
                            type="date"
                            id="startDate"
                            className="form-control form-control-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <label htmlFor="endDate" className="form-label mb-0 fw-medium small">Đến:</label>
                        <input
                            type="date"
                            id="endDate"
                            className="form-control form-control-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {/* Nút Lọc giờ sẽ gọi fetchChartData */}
                    <button onClick={fetchChartData} className="btn btn-primary btn-sm" disabled={isLoading}>
                        {isLoading ? (
                            <Spinner as="span" animation="border" size="sm" />
                        ) : (
                            <i className="bi bi-funnel-fill"></i>
                        )}
                    </button>
                </div>
            </div>
            <div className="card-body">
                {/* --- BƯỚC 5: HIỂN THỊ TRẠNG THÁI LOADING/ERROR CHO BIỂU ĐỒ --- */}
                {isLoading ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" />
                        <p className="mt-2">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : (
                    <div style={{ height: '350px' }}>
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: false }
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChartCard;