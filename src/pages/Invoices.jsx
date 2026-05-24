import React, { useState, useEffect } from 'react';
import {Table, Button, Tag, Modal, Form, InputNumber, Select, message,
    Space, Typography, Divider, Popconfirm, Row, Col, Badge} from 'antd';
import { CalculatorOutlined, PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

const Invoices = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [services, setServices] = useState([]);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const [resInvoices, resRooms, resServices] = await Promise.all([
                axios.get('http://localhost:5000/api/invoices'),
                axios.get('http://localhost:5000/api/rooms'),
                axios.get('http://localhost:5000/api/services')
            ]);
            setDataSource(resInvoices.data);
            setRooms(resRooms.data.filter(r => r.status === 'OCCUPIED' || r.status === 'Đã thuê'));
            setServices(resServices.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateInvoice = async (values) => {
        try {
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
            message.success(`Đã tạo hóa đơn!`);
            setIsModalOpen(false);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error('Lỗi khi tạo hóa đơn!');
        }
    };

    const handlePayment = async (invoiceId) => {
        try {
            await axios.put(`http://localhost:5000/api/invoices/${invoiceId}/pay`);
            message.success('Xác nhận thanh toán thành công!');
            fetchData();
        } catch (error) {
            message.error('Lỗi cập nhật!');
        }
    };

    const handleRoomChange = async (roomId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/last-index/${roomId}`);
            const lastData = res.data;
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
        {
            title: 'Phòng',
            dataIndex: 'room_number',
            key: 'room_number',
            width: 100,
            render: (text) => <Tag color="blue" style={{fontWeight: 'bold', fontSize: '14px', margin: 0}}>{text}</Tag>
        },
        {
            title: 'Tháng',
            dataIndex: 'billing_month',
            key: 'billing_month',
            width: 110,
            render: (text) => <Text style={{ fontSize: '14px' }}>{text}</Text>
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            render: (val) => (
                <Text strong style={{ color: '#d4380d', fontSize: '15px' }}>
                    {parseInt(val).toLocaleString()} đ
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 160,
            render: (status) => (
                <Badge
                    status={status === 'PAID' ? 'success' : 'warning'}
                    text={<Text style={{ fontSize: '14px' }}>{status === 'PAID' ? 'Đã xong' : 'Chưa thu'}</Text>}
                />
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'UNPAID' && (
                        <Popconfirm
                            title="Xác nhận đã thu tiền?"
                            onConfirm={() => handlePayment(record.key || record.invoice_id)}
                        >
                            <Button type="text" size="middle" icon={<CheckCircleOutlined style={{color: '#52c41a', fontSize: '18px'}} />} />
                        </Popconfirm>
                    )}
                    <Button type="text" size="middle" icon={<PrinterOutlined style={{fontSize: '18px'}} />} />
                </Space>
            )
        }
    ];

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, fontSize: '20px' }}>QUẢN LÝ HÓA ĐƠN & THU TIỀN</Title>
                <Button type="primary" size="middle" danger icon={<CalculatorOutlined />} onClick={() => setIsModalOpen(true)}>
                    Lập hóa đơn
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                size="middle" // Chuyển từ small sang middle để chữ to tự nhiên
                pagination={{ pageSize: 8 }}
                bordered
            />

            <Modal
                title={<Text strong style={{ fontSize: '18px' }}>Lập hóa đơn mới</Text>}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                width={550}
                okText="Tạo hóa đơn"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateInvoice} size="middle">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="room_id" label={<Text strong>Phòng</Text>} rules={[{required: true}]}>
                                <Select placeholder="Chọn" onChange={handleRoomChange} style={{ width: '100%' }}>
                                    {rooms.map(r => <Select.Option key={r.key} value={r.key}>{r.room_number}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="month" label={<Text strong>Kỳ thanh toán</Text>} initialValue="05/2026">
                                <Select style={{ width: '100%' }}>
                                    <Select.Option value="05/2026">Tháng 05/2026</Select.Option>
                                    <Select.Option value="06/2026">Tháng 06/2026</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '15px 0' }}><Text type="secondary">Chỉ số điện nước</Text></Divider>

                    {services.map(s => (
                        <div key={s.key} style={{ background: '#fafafa', padding: '12px', borderRadius: 6, marginBottom: 10, border: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text strong style={{fontSize: '14px'}}>{s.service_name}</Text>
                                <Text type="secondary" style={{fontSize: '13px'}}>{parseInt(s.unit_price).toLocaleString()}đ/{s.unit}</Text>
                            </div>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name={`old_${s.key}`} label="Số cũ" initialValue={0} style={{marginBottom: 0}}>
                                        <InputNumber style={{width: '100%'}} min={0} size="middle"/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={`new_${s.key}`} label="Số mới" rules={[{required: true}]} style={{marginBottom: 0}}>
                                        <InputNumber style={{width: '100%'}} min={0} size="middle"/>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </Form>
            </Modal>
        </div>
    );
};

export default Invoices;