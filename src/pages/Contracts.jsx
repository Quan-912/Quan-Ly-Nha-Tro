import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, Form, Select, DatePicker, InputNumber, message, Tag, Typography, Popconfirm, Space} from 'antd';
import { FileDoneOutlined, DeleteOutlined } from '@ant-design/icons';

import axios from 'axios';
const { Text } = Typography;
const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // Lấy dữ liệu tổng hợp
    const fetchData = async () => {
        const resCon = await axios.get('http://localhost:5000/api/contracts');
        const resRooms = await axios.get('http://localhost:5000/api/rooms');
        const resTenants = await axios.get('http://localhost:5000/api/tenants');

        setContracts(resCon.data);
        // Chỉ hiện những phòng còn trống (AVAILABLE) để làm hợp đồng
        setRooms(resRooms.data.filter(r => r.status === 'AVAILABLE'));
        setTenants(resTenants.data);
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = (values) => {
        const data = {
            ...values,
            start_date: values.start_date.format('YYYY-MM-DD'),
            end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null
        };
        axios.post('http://localhost:5000/api/contracts', data)
            .then(() => {
                message.success("Hợp đồng đã được ký kết!");
                setIsModalOpen(false);
                fetchData();
            });
    };

    const handleDelete = async (contractKey) => {
        if (!contractKey) {
            message.error("Không tìm thấy ID hợp đồng!");
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/api/contracts/${contractKey}`);
            message.success("Đã xóa hợp đồng thành công!");
            fetchData();
        } catch (error) {
            message.error("Lỗi khi xóa!");
        }
    };

    const columns = [

        {
            title: 'Phòng',
            dataIndex: 'room_number',
            key: 'room_number',
            render: (text) => <Tag color="volcano">{text}</Tag> // Làm nổi bật số phòng
        },

        { title: 'Khách thuê', dataIndex: 'full_name', key: 'full_name' },

        { title: 'Ngày bắt đầu', dataIndex: 'start_date', key: 'start_date' },

        {
            title: 'Ngày hết hạn',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (date) => date ? date : <Tag>Dài hạn</Tag>
        },

        {
            title: 'Tiền cọc',
            dataIndex: 'deposit_amount',
            render: val => <Text type="success">{val?.toLocaleString()}đ</Text>
        },

        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: s => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag>
        },

        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có chắc muốn xóa?"
                    onConfirm={() => handleDelete(record.key)} // Đảm bảo dùng record.key
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý Hợp đồng thuê phòng</h2>
                <Button type="primary" icon={<FileDoneOutlined />} onClick={() => setIsModalOpen(true)}>Lập hợp đồng mới</Button>
            </div>
            <Table dataSource={contracts} columns={columns} />

            <Modal title="Lập hợp đồng mới" open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>

                <Form form={form} layout="vertical" onFinish={handleCreate}>

                    <Form.Item name="room_id" label="Chọn phòng trống" rules={[{required: true}]}>
                        <Select>
                            {rooms.map(
                                r => <Select.Option key={r.room_id} value={r.room_id}>
                                    {r.room_number}
                                </Select.Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="tenant_id" label="Chọn khách thuê" rules={[{required: true}]}>
                        <Select>
                            {tenants.map(t => <Select.Option key={t.key} value={t.key}>{t.full_name}</Select.Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="start_date" label="Ngày vào ở" rules={[{required: true}]}><DatePicker style={{width:'100%'}}/></Form.Item>

                    <Form.Item name="end_date" label="Ngày hết hạn"><DatePicker style={{width:'100%'}}/></Form.Item>

                    <Form.Item name="deposit_amount" label="Tiền đặt cọc">
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={v => v.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
};

export default Contracts;