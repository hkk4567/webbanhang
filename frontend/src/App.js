import { Fragment } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { publicRoutes, privateRoutes, adminRoutes } from './routes'
import { DefaultLayout } from './components/layout'
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import PrivateRoute from './components/common/PrivateRoute'; // Import PrivateRoute
import { CartProvider } from './context/CartContext';
import AdminPrivateRoute from './components/AdminPrivateRoute';
function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                {publicRoutes.map((route, key) => {
                  let Layout = DefaultLayout;
                  if (route.layout) {
                    Layout = route.layout;
                  } else if (route.layout === null) {
                    Layout = Fragment;
                  }
                  const Page = route.component;
                  return <Route key={key} path={route.path} element={<Layout><Page /></Layout>}></Route>
                })}

                {privateRoutes.map((route, index) => {
                  let Layout = DefaultLayout;
                  if (route.layout) {
                    Layout = route.layout;
                  } else if (route.layout === null) {
                    Layout = Fragment;
                  }
                  const Page = route.component;
                  return (
                    <Route
                      key={index}
                      path={route.path}
                      element={
                        // Bọc component trang bằng PrivateRoute
                        <PrivateRoute>
                          <Layout><Page /></Layout>
                        </PrivateRoute>
                      }
                    />
                  );
                })}
                {/* --- RENDER CÁC ROUTE CỦA ADMIN --- */}
                {adminRoutes.map((route, index) => {
                  const Page = route.component;
                  let Layout = route.layout || Fragment; // Mặc định là không có layout

                  let element = (
                    <Layout>
                      <Page />
                    </Layout>
                  );

                  // Nếu route được đánh dấu là private, bọc nó bằng AdminPrivateRoute
                  if (route.isPrivate) {
                    element = (
                      <AdminPrivateRoute>
                        {element}
                      </AdminPrivateRoute>
                    );
                  }

                  return <Route key={index} path={route.path} element={element} />;
                })}
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
