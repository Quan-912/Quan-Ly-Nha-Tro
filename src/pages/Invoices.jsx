import React, { useState, useEffect } from 'react';
import {Table, Button, Tag, Modal, Form, InputNumber, Select, message,
    Space, Typography, Divider, Popconfirm} from 'antd';

import { CalculatorOutlined, PrinterOutlined } from '@ant-design/icons';
import axios from 'axios'; // Đảm bảo đã chạy npm install axios

const { Text } = Typography;

const Invoices = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]); // Danh sách hóa đơn từ DB
    const [rooms, setRooms] = useState([]); // Danh sách phòng đang thuê
    const [services, setServices] = useState([]); // Danh mục dịch vụ (Điện, Nước...)
    const [form] = Form.useForm();

    // 1. Lấy dữ liệu ban đầu từ Backend
    const fetchData = async () => {
        try {
            const [resInvoices, resRooms, resServices] = await Promise.all([
                axios.get('http://localhost:5000/api/invoices'),
                axios.get('http://localhost:5000/api/rooms'),
                axios.get('http://localhost:5000/api/services')
            ]);
            setDataSource(resInvoices.data);
            // Chỉ hiện các phòng đang ở (OCCUPIED) để lập hóa đơn
            setRooms(resRooms.data.filter(r => r.status === 'OCCUPIED' || r.status === 'Đã thuê'));
            setServices(resServices.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. Hàm xử lý lưu hóa đơn vào Database
    const handleCreateInvoice = async (values) => {
        console.log("Dữ liệu Form nhận được:", values);
        try {
            // Chuẩn bị mảng chi tiết dịch vụ cho bảng Invoice_Details
            const invoiceDetails = services.map(s => {
                const oldIdx = values[`old_${s.key}`] || 0;
                const newIdx = values[`new_${s.key}`] || 0;
                const qty = newIdx - oldIdx;
                return {
                    service_id: s.key,
                    old_index: oldIdx,
                    new_index: newIdx,
                    quantity: qty,
                    sub_total: qty * s.unit_price
                };
            });

            const payload = {
                room_id: values.room_id,
                billing_month: values.month,
                services: invoiceDetails
            };

            await axios.post('http://localhost:5000/api/invoices', payload);
            message.success(`Đã tạo hóa đơn cho phòng ${values.room_id}!`);
            setIsModalOpen(false);
            form.resetFields();
            fetchData(); // Tải lại bảng danh sách
        } catch (error) {
            message.error('Lỗi khi tạo hóa đơn!');
        }
    };
    // Hàm gọi API xác nhận đã thu tiền
    const handlePayment = async (invoiceId) => {
        try {
            await axios.put(`http://localhost:5000/api/invoices/${invoiceId}/pay`);
            message.success('Đã xác nhận thu tiền thành công!');
            fetchData(); // Gọi lại hàm này để bảng cập nhật màu sắc ngay lập tức
        } catch (error) {
            message.error('Lỗi khi cập nhật thanh toán!');
        }
    };

    const handleRoomChange = async (roomId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/last-index/${roomId}`);
            const lastData = res.data;

            // Tạo object chứa số cũ để cập nhật form
            const oldIndices = {};
            lastData.forEach(item => {
                oldIndices[`old_${item.service_id}`] = item.new_index;
            });

            form.setFieldsValue(oldIndices);
        } catch (err) {
            console.error("Không lấy được số cũ:", err);
        }
    };

    const columns = [
        { title: 'Phòng', dataIndex: 'room_number', key: 'room_number' },
        { title: 'Tháng', dataIndex: 'billing_month', key: 'billing_month' },
        {
            title: 'Tổng cộng',
            dataIndex: 'total_amount',
            key: 'total_amount',
            // Thêm style cho số tiền to và rõ
            render: (val) => (
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#cf1322' }}>
            {parseInt(val).toLocaleString()} VNĐ
        </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'PAID' ? 'green' : 'orange'}>
                    {status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {/* Chỉ hiện nút Thu tiền nếu trạng thái là UNPAID */}
                    {record.status === 'UNPAID' && (
                        <Popconfirm
                            title="Xác nhận khách đã đóng tiền cho tháng này?"
                            onConfirm={() => handlePayment(record.key)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <Button type="primary" style={{ backgroundColor: '#52c41a' }}>
                                Thu tiền
                            </Button>
                        </Popconfirm>
                    )}
                    <Button icon={<PrinterOutlined />}>In</Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Hóa đơn & Thu tiền</h2>
                <Button type="primary" danger icon={<CalculatorOutlined />} onClick={() => setIsModalOpen(true)}>
                    Lập hóa đơn mới
                </Button>
            </div>

            <Table columns={columns} dataSource={dataSource} />

            <Modal title="Tính hóa đơn tháng" open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} width={600}>
                <Form form={form} layout="vertical" onFinish={handleCreateInvoice}>
                    <Space size="large" style={{ display: 'flex', marginBottom: 20 }}>
                        <Form.Item
                            name="room_id"
                            label="Chọn phòng"
                            rules={[{required: true, message: 'Vui lòng chọn phòng!'}]}
                            style={{width: 200}}
                        >
                            <Select
                                placeholder="Chọn phòng"
                                onChange={handleRoomChange} // Gọi hàm lấy số cũ

                            >
                                {rooms.map(r => (
                                    <Select.Option key={r.key} value={r.key}>
                                        {r.room_number}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="month" label="Tháng thanh toán" initialValue="05/2026" style={{width: 200}}>
                            <Select>
                                <Select.Option value="05/2026">Tháng 05/2026</Select.Option>
                                <Select.Option value="06/2026">Tháng 06/2026</Select.Option>
                            </Select>
                        </Form.Item>
                    </Space>

                    <Divider orientation="left">Chỉ số Dịch vụ</Divider>

                    {services.map(s => (
                        <div key={s.key} style={{ background: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                            <Text strong>{s.service_name}</Text>
                            <Text type="secondary"> (Đơn giá: {parseInt(s.unit_price).toLocaleString()}đ/{s.unit})</Text>
                            <Space style={{ display: 'flex', marginTop: 10 }}>
                                <Form.Item name={`old_${s.key}`} label="Số cũ" initialValue={0}><InputNumber min={0}/></Form.Item>
                                <Form.Item name={`new_${s.key}`} label="Số mới" rules={[{required: true}]}><InputNumber min={0}/></Form.Item>
                            </Space>
                        </div>
                    ))}
                </Form>
            </Modal>
        </div>
    );
};

export default Invoices;