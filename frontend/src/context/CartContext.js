import React, { createContext, useState, useContext, useMemo } from 'react';

// 1. Tạo Context
const CartContext = createContext(null);

// 2. Tạo Provider Component - Component này sẽ chứa toàn bộ logic và state
export function CartProvider({ children }) {
    // State chính của giỏ hàng, bắt đầu là một mảng rỗng
    const [cartItems, setCartItems] = useState([]);

    // --- CÁC HÀM XỬ LÝ GIỎ HÀNG ---

    // Hàm thêm sản phẩm vào giỏ
    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                // Nếu đã có, cộng thêm số lượng mới vào số lượng cũ
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                // Nếu chưa có, thêm sản phẩm mới vào giỏ với số lượng được cung cấp
                return [...prevItems, { ...product, quantity: quantity }];
            }
        });
    };

    // Hàm cập nhật số lượng
    const updateQuantity = (productId, newQuantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Hàm xóa sản phẩm khỏi giỏ
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    // Hàm xóa sạch giỏ hàng
    const clearCart = () => {
        setCartItems([]);
    };

    // --- CÁC GIÁ TRỊ TÍNH TOÁN ---
    // Sử dụng useMemo để tối ưu, chỉ tính lại khi cartItems thay đổi
    const cartItemCount = useMemo(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    // Giá trị mà Context sẽ cung cấp cho các component con
    const value = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartItemCount,
        totalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// 3. Tạo một custom hook để sử dụng Context dễ dàng hơn
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được sử dụng bên trong một CartProvider');
    }
    return context;
}