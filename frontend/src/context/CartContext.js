import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// --- BƯỚC 1: IMPORT ĐẦY ĐỦ CÁC HÀM API ---
import {
    getCart,
    addToCart as addToCartApi,
    updateCartItem as updateCartItemApi, // Import hàm cập nhật
    removeFromCart as removeFromCartApi,
    clearCart as clearCartApi
} from '../api/cartService';
import { useAuth } from './AuthContext';

// --- Trạng thái ban đầu (không đổi) ---
const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: true,
    error: null,
};

// --- Reducer (không đổi) ---
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART_LOADING':
            return { ...state, isLoading: true, error: null };
        case 'SET_CART_SUCCESS':
            return {
                ...state,
                isLoading: false,
                items: action.payload.items,
                totalItems: action.payload.totalItems,
                totalPrice: action.payload.totalPrice,
            };
        case 'SET_CART_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'CLEAR_CART':
            return { ...initialState, isLoading: false };
        default:
            return state;
    }
};

const CartContext = createContext();

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { isLoggedIn } = useAuth(); // Đổi tên thành isLoggedIn cho rõ ràng

    // --- Bọc fetchCart trong useCallback ---
    const fetchCart = useCallback(async () => {
        if (!isLoggedIn) {
            dispatch({ type: 'CLEAR_CART' });
            return;
        }
        dispatch({ type: 'SET_CART_LOADING' });
        try {
            const response = await getCart();
            dispatch({ type: 'SET_CART_SUCCESS', payload: response.data.data });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                dispatch({ type: 'CLEAR_CART' });
            } else {
                console.error("Lỗi khi lấy giỏ hàng:", error);
                dispatch({ type: 'SET_CART_ERROR', payload: 'Không thể tải giỏ hàng.' });
            }
        }
    }, [isLoggedIn]); // Dependency là isLoggedIn

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // --- CÁC HÀM HÀNH ĐỘNG ĐÃ ĐƯỢC SỬA ---

    const addToCart = useCallback(async (productId, quantity) => {
        try {
            await addToCartApi(productId, quantity); // Vẫn dùng API cộng dồn
            await fetchCart();
            // Ném lỗi ra ngoài để component có thể bắt và xử lý
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ:", error);
            throw error;
        }
    }, [fetchCart]);

    const removeFromCart = useCallback(async (productId) => {
        try {
            await removeFromCartApi(productId);
            await fetchCart();
        } catch (error) {
            console.error("Lỗi khi xóa khỏi giỏ:", error);
            throw error;
        }
    }, [fetchCart]);

    // --- BƯỚC 2: SỬA HOÀN TOÀN HÀM updateQuantity ---
    const updateQuantity = useCallback(async (productId, newQuantity) => {
        if (newQuantity < 1) {
            await removeFromCart(productId);
            return;
        }
        try {
            await updateCartItemApi(productId, newQuantity);
            await fetchCart();
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            throw error;
        }
        // Thêm `removeFromCart` vào dependency array
    }, [fetchCart, removeFromCart]);

    const clearCart = useCallback(async () => {
        try {
            await clearCartApi();
            dispatch({ type: 'CLEAR_CART' }); // Xóa ngay ở client, không cần fetch lại
        } catch (error) {
            console.error("Lỗi khi xóa giỏ hàng:", error);
            throw error;
        }
    }, []);

    const value = {
        // Đổi tên để khớp với component
        cartItems: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        isLoading: state.isLoading,
        error: state.error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart phải được sử dụng bên trong một CartProvider');
    }
    return context;
}