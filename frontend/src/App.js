import { Fragment } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { publicRoutes, privateRoutes } from './routes'
import { DefaultLayout } from './components/layout'

import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import PrivateRoute from './components/common/PrivateRoute'; // Import PrivateRoute
function App() {
  return (
    <AuthProvider>
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
