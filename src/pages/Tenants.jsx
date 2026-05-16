import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';

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
                message.success("Đã thêm khách thuê và tài khoản!");
                setIsModalOpen(false);
                form.resetFields();
                fetchTenants();
            })
            .catch(() => message.error("Lỗi khi thêm khách thuê"));
    };

    const columns = [
        { title: 'Họ tên', dataIndex: 'full_name', key: 'full_name' },
        { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'CCCD', dataIndex: 'cccd', key: 'cccd' },
        { title: 'Quê quán', dataIndex: 'hometown', key: 'hometown' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý khách thuê hồ sơ</h2>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
                    Thêm khách mới
                </Button>
            </div>
            <Table dataSource={tenants} columns={columns} />

            <Modal title="Thêm khách thuê mới" open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical" onFinish={handleAddTenant}>
                    <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Space>
                        <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}><Input.Password /></Form.Item>
                    </Space>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="cccd" label="Số CCCD" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="hometown" label="Quê quán"><Input /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Tenants;