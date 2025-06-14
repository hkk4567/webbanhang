import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

function AdminPrivateRoute({ children }) {
    const { isAdminLoggedIn } = useAdminAuth();

    if (!isAdminLoggedIn) {
        // Nếu admin chưa đăng nhập, điều hướng về trang đăng nhập của admin
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

export default AdminPrivateRoute;