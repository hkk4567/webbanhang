import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';// Sử dụng context của Admin

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
    const { user, isLoggedIn, loading } = useAuth();// Lấy cả `adminUser` và `loading` từ context
    const location = useLocation();

    // 1. Trong khi đang kiểm tra session, hiển thị một màn hình chờ
    // Điều này ngăn việc bị "chớp" màn hình đăng nhập rồi mới vào dashboard
    if (loading) {
        return <FullPageSpinner />;
    }

    if (!isLoggedIn || !user || (user.role !== 'admin' && user.role !== 'staff')) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}

export default AdminRoute;