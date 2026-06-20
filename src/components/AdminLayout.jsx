import React from 'react';
import { Layout, Menu, Typography, Modal } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined, HomeOutlined, UserOutlined,
    FileTextOutlined, FileDoneOutlined, SettingOutlined,
    AlertOutlined, SafetyCertificateOutlined,
    AuditOutlined, LogoutOutlined
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        Modal.confirm({
            title: 'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn thoát khỏi hệ thống không?',
            okText: 'Đăng xuất', cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk() { localStorage.removeItem('user'); navigate('/login'); },
        });
    };

    const menuItems = [
        { key: '/admin',                  icon: <DashboardOutlined />,        label: <Link to="/admin">Tổng quan</Link> },
        { key: '/admin/rooms',            icon: <HomeOutlined />,             label: <Link to="/admin/rooms">Quản lý Phòng</Link> },
        { key: '/admin/tenants',          icon: <UserOutlined />,             label: <Link to="/admin/tenants">Khách thuê</Link> },
        { key: '/admin/bookings',         icon: <AuditOutlined />,            label: <Link to="/admin/bookings">Duyệt đặt phòng</Link> },
        { key: '/admin/contracts',        icon: <FileDoneOutlined />,         label: <Link to="/admin/contracts">Hợp đồng</Link> },
        { key: '/admin/invoices',         icon: <FileTextOutlined />,         label: <Link to="/admin/invoices">Hóa đơn</Link> },
        { key: '/admin/services',         icon: <SettingOutlined />,          label: <Link to="/admin/services">Dịch vụ & Giá</Link> },
        { key: '/admin/issues',           icon: <AlertOutlined />,            label: <Link to="/admin/issues">Quản lý sự cố</Link> },
        { key: '/admin/change-password',  icon: <SafetyCertificateOutlined />,label: <Link to="/admin/change-password">Đổi mật khẩu</Link> },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
            label: <span style={{ color: '#ff4d4f' }}>Đăng xuất</span>,
            onClick: handleLogout
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider theme="dark" style={{ overflow: 'auto', height: '100vh', position: 'sticky', left: 0, top: 0, bottom: 0 }}>
                <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>QUẢN LÝ NHÀ TRỌ</Title>
                </div>
                <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline" items={menuItems} />
            </Sider>
            <Layout>
                <Header style={{
                    padding: 0, background: '#fff', textAlign: 'center',
                    position: 'sticky', top: 0, zIndex: 1, width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px #f0f1f2'
                }}>
                    <Title level={3} style={{ margin: 0 }}>Hệ thống quản lý phòng cho thuê - Phạm Văn Thế Quân</Title>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <div style={{ padding: 24, minHeight: '100%', background: '#fff', borderRadius: '8px' }}>
                        <Outlet />
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Đồ án thực hiện bởi Phạm Văn Thế Quân ©2026</Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;