import { Fragment } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { publicRoutes } from './routes'
import { DefaultLayout } from './components/layout'
function App() {
  return (
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
