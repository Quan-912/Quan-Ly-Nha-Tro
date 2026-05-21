import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined } from '@ant-design/icons';
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
            message.error('Đăng ký thất bại: ' + (error.response?.data || 'Lỗi hệ thống'));
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

                    <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item name="full_name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
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