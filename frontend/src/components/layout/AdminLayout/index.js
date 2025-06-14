import React from 'react';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import classNames from 'classnames/bind';
import styles from './AdminLayout.module.scss';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
    return (
        <div className={cx('admin-layout')}>
            <AdminHeader />
            <AdminSidebar />
            <main className={cx('main-content')}>
                {children}
            </main>
        </div>
    );
}

export default AdminLayout;