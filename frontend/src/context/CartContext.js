import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCart, addToCart as addToCartApi, removeFromCart as removeFromCartApi, clearCart as clearCartApi } from '../api/cartService';
import { useAuth } from './AuthContext';

// --- Trạng thái ban đầu ---
const initialState = {
    items: [],       // Mảng các sản phẩm trong giỏ
    totalItems: 0,   // Tổng số lượng các sản phẩm
    totalPrice: 0,   // Tổng giá tiền
    isLoading: true, // Trạng thái loading khi lấy giỏ hàng lần đầu
    error: null,
};

// --- Reducer để quản lý các hành động cập nhật state ---
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
            return { ...initialState, isLoading: false }; // Reset về ban đầu
        default:
            return state;
    }
};

// --- Tạo Context ---
const CartContext = createContext();

// --- Tạo Provider Component ---
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { user } = useAuth();

    // Hàm để lấy giỏ hàng từ API và cập nhật state
    const fetchCart = async () => {
        dispatch({ type: 'SET_CART_LOADING' });
        try {
            const response = await getCart();
            dispatch({ type: 'SET_CART_SUCCESS', payload: response.data.data });
        } catch (error) {
            // Nếu lỗi 401 (chưa đăng nhập), không coi là lỗi, chỉ là giỏ hàng trống
            if (error.response && error.response.status === 401) {
                dispatch({ type: 'CLEAR_CART' });
            } else {
                console.error("Lỗi khi lấy giỏ hàng:", error);
                dispatch({ type: 'SET_CART_ERROR', payload: 'Không thể tải giỏ hàng.' });
            }
        }
    };

    // Lấy giỏ hàng khi người dùng đăng nhập hoặc khi component được mount lần đầu
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            dispatch({ type: 'CLEAR_CART' });
        }
    }, [user]);


    // --- Các hàm hành động mà các component khác sẽ gọi ---

    const addToCart = async (productId, quantity) => {
        try {
            await addToCartApi(productId, quantity);
            // Sau khi thêm thành công, gọi lại API để lấy giỏ hàng mới nhất
            await fetchCart();
            // (Tùy chọn) Hiển thị thông báo thành công
            // toast.success("Đã thêm vào giỏ hàng!");
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ:", error);
            // (Tùy chọn) Hiển thị thông báo lỗi
            // toast.error(error.response?.data?.message || "Không thể thêm sản phẩm.");
        }
    };

    // Thực chất nó gọi lại chính API addToCart, vì backend sẽ tự xử lý việc ghi đè
    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            // Nếu số lượng nhỏ hơn 1, thì thực hiện xóa
            await removeFromCart(productId);
            return;
        }
        try {
            await addToCartApi(productId, newQuantity);
            await fetchCart();
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await removeFromCartApi(productId);
            await fetchCart();
        } catch (error) {
            console.error("Lỗi khi xóa khỏi giỏ:", error);
        }
    };

    const clearCart = async () => {
        try {
            await clearCartApi();
            await fetchCart(); // Sẽ trả về giỏ hàng trống
        } catch (error) {
            console.error("Lỗi khi xóa giỏ hàng:", error);
        }
    };


    const value = {
        ...state, // Trả ra items, totalItems, totalPrice, isLoading, error
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

// --- Tạo Custom Hook để sử dụng Context dễ dàng hơn ---
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart phải được sử dụng bên trong một CartProvider');
    }
    return context;
}