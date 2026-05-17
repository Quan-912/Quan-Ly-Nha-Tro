import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import {
    DashboardOutlined,
    HomeOutlined,
    UserOutlined,
    FileTextOutlined, FileDoneOutlined, SettingOutlined
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
    const menuItems = [
        { key: '1', icon: <DashboardOutlined />, label: <Link to="/">Tổng quan</Link> },
        { key: '2', icon: <HomeOutlined />, label: <Link to="/rooms">Quản lý Phòng</Link> },
        { key: '3', icon: <UserOutlined />, label: <Link to="/tenants">Khách thuê</Link> },
        { key: '4', icon: <FileDoneOutlined />, label: <Link to="/contracts">Hợp đồng</Link> },
        { key: '5', icon: <FileTextOutlined />, label: <Link to="/invoices">Hóa đơn</Link> },
        { key: '6', icon: <SettingOutlined />, label: <Link to="/services">Dịch vụ & Giá</Link> },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* 1. SỬA SIDER: Thêm style để cố định bên trái */}
            <Sider
                theme="dark"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>QUẢN LÝ NHÀ TRỌ</Title>
                </div>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={menuItems} />
            </Sider>

            <Layout>
                {/* 2. SỬA HEADER: Thêm zIndex và sticky để nó luôn nằm trên cùng khi cuộn nội dung */}
                <Header style={{
                    padding: 0,
                    background: '#fff',
                    textAlign: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px #f0f1f2'
                }}>
                    <Title level={3} style={{ margin: 0 }}>Hệ thống quản lý phòng cho thuê - Phạm Văn Thế Quân</Title>
                </Header>

                <Content style={{ margin: '16px' }}>
                    <div style={{ padding: 24, minHeight: '100%', background: '#fff', borderRadius: '8px' }}>
                        <Outlet />
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    Đồ án thực hiện bởi Phạm Văn Thế Quân ©2026
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;