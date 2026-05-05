import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <Sidebar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
