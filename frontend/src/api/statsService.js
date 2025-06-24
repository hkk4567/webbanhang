import apiClient from './apiClient';

// Lấy các số liệu thống kê tổng quan
export const getOverviewStats = () => {
    // Luôn dùng apiClient của admin cho các API thống kê
    return apiClient.admin.get('/stats/overview');
};

// Lấy dữ liệu cho biểu đồ doanh thu (có thể có tham số date_range)
export const getSalesChartData = (params) => {
    return apiClient.admin.get('/stats/sales-chart', { params });
};

// Lấy top sản phẩm (bán chạy hoặc bán chậm)
export const getTopProducts = (params) => {
    // params có thể là { limit: 5, sort: 'desc' } hoặc { limit: 5, sort: 'asc' }
    return apiClient.admin.get('/stats/top-products', { params });
};

// Lấy top khách hàng
export const getTopCustomers = (params) => {
    // params có thể là { limit: 5 }
    return apiClient.admin.get('/stats/top-customers', { params });
};

export const getProductSalesDetails = (productId) => {
    return apiClient.admin.get(`/stats/product-sales/${productId}`);
};