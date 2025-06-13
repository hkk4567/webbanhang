import Home from '../pages/Home'
import Product from '../pages/Product'
import MultiSearch from '../pages/multiSreach'
import CartProduct from '../pages/cartProduct'
import AboutUsPage from '../pages/AboutUsPage'
import NewsPage from '../pages/NewsPage'
import ContactPage from '../pages/ContactPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import SearchResultsPage from '../pages/SearchResultsPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import PurchaseHistoryPage from '../pages/PurchaseHistoryPage'
import CheckoutPage from '../pages/CheckoutPage'

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