import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext'; // Sử dụng context của Admin

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
    const { adminUser, loading } = useAdminAuth(); // Lấy cả `adminUser` và `loading` từ context
    const location = useLocation();

    // 1. Trong khi đang kiểm tra session, hiển thị một màn hình chờ
    // Điều này ngăn việc bị "chớp" màn hình đăng nhập rồi mới vào dashboard
    if (loading) {
        return <FullPageSpinner />;
    }

    // 2. Kiểm tra xem có người dùng đăng nhập VÀ có đúng quyền hay không
    const isAuthenticated = adminUser && (adminUser.role === 'admin' || adminUser.role === 'staff');

    if (!isAuthenticated) {
        // Nếu chưa đăng nhập hoặc không có quyền, điều hướng về trang đăng nhập của admin
        // Lưu lại trang họ muốn vào để có thể quay lại sau khi đăng nhập thành công
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // 3. Nếu mọi thứ đều ổn, hiển thị trang được bảo vệ
    return children;
}

export default AdminRoute;