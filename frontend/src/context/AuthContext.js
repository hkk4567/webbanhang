import React, { createContext, useState, useContext } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Tạo Provider Component
// Component này sẽ "bao bọc" toàn bộ ứng dụng của bạn
export function AuthProvider({ children }) {
    // Sử dụng state để lưu trạng thái đăng nhập.
    // Trong ứng dụng thực tế, bạn sẽ khởi tạo giá trị này từ localStorage hoặc cookie.
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    // Hàm để đăng nhập
    const login = (userData) => {
        const mockUserData = userData || {
            name: 'Nguyen Van A',
            email: 'nguyenvana@example.com',
        };
        setIsLoggedIn(true);
        setUser(mockUserData);
    };

    // Hàm để đăng xuất
    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
    };

    const value = { isLoggedIn, user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Tạo một custom hook để dễ dàng sử dụng context ở các component khác
export function useAuth() {
    return useContext(AuthContext);
}