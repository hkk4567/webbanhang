import React, { createContext, useState, useContext } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    // Giả sử chúng ta kiểm tra từ localStorage xem admin đã đăng nhập trước đó chưa
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'));

    const adminLogin = (password) => {
        // --- LOGIC XÁC THỰC ADMIN ---
        // Trong thực tế, bạn sẽ gửi password lên server để kiểm tra
        // Ở đây, chúng ta chỉ giả lập
        const ADMIN_PASSWORD = '123456'; // Mật khẩu cứng để test

        if (password === ADMIN_PASSWORD) {
            // Nếu thành công, lưu một "token" giả vào localStorage
            localStorage.setItem('adminToken', 'your_super_secret_admin_token');
            setIsAdminLoggedIn(true);
            return true; // Trả về true để báo thành công
        }
        return false; // Trả về false nếu thất bại
    };

    const adminLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAdminLoggedIn(false);
    };

    const value = { isAdminLoggedIn, adminLogin, adminLogout };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}