import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

const Register = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            // Gọi API đăng ký (dùng chung API tạo Tenant)
            await axios.post('http://localhost:5000/api/tenants', values);
            message.success('Đăng ký tài khoản thành công!');
            navigate('/login'); // Đăng ký xong thì chuyển về trang Login
        } catch (error) {
            message.error('Đăng ký thất bại: ' + (error.response?.data?.error || error.response?.data || 'Lỗi hệ thống'));
        }
    };

    // Kiểm tra email đã tồn tại trong hệ thống chưa — gọi API ngay khi người dùng rời khỏi ô nhập (onBlur)
    const validateEmailExists = async (_, value) => {
        if (!value) return Promise.resolve();
        try {
            const res = await axios.get('http://localhost:5000/api/check-email', { params: { email: value } });
            if (res.data.exists) return Promise.reject(new Error('Email này đã được sử dụng cho tài khoản khác!'));
            return Promise.resolve();
        } catch (err) {
            return Promise.resolve(); // Nếu API lỗi, không chặn người dùng — backend sẽ kiểm tra lại lần cuối
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2}>Đăng Ký Khách Thuê</Title>
                    <p>Hệ thống quản lý nhà trọ Ministar</p>
                </div>

                <Form name="register" onFinish={onFinish} layout="vertical">
                    <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                                message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số!'
                            }
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số" />
                    </Form.Item>

                    <Form.Item name="full_name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                    </Form.Item>

                    {/* Email — bắt buộc, validate đúng định dạng VÀ chưa từng tồn tại trong hệ thống */}
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' },
                            { validator: validateEmailExists }
                        ]}
                        validateTrigger={['onBlur']}
                        hasFeedback
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email (dùng để khôi phục mật khẩu)" />
                    </Form.Item>

                    <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                    </Form.Item>

                    <Form.Item name="cccd" rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}>
                        <Input prefix={<IdcardOutlined />} placeholder="Số căn cước công dân" />
                    </Form.Item>

                    <Form.Item name="hometown" rules={[{ required: true, message: 'Vui lòng nhập quê quán!' }]}>
                        <Input prefix={<HomeOutlined />} placeholder="Quê quán" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">
                            Đăng Ký Ngay
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;