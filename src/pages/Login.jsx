import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/login', values);
            message.success(res.data.message);

            // Lưu thông tin người dùng vào localStorage để các trang khác sử dụng
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // BƯỚC ĐIỀU HƯỚNG QUAN TRỌNG: Kiểm tra quyền (Role)
            if (res.data.user.role === 'ADMIN') {
                navigate('/admin'); // Vào trang quản lý của Admin
            } else if (res.data.user.role === 'TENANT') {
                navigate('/tenant'); // Vào trang của Khách thuê
            }
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.error);
            } else {
                message.error('Lỗi kết nối đến máy chủ!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>ĐĂNG NHẬP</Title>
                    <Typography.Text type="secondary">Hệ thống quản lý nhà trọ thông minh</Typography.Text>
                </div>

                <Form name="login_form" layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên tài khoản" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;