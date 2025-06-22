import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserApi, logoutUserApi, getMeUserApi } from '../api/authService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // Trạng thái kiểm tra session ban đầu

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                // Thử gọi API /users/me để lấy thông tin user nếu có cookie hợp lệ
                const response = await getMeUserApi();
                setUser(response.data.data.user);
                setIsLoggedIn(true);
            } catch (error) {
                // Lỗi (thường là 401) có nghĩa là không có session hợp lệ
                setUser(null);
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };

        checkUserSession();
    }, []);

    const login = async (email, password) => {
        const response = await loginUserApi(email, password); // Gọi đúng hàm login của user
        const loggedInUser = response.data.data.user;
        setUser(loggedInUser);
        setIsLoggedIn(true);
        return loggedInUser;
    };

    const logout = async () => {
        try {
            await logoutUserApi(); // Gọi đúng hàm logout của user
        } catch (error) {
            console.error("Lỗi khi đăng xuất API:", error);
        } finally {
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    const value = {
        user,
        isLoggedIn,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}