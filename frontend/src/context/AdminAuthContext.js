import React, { createContext, useState, useContext } from 'react';

// Tạo context
const AdminAuthContext = createContext(null);

// Hàm helper để lấy thông tin admin từ sessionStorage
const getAdminFromStorage = () => {
    const adminData = sessionStorage.getItem('adminUser');
    try {
        // Nếu có dữ liệu, phân tích nó từ JSON, ngược lại trả về null
        return adminData ? JSON.parse(adminData) : null;
    } catch (error) {
        console.error("Failed to parse admin data from storage", error);
        return null;
    }
};

// Provider component
export function AdminAuthProvider({ children }) {
    // State để lưu thông tin của admin đang đăng nhập (hoặc null)
    // Khởi tạo state bằng cách đọc từ sessionStorage
    const [adminUser, setAdminUser] = useState(getAdminFromStorage());

    // --- LOGIC XÁC THỰC ADMIN ---
    const adminLogin = (email, password) => {
        // Trong thực tế, đây là nơi bạn sẽ gọi API
        // POST /api/admin/login với body là { email, password }

        // --- Giả lập logic xác thực ---
        const ADMIN_EMAIL = 'admin@example.com';
        const ADMIN_PASSWORD = '123456'; // Lấy từ .env trong thực tế

        // Kiểm tra thông tin đăng nhập
        if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Tạo đối tượng thông tin admin để lưu trữ
            const adminData = {
                email: ADMIN_EMAIL,
                name: 'Admin Manager', // Hoặc lấy từ API trả về
                role: 'admin',
            };

            // Lưu thông tin vào sessionStorage dưới dạng chuỗi JSON
            sessionStorage.setItem('adminUser', JSON.stringify(adminData));

            // Cập nhật state
            setAdminUser(adminData);

            return true; // Báo hiệu đăng nhập thành công
        }

        return false; // Báo hiệu đăng nhập thất bại
    };

    const adminLogout = () => {
        // Xóa thông tin khỏi sessionStorage
        sessionStorage.removeItem('adminUser');
        // Reset state
        setAdminUser(null);
    };

    // Tạo giá trị cho context
    // `isAdminLoggedIn` giờ sẽ là một giá trị được tính toán dựa trên `adminUser`
    const value = {
        adminUser,
        isAdminLoggedIn: !!adminUser, // Chuyển đổi object thành boolean
        adminLogin,
        adminLogout,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

// Hook tùy chỉnh để sử dụng context
export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === null) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}