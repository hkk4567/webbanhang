import Home from '../pages/public/Home'
import Product from '../pages/public/Product'
import MultiSearch from '../pages/public/multiSreach'
import CartProduct from '../pages/public/cartProduct'
import AboutUsPage from '../pages/public/AboutUsPage'
import NewsPage from '../pages/public/NewsPage'
import ContactPage from '../pages/public/ContactPage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import SearchResultsPage from '../pages/public/SearchResultsPage'
import ProductDetailPage from '../pages/public/ProductDetailPage'
import PurchaseHistoryPage from '../pages/public/PurchaseHistoryPage'
import CheckoutPage from '../pages/public/CheckoutPage'
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminCustomersPage from '../pages/admin/AdminCustomersPage'
// Giả sử bạn có trang Dashboard
const publicRoutes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/product',
        component: Product,
    },
    {
        path: '/multiSearch',
        component: MultiSearch,
    },
    {
        path: '/cart',
        component: CartProduct,
    },
    {
        path: '/aboutus',
        component: AboutUsPage,
    },
    {
        path: '/newspage',
        component: NewsPage,
    },
    {
        path: '/contactpage',
        component: ContactPage,
    },
    {
        path: '/login',
        component: LoginPage,
    },
    {
        path: '/register',
        component: RegisterPage,
    },
    {
        path: '/search',
        component: SearchResultsPage,
    },
    {
        path: '/product/:id',
        component: ProductDetailPage,
    }
]
const privateRoutes = [
    {
        path: '/history',
        component: PurchaseHistoryPage,
    },
    {
        path: '/checkout',
        component: CheckoutPage,
        layout: null
    }
]
const adminRoutes = [
    {
        path: '/admin/login',
        component: AdminLoginPage,
        layout: null
    },
    {
        path: '/admin/dashboard',
        component: AdminDashboard,
        layout: AdminLayout,
        isPrivate: true
    },
    {
        path: '/admin/products',
        component: AdminProductsPage,
        layout: AdminLayout,
        isPrivate: true
    },
    {
        path: '/admin/customers',
        component: AdminCustomersPage,
        layout: AdminLayout,
        isPrivate: true
    }
    // Thêm các trang admin khác ở đây...
];
export { publicRoutes, privateRoutes, adminRoutes };