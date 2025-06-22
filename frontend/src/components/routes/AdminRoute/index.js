import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// Component Spinner để hiển thị trong lúc chờ kiểm tra session
const FullPageSpinner = () => {
    // Bạn có thể tùy chỉnh style cho component này để nó hiện ra giữa màn hình
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Đang tải...</h2>
        </div>
    );
};

function AdminRoute({ children }) {
    const { isAdminLoggedIn, loading } = useAdminAuth();// Lấy cả `adminUser` và `loading` từ context
    const location = useLocation();

    // 1. Trong khi đang kiểm tra session, hiển thị một màn hình chờ
    // Điều này ngăn việc bị "chớp" màn hình đăng nhập rồi mới vào dashboard
    if (loading) {
        return <FullPageSpinner />;
    }

    if (!isAdminLoggedIn) {
        // Lưu lại trang họ đang cố vào để redirect lại sau khi đăng nhập
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
}

export default AdminRoute;