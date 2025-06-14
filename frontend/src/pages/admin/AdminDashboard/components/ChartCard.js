// src/pages/AdminDashboard/components/ChartCard.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- Helper Functions ---

// Hàm định dạng ngày thành chuỗi 'YYYY-MM-DD' cho input
const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
};

// Hàm tạo dữ liệu giả cho biểu đồ dựa trên khoảng thời gian
// Trong ứng dụng thật, bạn sẽ gọi API ở đây
const generateMockDataForRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const labels = [];
    const data = [];
    let currentDate = start;

    // Tạo nhãn (label) cho mỗi ngày trong khoảng đã chọn
    while (currentDate <= end) {
        // Chỉ lấy ngày và tháng để nhãn không quá dài
        labels.push(`${currentDate.getDate()}/${currentDate.getMonth() + 1}`);
        // Tạo dữ liệu doanh thu ngẫu nhiên cho ngày đó
        data.push(Math.floor(Math.random() * (2500000 - 500000 + 1)) + 500000);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return { labels, data };
};


function ChartCard() {
    // --- State Management ---
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    // Đặt giá trị mặc định là 7 ngày gần nhất
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(formatDateForInput(sevenDaysAgo));
    const [endDate, setEndDate] = useState(formatDateForInput(today));

    // Hàm xử lý việc lọc dữ liệu
    const handleFilterData = () => {
        // Kiểm tra logic ngày tháng
        if (!startDate || !endDate) {
            alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
            return;
        }

        console.log(`Lọc dữ liệu từ ${startDate} đến ${endDate}`);

        // Tạo dữ liệu giả mới dựa trên khoảng ngày đã chọn
        const { labels, data } = generateMockDataForRange(startDate, endDate);

        setChartData({
            labels: labels,
            datasets: [{
                label: 'Doanh Thu (VND)',
                data: data,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.3,
            }]
        });
    };

    // Tải dữ liệu lần đầu khi component được render
    useEffect(() => {
        handleFilterData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần


    // --- Render Component ---
    return (
        <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Biểu Đồ Doanh Thu</h5>
            </div>
            <div className="card-body">
                {/* Khu vực chọn khoảng thời gian */}
                <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <label htmlFor="startDate" className="form-label mb-0 fw-medium">Từ ngày:</label>
                        <input
                            type="date"
                            id="startDate"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <label htmlFor="endDate" className="form-label mb-0 fw-medium">Đến ngày:</label>
                        <input
                            type="date"
                            id="endDate"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button onClick={handleFilterData} className="btn btn-primary">
                        <i className="bi bi-funnel-fill me-2"></i> {/* Thêm icon cho đẹp */}
                        Lọc
                    </button>
                </div>

                {/* Biểu đồ */}
                <Line data={chartData} />
            </div>
        </div>
    );
}

export default ChartCard;