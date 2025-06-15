import React, { useState } from 'react';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import classNames from 'classnames/bind';
import styles from './AdminLayout.module.scss';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
    // State để quản lý việc hiển thị sidebar trên mobile
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Hàm để bật/tắt sidebar
    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={cx('admin-layout', 'has-fixed-header')}>
            <AdminHeader onToggleSidebar={toggleSidebar} />

            {/* Div mới này sẽ chứa cả sidebar và nội dung chính */}
            <div className={cx('admin-body')}>
                <AdminSidebar
                    isMobileOpen={isSidebarOpen}
                    onHide={() => setSidebarOpen(false)}
                />

                <main className={cx('main-content')}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;