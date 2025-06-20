import React, { createContext, useContext, useState, useEffect } from 'react';
// Import các hàm API
import { loginApi, logoutApi, getMeApi } from '../services/apiService';

const AdminAuthContext = createContext();

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true); // Thêm state loading để kiểm tra session lúc đầu

    // Kiểm tra xem có session đăng nhập còn hợp lệ không khi tải lại trang
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // Thử gọi API /users/me, API này được bảo vệ
                const response = await getMeApi();
                // Nếu thành công, user là admin/staff và lưu thông tin
                const user = response.data.data.user;
                if (user.role === 'admin' || user.role === 'staff') {
                    setAdminUser(user);
                }
            } catch (error) {
                // Nếu lỗi (401 Unauthorized), nghĩa là chưa đăng nhập
                setAdminUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);


    const adminLogin = async (email, password) => {
        // Hàm login bây giờ sẽ là một hàm async và trả về dữ liệu hoặc ném ra lỗi
        const response = await loginApi(email, password);
        const user = response.data.data.user;

        // KIỂM TRA QUYỀN: Chỉ cho phép admin hoặc staff đăng nhập trang quản trị
        if (user.role !== 'admin' && user.role !== 'staff') {
            // Ném ra một lỗi tùy chỉnh để component có thể bắt được
            const error = new Error('Tài khoản của bạn không có quyền truy cập trang quản trị.');
            error.name = 'AuthorizationError';
            // Gọi API logout để xóa cookie vừa được tạo
            await logoutApi();
            throw error;
        }

        // Nếu đăng nhập và phân quyền thành công, cập nhật state
        setAdminUser(user);
        return user; // Trả về thông tin user
    };

    const adminLogout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            // Dù API có lỗi, vẫn xóa thông tin user ở client
        } finally {
            setAdminUser(null);
        }
    };

    const value = {
        adminUser,
        loading,
        adminLogin,
        adminLogout,
    };

    // Chỉ render children khi đã kiểm tra xong session
    return (
        <AdminAuthContext.Provider value={value}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
}