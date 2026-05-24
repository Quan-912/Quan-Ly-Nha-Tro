import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Typography, Row, Col, Avatar } from 'antd';
import { UserAddOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Tenants = () => {
    const [tenants, setTenants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchTenants = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tenants');
            setTenants(res.data);
        } catch (err) {
            message.error("Lỗi tải danh sách khách thuê");
        }
    };

    useEffect(() => { fetchTenants(); }, []);

    const handleAddTenant = (values) => {
        axios.post('http://localhost:5000/api/tenants', values)
            .then(() => {
                message.success("Đã thêm khách thuê thành công!");
                setIsModalOpen(false);
                form.resetFields();
                fetchTenants();
            })
            .catch(() => message.error("Có lỗi xảy ra khi thêm khách thuê"));
    };

    const columns = [
        {
            title: 'Khách thuê',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text) => (
                <Space size="middle">
                    <Avatar size="default" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    <Text strong style={{ fontSize: '15px' }}>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Tài khoản',
            dataIndex: 'username',
            key: 'username',
            render: (u) => <Text style={{ fontSize: '14px', color: '#595959' }}>{u}</Text>
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 140,
            render: (p) => <Text style={{ fontSize: '14px' }}>{p}</Text>
        },
        {
            title: 'Số CCCD',
            dataIndex: 'cccd',
            key: 'cccd',
            width: 150,
            render: (c) => <Text style={{ fontSize: '14px' }}>{c}</Text>
        },
        {
            title: 'Quê quán',
            dataIndex: 'hometown',
            key: 'hometown',
            render: (h) => <Text style={{ fontSize: '14px' }}>{h || '---'}</Text>
        },
    ];

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0, fontSize: '20px' }}>DANH SÁCH KHÁCH THUÊ</Title>
                <Button
                    type="primary"
                    size="large"
                    icon={<UserAddOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    style={{ fontWeight: '500' }}
                >
                    Thêm khách mới
                </Button>
            </div>

            <Table
                dataSource={tenants}
                columns={columns}
                size="middle" // Sử dụng middle để cân bằng giữa nén không gian và kích thước chữ
                pagination={{ pageSize: 8 }}
                bordered
                rowKey="username"
            />

            <Modal
                title={<Text strong style={{ fontSize: '18px' }}>Thêm hồ sơ khách thuê mới</Text>}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                width={550}
                okText="Lưu hồ sơ"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleAddTenant} size="large">
                    <Form.Item
                        name="full_name"
                        label={<Text strong>Họ và tên khách thuê</Text>}
                        rules={[{ required: true }]}
                        style={{ marginBottom: 16 }}
                    >
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label={<Text strong>Tên đăng nhập</Text>} rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                <Input placeholder="user123" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="password" label={<Text strong>Mật khẩu</Text>} rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                <Input.Password placeholder="******" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="phone" label={<Text strong>Số điện thoại</Text>} rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                <Input placeholder="090..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="cccd" label={<Text strong>Số định danh (CCCD)</Text>} rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                <Input placeholder="001..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="hometown" label={<Text strong>Quê quán</Text>} style={{ marginBottom: 0 }}>
                        <Input placeholder="Thành phố, Tỉnh" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Tenants;