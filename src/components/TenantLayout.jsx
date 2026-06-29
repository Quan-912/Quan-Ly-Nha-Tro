import React from 'react';
import axios from "axios";
import { Layout, Menu, Typography, Modal } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const TenantLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        Modal.confirm({
            title: 'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn thoát khỏi hệ thống không?',
            okText: 'Đăng xuất',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk() {
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['x-user-id'];
                delete axios.defaults.headers.common['x-user-role'];
                navigate('/login');
            },
        });
    };

    const menuItems = [
        { key: '/tenant',          icon: <HomeOutlined />,     label: <Link to="/tenant">Phòng của tôi</Link> },
        { key: '/tenant/invoices', icon: <FileTextOutlined />, label: <Link to="/tenant/invoices">Hóa đơn & Sự cố</Link> },
        { key: '/tenant/profile',  icon: <UserOutlined />,     label: <Link to="/tenant/profile">Hồ sơ cá nhân</Link> },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
            label: <span style={{ color: '#ff4d4f' }}>Đăng xuất</span>,
            onClick: handleLogout,
            style: { marginLeft: 'auto' }
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                display: 'flex', alignItems: 'center', background: '#fff',
                padding: '0 20px', boxShadow: '0 2px 8px #f0f1f2', zIndex: 1
            }}>
                <Title level={4} style={{ margin: 0, color: '#1890ff', marginRight: 40 }}>
                    SMART HOUSE
                </Title>
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ flex: 1, minWidth: 0, borderBottom: 'none' }}
                />
            </Header>

            <Content style={{ padding: '24px 20px', marginTop: 16 }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: '80vh' }}>
                    <Title level={3} style={{ marginTop: 0 }}>Xin chào, {user?.full_name || 'Khách thuê'}!</Title>
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Hệ thống dành cho Khách thuê ©2026 - Phạm Văn Thế Quân
            </Footer>
        </Layout>
    );
};

export default TenantLayout;