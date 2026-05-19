import React from 'react';
import { Layout, Menu, Typography, Modal } from 'antd'; // Thêm Modal để làm hộp thoại xác nhận
import { Link, Outlet, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import {
    DashboardOutlined,
    HomeOutlined,
    UserOutlined,
    FileTextOutlined,
    FileDoneOutlined,
    SettingOutlined,
    LogoutOutlined // Thêm icon Đăng xuất
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
    const navigate = useNavigate(); // Dùng để chuyển hướng sau khi đăng xuất

    // Hàm xử lý khi người dùng bấm Đăng xuất
    const handleLogout = () => {
        Modal.confirm({
            title: 'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn thoát khỏi hệ thống không?',
            okText: 'Đăng xuất',
            cancelText: 'Hủy',
            okButtonProps: { danger: true }, // Làm nút Đăng xuất màu đỏ cho đẹp
            onOk() {
                localStorage.removeItem('user'); // 1. Xóa thông tin user trong máy
                navigate('/login'); // 2. Đá về trang đăng nhập
            },
        });
    };

    const menuItems = [
        { key: '1', icon: <DashboardOutlined />, label: <Link to="/admin">Tổng quan</Link> },
        { key: '2', icon: <HomeOutlined />, label: <Link to="/admin/rooms">Quản lý Phòng</Link> },
        { key: '3', icon: <UserOutlined />, label: <Link to="/admin/tenants">Khách thuê</Link> },
        { key: '4', icon: <FileDoneOutlined />, label: <Link to="/admin/contracts">Hợp đồng</Link> },
        { key: '5', icon: <FileTextOutlined />, label: <Link to="/admin/invoices">Hóa đơn</Link> },
        { key: '6', icon: <SettingOutlined />, label: <Link to="/admin/services">Dịch vụ & Giá</Link> },
        {
            key: '7',
            icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
            label: <span style={{ color: '#ff4d4f' }}>Đăng xuất</span>,
            onClick: handleLogout
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
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