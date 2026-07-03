import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading]           = useState(false);
    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const [forgotLoading, setForgotLoading]     = useState(false);
    const [forgotForm] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/login', values);
            message.success(res.data.message);

            localStorage.setItem('user', JSON.stringify(res.data.user));
            axios.defaults.headers.common['x-user-id']   = res.data.user.id;
            axios.defaults.headers.common['x-user-role'] = res.data.user.role;

            if (res.data.user.role === 'ADMIN')       navigate('/admin');
            else if (res.data.user.role === 'TENANT') navigate('/tenant');
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi kết nối đến máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    const onFinishForgot = async (values) => {
        setForgotLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/forgot-password', { email: values.email });
            message.success(res.data.message);
            setForgotModalOpen(false);
            forgotForm.resetFields();
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi hệ thống!');
        } finally {
            setForgotLoading(false);
        }
    };

    // Danh sách tính năng nổi bật hiển thị trên panel trái
    const FEATURES = [
        { emoji: '🏠', text: 'Quản lý phòng & hợp đồng' },
        { emoji: '💰', text: 'Hóa đơn & thu tiền tự động' },
        { emoji: '🔔', text: 'Theo dõi & xử lý sự cố' },
        { emoji: '📊', text: 'Báo cáo doanh thu trực quan' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

            {/* ══════════════════════════════════════
                PANEL TRÁI — deep space gradient + features
                Ẩn trên mobile qua CSS class .login-left-panel
            ══════════════════════════════════════ */}
            <div
                className="login-left-panel"
                style={{
                    flex: '0 0 44%',
                    background: 'linear-gradient(145deg, #0D0B14 0%, #1A1744 35%, #2D1B69 65%, #6C63FF 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px 48px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow decorative — top-right */}
                <div style={{
                    position: 'absolute', top: -80, right: -80,
                    width: 260, height: 260,
                    background: 'radial-gradient(circle, rgba(108,99,255,0.28) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />
                {/* Glow decorative — bottom-left */}
                <div style={{
                    position: 'absolute', bottom: -50, left: -50,
                    width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />

                {/* Nội dung chính */}
                <div style={{ position: 'relative', width: '100%', maxWidth: 360, textAlign: 'center' }}>
                    {/* Logo box */}
                    <div style={{
                        width: 68, height: 68,
                        background: 'linear-gradient(135deg, #6C63FF 0%, #06B6D4 100%)',
                        borderRadius: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 8px 28px rgba(108,99,255,0.55)',
                    }}>
                        <HomeOutlined style={{ color: '#fff', fontSize: 34 }} />
                    </div>

                    <Title level={2} style={{
                        color: '#fff', margin: '0 0 8px',
                        fontWeight: 800, letterSpacing: 0.5,
                    }}>
                        SMART HOUSE
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.50)', fontSize: 15 }}>
                        Hệ thống quản lý nhà trọ thông minh
                    </Text>

                    {/* Feature list */}
                    <div style={{ marginTop: 38, textAlign: 'left' }}>
                        {FEATURES.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 13,
                                    marginBottom: 12,
                                    padding: '11px 16px',
                                    background: 'rgba(255,255,255,0.07)',
                                    borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(8px)',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <span style={{ fontSize: 20 }}>{f.emoji}</span>
                                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                                    {f.text}
                                </Text>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                PANEL PHẢI — form đăng nhập
            ══════════════════════════════════════ */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 48px',
                background: '#fff',
                overflowY: 'auto',
            }}>
                <div style={{ width: '100%', maxWidth: 380 }}>
                    {/* Heading */}
                    <div style={{ marginBottom: 32 }}>
                        <Title level={3} style={{ margin: '0 0 6px', color: '#1E1B4B', fontWeight: 800 }}>
                            Chào mừng trở lại 👋
                        </Title>
                        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                            Đăng nhập vào tài khoản của bạn để tiếp tục
                        </Text>
                    </div>

                    {/* Form */}
                    <Form name="login_form" layout="vertical" onFinish={onFinish} size="large">
                        <Form.Item
                            name="username"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Tên tài khoản</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
                            style={{ marginBottom: 18 }}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="Nhập tên đăng nhập"
                                style={{ borderRadius: 10, height: 46 }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Mật khẩu</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            style={{ marginBottom: 10 }}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="Nhập mật khẩu"
                                style={{ borderRadius: 10, height: 46 }}
                            />
                        </Form.Item>

                        {/* Link quên mật khẩu */}
                        <div style={{ textAlign: 'right', marginBottom: 24 }}>
                            <a
                                onClick={() => setForgotModalOpen(true)}
                                style={{ color: '#6C63FF', fontSize: 14, fontWeight: 500 }}
                            >
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* Nút đăng nhập — gradient */}
                        <Form.Item style={{ marginBottom: 18 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={{
                                    height: 48,
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    fontSize: 15,
                                    background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)',
                                    border: 'none',
                                    boxShadow: '0 6px 20px rgba(108,99,255,0.42)',
                                    letterSpacing: 0.3,
                                }}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>

                        {/* Link đăng ký */}
                        <div style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                                Chưa có tài khoản?{' '}
                                <a
                                    onClick={() => navigate('/register')}
                                    style={{ color: '#6C63FF', fontWeight: 600 }}
                                >
                                    Đăng ký ngay
                                </a>
                            </Text>
                        </div>
                    </Form>

                    {/* Dòng footer nhỏ */}
                    <div style={{ marginTop: 48, textAlign: 'center' }}>
                        <Text style={{ color: '#D1D5DB', fontSize: 12 }}>
                            © 2026 Smart House · Đồ án tốt nghiệp · Phạm Văn Thế Quân
                        </Text>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                MODAL QUÊN MẬT KHẨU
            ══════════════════════════════════════ */}
            <Modal
                title={
                    <Text strong style={{ fontSize: 16, color: '#1E1B4B' }}>
                        🔑 Khôi phục mật khẩu
                    </Text>
                }
                open={forgotModalOpen}
                onOk={() => forgotForm.submit()}
                onCancel={() => { setForgotModalOpen(false); forgotForm.resetFields(); }}
                okText="Gửi mật khẩu mới"
                cancelText="Hủy"
                confirmLoading={forgotLoading}
                okButtonProps={{
                    style: {
                        background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
                        border: 'none',
                        borderRadius: 8,
                    },
                }}
            >
                <Text type="secondary" style={{ display: 'block', marginBottom: 20, lineHeight: 1.6 }}>
                    Chức năng này chỉ áp dụng cho tài khoản <b>Khách thuê</b>. Nhập email đã đăng ký, hệ thống sẽ gửi mật khẩu mới về email của bạn.
                </Text>
                <Form form={forgotForm} layout="vertical" onFinish={onFinishForgot} size="large">
                    <Form.Item
                        name="email"
                        label={<Text style={{ color: '#374151', fontWeight: 600 }}>Email đã đăng ký</Text>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email',  message: 'Email không đúng định dạng!' },
                        ]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#C4B5FD' }} />}
                            placeholder="example@email.com"
                            style={{ borderRadius: 10 }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Login;