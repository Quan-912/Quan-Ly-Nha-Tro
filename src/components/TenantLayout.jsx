import React from 'react';
import axios from 'axios';
import { Layout, Menu, Typography, Modal, Avatar, Button } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    HomeOutlined, FileTextOutlined, UserOutlined,
    LogoutOutlined, AppstoreOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const TenantLayout = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const user      = JSON.parse(localStorage.getItem('user') || '{}');

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
            key: '/tenant',
            icon: <HomeOutlined />,
            label: <Link to="/tenant">Phòng của tôi</Link>,
        },
        {
            key: '/tenant/invoices',
            icon: <FileTextOutlined />,
            label: <Link to="/tenant/invoices">Hóa đơn & Sự cố</Link>,
        },
        {
            key: '/tenant/booking',
            icon: <AppstoreOutlined />,
            label: <Link to="/tenant/booking">Đặt phòng</Link>,
        },
        {
            key: '/tenant/profile',
            icon: <UserOutlined />,
            label: <Link to="/tenant/profile">Hồ sơ</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#F4F3FF' }}>

            {/* ══════════════════════════════
                HEADER — gradient violet → cyan
            ══════════════════════════════ */}
            <Header
                className="tenant-header"
                style={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #6C63FF 55%, #06B6D4 100%)',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 4px 20px rgba(108, 99, 255, 0.30)',
                    position: 'sticky', top: 0, zIndex: 10,
                    height: 62,
                    gap: 0,
                }}
            >
                {/* Brand logo */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginRight: 32, flexShrink: 0,
                }}>
                    <div style={{
                        width: 32, height: 32,
                        background: 'rgba(255, 255, 255, 0.18)',
                        borderRadius: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.22)',
                    }}>
                        <HomeOutlined style={{ color: '#fff', fontSize: 17 }} />
                    </div>
                    <Title level={5} style={{
                        margin: 0, color: '#fff',
                        fontWeight: 800, letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                    }}>
                        SMART HOUSE
                    </Title>
                </div>

                {/* Nav menu — chiếm không gian còn lại */}
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        background: 'transparent',
                        borderBottom: 'none',
                    }}
                />

                {/* User chip + nút đăng xuất */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    flexShrink: 0, marginLeft: 16,
                }}>
                    {/* User pill */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '4px 12px 4px 6px',
                        background: 'rgba(255, 255, 255, 0.16)',
                        borderRadius: 20,
                        border: '1px solid rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <Avatar
                            size={26}
                            style={{
                                background: 'rgba(255,255,255,0.30)',
                                color: '#fff', fontSize: 13, fontWeight: 700,
                            }}
                        >
                            {user.full_name?.charAt(0)?.toUpperCase() || 'K'}
                        </Avatar>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {/* Chỉ hiện họ tên ngắn (từ cuối cùng) để không bị tràn layout */}
                            Xin chào, {user.full_name?.split(' ').pop() || 'Khách thuê'}
                        </Text>
                    </div>

                    {/* Nút đăng xuất riêng — tránh đặt trong Menu vì khó control màu horizontal */}
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        style={{
                            color: 'rgba(255,255,255,0.75)',
                            border: '1px solid rgba(255,255,255,0.20)',
                            borderRadius: 8,
                            backdropFilter: 'blur(6px)',
                            background: 'rgba(255,255,255,0.08)',
                            height: 34,
                            padding: '0 12px',
                            fontWeight: 500,
                        }}
                    >
                        Đăng xuất
                    </Button>
                </div>
            </Header>

            {/* Content */}
            <Content style={{ padding: '22px 20px', background: '#F4F3FF' }}>
                <div style={{
                    background: '#fff',
                    padding: 24,
                    borderRadius: 14,
                    minHeight: 'calc(100vh - 138px)',
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
                © 2026 Smart House · Dành cho Khách thuê · Phạm Văn Thế Quân
            </Footer>
        </Layout>
    );
};

export default TenantLayout;