import { Fragment } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { publicRoutes, privateRoutes, adminRoutes } from './routes'
import { DefaultLayout } from './components/layout'
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { AdminAuthProvider } from './context/AdminAuthContext';
import PrivateRoute from './components/routes/PrivateRoute'; // Import PrivateRoute
import { CartProvider } from './context/CartContext';
import AdminRoute from './components/routes/AdminRoute'; // Import AdminRoute
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <ToastContainer
              position="bottom-left" // <<< ĐỔI THÀNH "bottom-left"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light" // Bạn có thể đổi thành "dark" hoặc "colored" nếu muốn
            />
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

                  // Nếu route được đánh dấu là private, bọc nó bằng AdminRoute
                  if (route.isPrivate) {
                    element = (
                      <AdminRoute>
                        {element}
                      </AdminRoute>
                    );
                  }

                  return <Route key={index} path={route.path} element={element} />;
                })}
              </Routes>
            </div>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
