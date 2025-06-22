import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdminApi, logoutAdminApi, getMeAdminApi } from '../api/authService';

const AdminAuthContext = createContext();

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminSession = async () => {
            try {
                // API /users/me sẽ được gọi, trình duyệt sẽ tự đính kèm cookie 'jwt_admin'
                const response = await getMeAdminApi();
                // Chỉ set là admin nếu role hợp lệ
                if (['admin', 'staff'].includes(response.data.data.user.role)) {
                    setAdmin(response.data.data.user);
                    setIsAdminLoggedIn(true);
                }
            } catch (error) {
                setAdmin(null);
                setIsAdminLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };
        checkAdminSession();
    }, []);

    const login = async (email, password) => {
        const response = await loginAdminApi(email, password);
        const loggedInAdmin = response.data.data.user;
        setAdmin(loggedInAdmin);
        setIsAdminLoggedIn(true);
        return loggedInAdmin;
    };

    const logout = async () => {
        try {
            await logoutAdminApi();
        } catch (error) {
            console.error("Lỗi khi đăng xuất admin API:", error);
        } finally {
            setAdmin(null);
            setIsAdminLoggedIn(false);
        }
    };

    const value = { admin, isAdminLoggedIn, loading, login, logout };

    return (
        <AdminAuthContext.Provider value={value}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
}