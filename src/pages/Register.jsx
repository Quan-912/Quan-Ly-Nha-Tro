import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import {
    UserOutlined, LockOutlined, PhoneOutlined,
    IdcardOutlined, HomeOutlined, MailOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Register = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await axios.post('http://localhost:5000/api/tenants', values);
            message.success('Đăng ký tài khoản thành công!');
            navigate('/login');
        } catch (error) {
            message.error(
                'Đăng ký thất bại: ' +
                (error.response?.data?.error || error.response?.data || 'Lỗi hệ thống')
            );
        }
    };

    // Async validator: kiểm tra email trùng ngay khi blur khỏi ô nhập
    const validateEmailExists = async (_, value) => {
        if (!value) return Promise.resolve();
        try {
            const res = await axios.get('http://localhost:5000/api/check-email', {
                params: { email: value },
            });
            if (res.data.exists)
                return Promise.reject(new Error('Email này đã được sử dụng cho tài khoản khác!'));
            return Promise.resolve();
        } catch {
            // Nếu API lỗi, không chặn người dùng — backend sẽ kiểm tra lần cuối
            return Promise.resolve();
        }
    };

    // Danh sách điểm nổi bật hiển thị trên panel trái
    const HIGHLIGHTS = [
        { emoji: '📝', text: 'Đăng ký nhanh — chỉ mất 1 phút' },
        { emoji: '🏠', text: 'Xem & đặt phòng trực tuyến' },
        { emoji: '💳', text: 'Theo dõi hóa đơn theo tháng' },
        { emoji: '🔧', text: 'Báo cáo sự cố dễ dàng' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

            {/* ══════════════════════════════════════
                PANEL TRÁI — cyan gradient
                (dùng màu cyan để phân biệt với Login)
            ══════════════════════════════════════ */}
            <div
                className="login-left-panel"
                style={{
                    flex: '0 0 42%',
                    background: 'linear-gradient(145deg, #0C1445 0%, #0F3460 40%, #0E6494 70%, #06B6D4 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px 48px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow trang trí — top-right */}
                <div style={{
                    position: 'absolute', top: -70, right: -70,
                    width: 240, height: 240,
                    background: 'radial-gradient(circle, rgba(6,182,212,0.30) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />
                {/* Glow trang trí — bottom-left */}
                <div style={{
                    position: 'absolute', bottom: -50, left: -50,
                    width: 190, height: 190,
                    background: 'radial-gradient(circle, rgba(108,99,255,0.22) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />

                {/* Nội dung */}
                <div style={{ position: 'relative', width: '100%', maxWidth: 340, textAlign: 'center' }}>
                    {/* Logo box */}
                    <div style={{
                        width: 68, height: 68,
                        background: 'linear-gradient(135deg, #06B6D4 0%, #6C63FF 100%)',
                        borderRadius: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 8px 28px rgba(6,182,212,0.50)',
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
                        Tạo tài khoản khách thuê miễn phí
                    </Text>

                    {/* Highlight list */}
                    <div style={{ marginTop: 38, textAlign: 'left' }}>
                        {HIGHLIGHTS.map((h, i) => (
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
                                }}
                            >
                                <span style={{ fontSize: 20 }}>{h.emoji}</span>
                                <Text style={{ color: 'rgba(255,255,255,0.76)', fontSize: 14 }}>
                                    {h.text}
                                </Text>
                            </div>
                        ))}
                    </div>

                    {/* Link quay lại đăng nhập */}
                    <div style={{ marginTop: 32 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
                            Đã có tài khoản?{' '}
                            <Link to="/login" style={{ color: '#67E8F9', fontWeight: 600 }}>
                                Đăng nhập ngay
                            </Link>
                        </Text>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                PANEL PHẢI — form đăng ký (scroll được)
            ══════════════════════════════════════ */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '36px 48px',
                background: '#fff',
                overflowY: 'auto',
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    {/* Heading */}
                    <div style={{ marginBottom: 28 }}>
                        <Title level={3} style={{ margin: '0 0 6px', color: '#1E1B4B', fontWeight: 800 }}>
                            Tạo tài khoản mới ✨
                        </Title>
                        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                            Điền đầy đủ thông tin bên dưới để hoàn tất đăng ký
                        </Text>
                    </div>

                    <Form name="register" onFinish={onFinish} layout="vertical" size="large">

                        {/* ── Tên đăng nhập ── */}
                        <Form.Item
                            name="username"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Tên đăng nhập</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="Ví dụ: nguyenvana"
                                style={{ borderRadius: 10, height: 44 }}
                            />
                        </Form.Item>

                        {/* ── Mật khẩu ── */}
                        <Form.Item
                            name="password"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Mật khẩu</Text>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                                    message: 'Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số!',
                                },
                            ]}
                            hasFeedback
                            style={{ marginBottom: 16 }}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="Tối thiểu 8 ký tự, chữ hoa + số"
                                style={{ borderRadius: 10, height: 44 }}
                            />
                        </Form.Item>

                        {/* ── Họ và tên ── */}
                        <Form.Item
                            name="full_name"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Họ và tên</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="Nguyễn Văn A"
                                style={{ borderRadius: 10, height: 44 }}
                            />
                        </Form.Item>

                        {/* ── Email — async validate trùng ── */}
                        <Form.Item
                            name="email"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Email</Text>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email',  message: 'Email không đúng định dạng!' },
                                { validator: validateEmailExists },
                            ]}
                            validateTrigger={['onBlur']}
                            hasFeedback
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="example@email.com (dùng để khôi phục MK)"
                                style={{ borderRadius: 10, height: 44 }}
                            />
                        </Form.Item>

                        {/* ── Số điện thoại ── */}
                        <Form.Item
                            name="phone"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Số điện thoại</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<PhoneOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="090xxxxxxx"
                                style={{ borderRadius: 10, height: 44 }}
                            />
                        </Form.Item>

                        {/* ── Số CCCD ── */}
                        <Form.Item
                            name="cccd"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Số CCCD / CMND</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <Input
                                prefix={<IdcardOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="001xxxxxxxxx"
                                style={{ borderRadius: 10, height: 44 }}
                            />
                        </Form.Item>

                        {/* ── Quê quán ── */}
                        <Form.Item
                            name="hometown"
                            label={<Text style={{ color: '#374151', fontWeight: 600 }}>Quê quán</Text>}
                            rules={[{ required: true, message: 'Vui lòng nhập quê quán!' }]}
                            style={{ marginBottom: 24 }}
                        >
                            <Input
                                prefix={<HomeOutlined style={{ color: '#C4B5FD' }} />}
                                placeholder="Thành phố, Tỉnh"
                                style={{ borderRadius: 10, height: 44 }}
                            />
                        </Form.Item>

                        {/* ── Nút đăng ký — gradient cyan ── */}
                        <Form.Item style={{ marginBottom: 18 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                style={{
                                    height: 48,
                                    borderRadius: 10,
                                    fontWeight: 700,
                                    fontSize: 15,
                                    background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                                    border: 'none',
                                    boxShadow: '0 6px 20px rgba(6,182,212,0.40)',
                                    letterSpacing: 0.3,
                                }}
                            >
                                Đăng ký ngay
                            </Button>
                        </Form.Item>

                        {/* ── Link đăng nhập ── */}
                        <div style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                                Đã có tài khoản?{' '}
                                <Link to="/login" style={{ color: '#06B6D4', fontWeight: 600 }}>
                                    Đăng nhập
                                </Link>
                            </Text>
                        </div>
                    </Form>

                    {/* Footer */}
                    <div style={{ marginTop: 32, textAlign: 'center' }}>
                        <Text style={{ color: '#D1D5DB', fontSize: 12 }}>
                            © 2026 Smart House · Đồ án tốt nghiệp · Phạm Văn Thế Quân
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;