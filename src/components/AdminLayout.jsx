import React from 'react';
import { Layout, Menu, Typography, Modal, Avatar, Space } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined, HomeOutlined, UserOutlined,
    FileTextOutlined, FileDoneOutlined, SettingOutlined,
    AlertOutlined, SafetyCertificateOutlined,
    AuditOutlined, LogoutOutlined, BellOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Footer, Sider } = Layout;
const { Text, Title } = Typography;

// Map route → tiêu đề trang + icon hiển thị trên header
const PAGE_META = {
    '/admin':                 { title: 'Báo cáo tổng quan',    icon: <DashboardOutlined /> },
    '/admin/rooms':           { title: 'Quản lý phòng',        icon: <HomeOutlined /> },
    '/admin/tenants':         { title: 'Danh sách khách thuê', icon: <UserOutlined /> },
    '/admin/bookings':        { title: 'Duyệt đặt phòng',      icon: <AuditOutlined /> },
    '/admin/contracts':       { title: 'Hợp đồng thuê',        icon: <FileDoneOutlined /> },
    '/admin/invoices':        { title: 'Hóa đơn & Thu tiền',   icon: <FileTextOutlined /> },
    '/admin/services':        { title: 'Dịch vụ & Đơn giá',    icon: <SettingOutlined /> },
    '/admin/issues':          { title: 'Quản lý sự cố',        icon: <AlertOutlined /> },
    '/admin/change-password': { title: 'Đổi mật khẩu',         icon: <SafetyCertificateOutlined /> },
};

const AdminLayout = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const user      = JSON.parse(localStorage.getItem('user') || '{}');
    const pageMeta  = PAGE_META[location.pathname] || { title: 'Quản lý hệ thống', icon: <DashboardOutlined /> };

    const handleLogout = () => {
        Modal.confirm({
            title:   'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn thoát khỏi hệ thống không?',
            okText:  'Đăng xuất',
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
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Tổng quan</Link>,
        },
        {
            key: '/admin/rooms',
            icon: <HomeOutlined />,
            label: <Link to="/admin/rooms">Quản lý Phòng</Link>,
        },
        {
            key: '/admin/tenants',
            icon: <UserOutlined />,
            label: <Link to="/admin/tenants">Khách thuê</Link>,
        },
        {
            key: '/admin/bookings',
            icon: <AuditOutlined />,
            label: <Link to="/admin/bookings">Duyệt đặt phòng</Link>,
        },
        {
            key: '/admin/contracts',
            icon: <FileDoneOutlined />,
            label: <Link to="/admin/contracts">Hợp đồng</Link>,
        },
        {
            key: '/admin/invoices',
            icon: <FileTextOutlined />,
            label: <Link to="/admin/invoices">Hóa đơn</Link>,
        },
        {
            key: '/admin/services',
            icon: <SettingOutlined />,
            label: <Link to="/admin/services">Dịch vụ & Giá</Link>,
        },
        {
            key: '/admin/issues',
            icon: <AlertOutlined />,
            label: <Link to="/admin/issues">Sự cố</Link>,
        },
        {
            key: '/admin/change-password',
            icon: <SafetyCertificateOutlined />,
            label: <Link to="/admin/change-password">Đổi mật khẩu</Link>,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ color: '#ff6b81' }} />,
            label: <span style={{ color: '#ff6b81' }}>Đăng xuất</span>,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>

            {/* ══════════════════════════════
                SIDEBAR — deep space gradient
            ══════════════════════════════ */}
            <Sider
                className="admin-sider"
                theme="dark"
                width={240}
                style={{
                    background: 'linear-gradient(180deg, #0D0B14 0%, #1A1744 55%, #0D0B14 100%)',
                    overflow: 'auto',
                    height: '100vh',
                    position: 'sticky',
                    left: 0, top: 0, bottom: 0,
                    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.40)',
                    flexShrink: 0,
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: '22px 18px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        {/* Icon box với gradient violet → cyan */}
                        <div style={{
                            width: 38, height: 38, flexShrink: 0,
                            background: 'linear-gradient(135deg, #6C63FF 0%, #06B6D4 100%)',
                            borderRadius: 11,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(108, 99, 255, 0.50)',
                        }}>
                            <HomeOutlined style={{ color: '#fff', fontSize: 19 }} />
                        </div>
                        <div>
                            {/* Tên thương hiệu với gradient text */}
                            <div style={{
                                fontWeight: 800, fontSize: 15, letterSpacing: 0.6,
                                background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                lineHeight: 1.2,
                            }}>
                                SMART HOUSE
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, marginTop: 1 }}>
                                Quản lý nhà trọ
                            </div>
                        </div>
                    </div>
                </div>

                {/* User chip trong sidebar */}
                <div style={{
                    padding: '13px 18px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: 6,
                }}>
                    <Avatar
                        size={34}
                        style={{
                            background: 'linear-gradient(135deg, #6C63FF, #06B6D4)',
                            fontSize: 14, fontWeight: 700, flexShrink: 0,
                        }}
                    >
                        {user.full_name?.charAt(0)?.toUpperCase() || 'A'}
                    </Avatar>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{
                            color: '#fff', fontSize: 13, fontWeight: 600,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {user.full_name || 'Admin'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>
                            Quản trị viên
                        </div>
                    </div>
                </div>

                {/* Nav menu */}
                <Menu
                    theme="dark"
                    selectedKeys={[location.pathname]}
                    mode="inline"
                    items={menuItems}
                    style={{ background: 'transparent', border: 'none', paddingBottom: 16 }}
                />

                {/* Phiên bản */}
                <div style={{
                    position: 'absolute', bottom: 12, left: 0, right: 0,
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.18)',
                    fontSize: 11,
                }}>
                    v1.0.0 · 2026
                </div>
            </Sider>

            {/* ══════════════════════════════
                MAIN AREA
            ══════════════════════════════ */}
            <Layout style={{ background: '#F4F3FF' }}>

                {/* Header — gradient accent line ở bottom qua .admin-header CSS class */}
                <Header
                    className="admin-header"
                    style={{
                        padding: '0 24px',
                        background: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 2px 10px rgba(108, 99, 255, 0.08)',
                        position: 'sticky', top: 0, zIndex: 10,
                        height: 60,
                    }}
                >
                    {/* Tiêu đề trang hiện tại */}
                    <Space align="center" size={10}>
                        <span style={{ color: '#6C63FF', fontSize: 18, lineHeight: 1 }}>
                            {pageMeta.icon}
                        </span>
                        <Title level={5} style={{ margin: 0, color: '#1E1B4B', fontWeight: 700 }}>
                            {pageMeta.title}
                        </Title>
                    </Space>

                    {/* Khu vực bên phải: bell + user pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <BellOutlined style={{ fontSize: 19, color: '#9CA3AF', cursor: 'pointer' }} />

                        {/* User pill */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '5px 12px 5px 6px',
                            background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)',
                            borderRadius: 20,
                            border: '1px solid rgba(108, 99, 255, 0.18)',
                            cursor: 'default',
                        }}>
                            <Avatar
                                size={26}
                                style={{
                                    background: 'linear-gradient(135deg, #6C63FF, #06B6D4)',
                                    fontSize: 12, fontWeight: 700,
                                }}
                            >
                                {user.full_name?.charAt(0)?.toUpperCase() || 'A'}
                            </Avatar>
                            <Text style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600 }}>
                                {user.full_name || 'Admin'}
                            </Text>
                        </div>
                    </div>
                </Header>

                {/* Content */}
                <Content style={{ margin: '18px', background: 'transparent' }}>
                    <div style={{
                        padding: 24,
                        background: '#ffffff',
                        borderRadius: 14,
                        minHeight: 'calc(100vh - 136px)',
                        boxShadow: '0 2px 12px rgba(108, 99, 255, 0.06)',
                    }}>
                        <Outlet />
                    </div>
                </Content>

                <Footer style={{
                    textAlign: 'center',
                    background: 'transparent',
                    color: '#9CA3AF',
                    fontSize: 12,
                    padding: '10px 0 16px',
                }}>
                    © 2026 Smart House · Đồ án tốt nghiệp · Phạm Văn Thế Quân
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;