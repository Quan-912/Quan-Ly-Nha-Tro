import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // State cho modal Quên mật khẩu
    const [forgotModalOpen, setForgotModalOpen] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotForm] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/login', values);
            message.success(res.data.message);

            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Gắn header xác thực cho mọi request axios kể từ đây
            axios.defaults.headers.common['x-user-id'] = res.data.user.id;
            axios.defaults.headers.common['x-user-role'] = res.data.user.role;

            if (res.data.user.role === 'ADMIN') {
                navigate('/admin');
            } else if (res.data.user.role === 'TENANT') {
                navigate('/tenant');
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

    // Xử lý gửi yêu cầu quên mật khẩu — chỉ áp dụng cho Tenant
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
                        rules={[{required: true, message: 'Vui lòng nhập tên tài khoản!'}]}
                    >
                        <Input prefix={<UserOutlined/>} placeholder="Tên tài khoản" size="large"/>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{required: true, message: 'Vui lòng nhập mật khẩu!'}]}
                    >
                        <Input.Password prefix={<LockOutlined/>} placeholder="Mật khẩu" size="large"/>
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginBottom: 16 }}>
                        <a onClick={() => setForgotModalOpen(true)}>Quên mật khẩu?</a>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div style={{textAlign: 'center', marginTop: 12}}>
                        Chưa có tài khoản? <a onClick={() => navigate('/register')}>Đăng ký ngay</a>
                    </div>
                </Form>
            </Card>

            {/* Modal Quên mật khẩu — chỉ dành cho Tenant, gửi mật khẩu mới qua email */}
            <Modal
                title="Khôi phục mật khẩu"
                open={forgotModalOpen}
                onOk={() => forgotForm.submit()}
                onCancel={() => { setForgotModalOpen(false); forgotForm.resetFields(); }}
                okText="Gửi mật khẩu mới"
                cancelText="Hủy"
                confirmLoading={forgotLoading}
            >
                <Typography.Paragraph type="secondary">
                    Chức năng này chỉ áp dụng cho tài khoản Khách thuê. Nhập email đã đăng ký, hệ thống sẽ gửi mật khẩu mới về email của bạn.
                </Typography.Paragraph>
                <Form form={forgotForm} layout="vertical" onFinish={onFinishForgot}>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email đã đăng ký" size="large" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Login;