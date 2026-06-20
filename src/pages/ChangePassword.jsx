import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Result } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await axios.put('http://localhost:5000/api/change-password', {
                user_id: user.id,
                old_password: values.old_password,
                new_password: values.new_password
            });
            setSuccess(true);
            form.resetFields();
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Lỗi hệ thống!';
            message.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ maxWidth: 480, margin: '40px auto' }}>
                <Result
                    icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    title="Đổi mật khẩu thành công!"
                    subTitle="Mật khẩu mới đã được cập nhật. Vui lòng dùng mật khẩu mới cho lần đăng nhập tiếp theo."
                    extra={
                        <Button type="primary" onClick={() => setSuccess(false)}>
                            Đổi mật khẩu lần khác
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 480, margin: '40px auto' }}>
            <Card
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <SafetyCertificateOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 8 }} />
                    <Title level={4} style={{ margin: 0 }}>ĐỔI MẬT KHẨU</Title>
                    <Text type="secondary">Tài khoản: <b>{user.username}</b></Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    {/* Mật khẩu hiện tại */}
                    <Form.Item
                        name="old_password"
                        label={<Text strong>Mật khẩu hiện tại</Text>}
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu đang dùng"
                        />
                    </Form.Item>

                    {/* Mật khẩu mới */}
                    <Form.Item
                        name="new_password"
                        label={<Text strong>Mật khẩu mới</Text>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Tối thiểu 6 ký tự"
                        />
                    </Form.Item>

                    {/* Xác nhận mật khẩu mới */}
                    <Form.Item
                        name="confirm_password"
                        label={<Text strong>Xác nhận mật khẩu mới</Text>}
                        dependencies={['new_password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('new_password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                }
                            })
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            icon={<SafetyCertificateOutlined />}
                        >
                            Cập nhật mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ChangePassword;