import Home from '../pages/Home'
import Product from '../pages/Product'
import { HeaderOnly } from '../components/layout'

const publicRoutes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/product',
        component: Product,
        layout: HeaderOnly
    }
]
const privateRoutes = []
export { publicRoutes, privateRoutes }