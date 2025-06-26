import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client'; // (MỚI) Import socket.io-client
import { toast } from 'react-toastify'; // (MỚI) Import toast để thông báo
// --- BƯỚC 1: IMPORT ĐẦY ĐỦ CÁC HÀM API ---
import {
    getCart,
    addToCart as addToCartApi,
    updateCartItem as updateCartItemApi, // Import hàm cập nhật
    removeFromCart as removeFromCartApi,
    clearCart as clearCartApi
} from '../api/cartService';
import { useAuth } from './AuthContext';
const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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

        // (MỚI) Action để cập nhật một item cụ thể trong giỏ hàng
        case 'UPDATE_SINGLE_ITEM': {
            // Dữ liệu từ socket event `product_updated` là một object Product hoàn chỉnh
            const updatedProduct = action.payload;

            // BƯỚC 1: Tìm item trong giỏ hàng (có cấu trúc phẳng)
            // So sánh `item.productId` với `updatedProduct.id`
            const itemIndex = state.items.findIndex(
                (item) => String(item.productId) === String(updatedProduct.id)
            );
            // Dùng String() để đảm bảo so sánh chuỗi với chuỗi, tránh lỗi kiểu dữ liệu

            // Nếu không tìm thấy, không làm gì cả
            if (itemIndex === -1) {
                return state;
            }

            // BƯỚC 2: Cập nhật item theo cấu trúc phẳng
            const newItems = [...state.items];
            const oldItem = newItems[itemIndex];

            // Tạo item mới bằng cách sao chép item cũ và ghi đè
            // các trường snapshot bằng dữ liệu từ `updatedProduct`
            newItems[itemIndex] = {
                ...oldItem, // Giữ lại quantity, productId, itemTotalPrice...
                name: updatedProduct.name, // Cập nhật tên
                price: updatedProduct.price, // Cập nhật giá
                imageUrl: updatedProduct.imageUrl, // Cập nhật ảnh (nếu cần)
                // CẬP NHẬT LẠI itemTotalPrice CHO ĐÚNG
                itemTotalPrice: updatedProduct.price * oldItem.quantity,
            };

            // BƯỚC 3: Tính toán lại tổng tiền và tổng số item
            const newTotalPrice = newItems.reduce((total, item) => total + item.itemTotalPrice, 0);
            // Tổng số item không đổi vì chỉ cập nhật thông tin sản phẩm
            // const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);

            return {
                ...state,
                items: newItems,
                totalPrice: newTotalPrice,
                // totalItems của state không thay đổi, có thể giữ nguyên
                totalItems: state.totalItems,
            };
        }

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
    const socketRef = useRef(null);
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

    useEffect(() => {
        // Nếu người dùng đã đăng nhập và chưa có kết nối socket
        if (isLoggedIn && !socketRef.current) {
            // 1. Tạo và lưu socket vào ref
            socketRef.current = io(SOCKET_SERVER_URL);
            const socket = socketRef.current;

            console.log("Thiết lập kết nối và trình lắng nghe Socket.IO...");

            // 2. Thiết lập các trình lắng nghe sự kiện CHỈ MỘT LẦN
            socket.on('connect', () => {
                console.log('CartContext đã kết nối tới Socket.IO!');
            });

            socket.on('product_updated', (updatedProductFromServer) => {
                console.log('CartContext nhận được product_updated:', updatedProductFromServer);

                // Hiển thị thông báo toast
                toast.info(`Sản phẩm "${updatedProductFromServer.name}" đã được cập nhật!`);

                // Gửi action đến reducer
                dispatch({
                    type: 'UPDATE_SINGLE_ITEM',
                    payload: updatedProductFromServer
                });
            });

            socket.on('disconnect', () => {
                console.log('CartContext đã ngắt kết nối Socket.IO.');
            });
        }

        // Nếu người dùng đăng xuất và có kết nối socket
        if (!isLoggedIn && socketRef.current) {
            console.log("Đăng xuất, ngắt kết nối Socket.IO...");
            socketRef.current.disconnect();
            socketRef.current = null; // Reset ref
        }

        // --- Dọn dẹp cuối cùng khi CartProvider bị unmount hoàn toàn ---
        return () => {
            if (socketRef.current) {
                console.log("CartProvider unmount, ngắt kết nối Socket.IO.");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isLoggedIn]);

    const value = {
        // Đổi tên để khớp với component
        cartState: state,
        cartItems: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        isLoading: state.isLoading,
        error: state.error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
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