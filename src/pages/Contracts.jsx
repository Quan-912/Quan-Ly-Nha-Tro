import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, InputNumber, message, Tag } from 'antd';
import { FileDoneOutlined } from '@ant-design/icons';
import axios from 'axios';

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

    const columns = [
        { title: 'Số phòng', dataIndex: 'room_number' },
        { title: 'Khách thuê', dataIndex: 'full_name' },
        { title: 'Ngày bắt đầu', dataIndex: 'start_date' },
        { title: 'Tiền cọc', dataIndex: 'deposit_amount', render: val => val.toLocaleString() },
        { title: 'Trạng thái', dataIndex: 'status', render: s => <Tag color="blue">{s}</Tag> }
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
                            {rooms.map(r => <Select.Option key={r.key} value={r.key}>{r.room_number}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="tenant_id" label="Chọn khách thuê" rules={[{required: true}]}>
                        <Select>
                            {tenants.map(t => <Select.Option key={t.key} value={t.key}>{t.full_name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="start_date" label="Ngày vào ở" rules={[{required: true}]}><DatePicker style={{width:'100%'}}/></Form.Item>
                    <Form.Item name="end_date" label="Ngày hết hạn"><DatePicker style={{width:'100%'}}/></Form.Item>
                    <Form.Item name="deposit_amount" label="Tiền đặt cọc"><InputNumber style={{width:'100%'}} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Contracts;