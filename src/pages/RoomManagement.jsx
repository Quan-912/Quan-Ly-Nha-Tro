import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const RoomManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form] = Form.useForm();

    const fetchRooms = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rooms');
            setDataSource(res.data);
        } catch (err) {
            message.error("Không thể lấy dữ liệu!");
        }
    };

    useEffect(() => { fetchRooms(); }, []);

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                const id = editingRoom?.key || editingRoom?.room_id;
                if (editingRoom) {
                    await axios.put(`http://localhost:5000/api/rooms/${id}`, values);
                    message.success('Đã cập nhật!');
                } else {
                    await axios.post('http://localhost:5000/api/rooms', values);
                    message.success('Đã thêm!');
                }
                setIsModalOpen(false);
                setEditingRoom(null);
                form.resetFields();
                fetchRooms();
            } catch (err) {
                message.error('Lỗi khi lưu!');
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/rooms/${id}`);
            message.success('Đã xóa!');
            fetchRooms();
        } catch (err) {
            message.error(err.response?.data?.error || 'Lỗi khi xóa!');
        }
    };

    const columns = [
        {
            title: 'Số phòng',
            dataIndex: 'room_number',
            key: 'room_number',
            width: 120,
            render: (text) => <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>{text}</Text>
        },
        {
            title: 'Loại phòng',
            dataIndex: 'room_type',
            key: 'room_type',
            render: (text) => <Text style={{ fontSize: '15px' }}>{text}</Text>
        },
        {
            title: 'Giá thuê',
            dataIndex: 'base_price',
            align: 'right',
            render: (price) => (
                <Text strong style={{ fontSize: '15px', color: '#d4380d' }}>
                    {parseInt(price).toLocaleString('vi-VN')} đ
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
            width: 140,
            render: (status) => {
                const isAvailable = status === 'AVAILABLE' || status === 'CÒN TRỐNG';
                return (
                    <Tag color={isAvailable ? 'green' : 'red'} style={{ fontSize: '13px', padding: '2px 10px', fontWeight: '500' }}>
                        {isAvailable ? 'CÒN TRỐNG' : 'ĐÃ THUÊ'}
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        size="middle"
                        icon={<EditOutlined style={{ color: '#1890ff', fontSize: '18px' }} />}
                        onClick={() => {
                            setEditingRoom(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    />
                    <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.key || record.room_id)}>
                        <Button type="text" size="middle" danger icon={<DeleteOutlined style={{ fontSize: '18px' }} />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
            {/* Header: Chữ tiêu đề to rõ */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0, fontSize: '20px' }}>DANH SÁCH PHÒNG TRỌ</Title>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingRoom(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                    style={{ fontSize: '15px', fontWeight: '500' }}
                >
                    Thêm phòng mới
                </Button>
            </div>

            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey={(record) => record.key || record.room_id}
                size="middle" // Chuyển từ small sang middle để chữ to tự nhiên mà vẫn gọn
                pagination={{ pageSize: 8 }}
                bordered
            />

            <Modal
                title={<Text strong style={{ fontSize: '18px' }}>{editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</Text>}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={450}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" size="large"> {/* Dùng size large cho Form để chữ và ô nhập to rõ */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="room_number" label={<Text strong>Số phòng</Text>} rules={[{ required: true }]}>
                                <Input placeholder="Ví dụ: 101" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="room_type" label={<Text strong>Loại phòng</Text>} rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="Phòng đơn">Phòng đơn</Select.Option>
                                    <Select.Option value="Phòng đôi">Phòng đôi</Select.Option>
                                    <Select.Option value="Chung cư mini">Chung cư mini</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="base_price" label={<Text strong>Giá thuê hàng tháng</Text>} rules={[{ required: true }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            addonAfter="đ"
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(v) => v.replace(/\đ\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item name="status" label={<Text strong>Trạng thái</Text>} rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="AVAILABLE">CÒN TRỐNG</Select.Option>
                            <Select.Option value="OCCUPIED">ĐÃ THUÊ</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoomManagement;