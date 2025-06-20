import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Import custom hook của chúng ta

function PrivateRoute({ children }) {
    const { isLoggedIn } = useAuth(); // Lấy trạng thái đăng nhập từ context
    const location = useLocation(); // Lấy vị trí hiện tại của URL

    if (!isLoggedIn) {
        // Nếu chưa đăng nhập, điều hướng về trang /login.
        // `state={{ from: location }}`: Lưu lại trang mà người dùng đang cố gắng truy cập.
        // Sau khi đăng nhập thành công, chúng ta có thể điều hướng họ quay lại trang này.
        // `replace`: Thay thế entry hiện tại trong history, để người dùng không thể nhấn "Back" quay lại trang private.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu đã đăng nhập, hiển thị component con (trang được bảo vệ)
    return children;
}

export default PrivateRoute;