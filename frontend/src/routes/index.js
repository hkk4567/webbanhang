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
export { publicRoutes, privateRoutes }