import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Button, Space, Modal, Form, Input, InputNumber,
    Select, message, Popconfirm, Typography, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
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

    const validateRoomNumber = async (_, value) => {
        if (!value || value.trim() === '') return Promise.resolve();
        const excludeId = editingRoom?.key || editingRoom?.room_id || null;
        const params = { room_number: value.trim() };
        if (excludeId) params.exclude_id = excludeId;
        try {
            const res = await axios.get('http://localhost:5000/api/rooms/check-number', { params });
            if (res.data.exists) return Promise.reject(new Error(`Số phòng "${value}" đã tồn tại!`));
            return Promise.resolve();
        } catch (err) {
            return Promise.resolve();
        }
    };

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

    /**
     * Xóa phòng. Nếu server trả về hasHistory (phòng đã từng có hợp đồng),
     * gợi ý admin chuyển sang trạng thái Ngừng hoạt động thay vì xóa cứng,
     * để không phá vỡ dữ liệu hóa đơn/hợp đồng lịch sử.
     */
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/rooms/${id}`);
            message.success('Đã xóa!');
            fetchRooms();
        } catch (err) {
            const data = err.response?.data;
            if (data?.hasHistory) {
                Modal.confirm({
                    title: 'Không thể xóa vĩnh viễn',
                    content: 'Phòng này đã có lịch sử hợp đồng. Bạn có muốn chuyển sang trạng thái "Ngừng hoạt động" để ẩn khỏi danh sách cho thuê thay thế không?',
                    okText: 'Ngừng hoạt động',
                    cancelText: 'Hủy',
                    onOk: () => handleDeactivate(id)
                });
            } else {
                message.error(data?.error || 'Lỗi khi xóa!');
            }
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/rooms/${id}/deactivate`);
            message.success('Đã chuyển phòng sang trạng thái Ngừng hoạt động!');
            fetchRooms();
        } catch (err) {
            message.error('Lỗi khi ngừng hoạt động phòng!');
        }
    };

    const handleReactivate = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/rooms/${id}/reactivate`);
            message.success('Đã kích hoạt lại phòng!');
            fetchRooms();
        } catch (err) {
            message.error('Lỗi khi kích hoạt lại phòng!');
        }
    };

    const columns = [
        {
            title: 'Số phòng',
            dataIndex: 'room_number',
            key: 'room_number',
            width: 100,
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
            title: 'Diện tích',
            dataIndex: 'area',
            align: 'center',
            width: 100,
            render: (v) => v ? <Text>{v} m²</Text> : <Text type="secondary">—</Text>
        },
        {
            title: 'Tầng',
            dataIndex: 'floor',
            align: 'center',
            width: 80,
            render: (v) => v ? <Text>Tầng {v}</Text> : <Text type="secondary">—</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
            width: 150,
            render: (status) => {
                if (status === 'INACTIVE') {
                    return (
                        <Tag color="default" style={{ fontSize: '13px', padding: '2px 10px', fontWeight: '500' }}>
                            NGỪNG HOẠT ĐỘNG
                        </Tag>
                    );
                }
                const isAvailable = status === 'AVAILABLE' || status === 'CÒN TRỐNG';
                return (
                    <Tag
                        color={isAvailable ? 'green' : 'red'}
                        style={{ fontSize: '13px', padding: '2px 10px', fontWeight: '500' }}
                    >
                        {isAvailable ? 'CÒN TRỐNG' : 'ĐÃ THUÊ'}
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 130,
            render: (_, record) => {
                const id = record.key || record.room_id;
                return (
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
                        {record.status === 'INACTIVE' ? (
                            <Popconfirm title="Kích hoạt lại phòng này?" onConfirm={() => handleReactivate(id)}>
                                <Button
                                    type="text"
                                    size="middle"
                                    icon={<ReloadOutlined style={{ color: '#52c41a', fontSize: '18px' }} />}
                                    title="Kích hoạt lại"
                                />
                            </Popconfirm>
                        ) : (
                            <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(id)}>
                                <Button type="text" size="middle" danger icon={<DeleteOutlined style={{ fontSize: '18px' }} />} />
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
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
                >
                    Thêm phòng mới
                </Button>
            </div>

            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey={(record) => record.key || record.room_id}
                size="middle"
                pagination={{ pageSize: 8 }}
                bordered
            />

            <Modal
                title={<Text strong style={{ fontSize: '18px' }}>{editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</Text>}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => { setIsModalOpen(false); setEditingRoom(null); form.resetFields(); }}
                width={560}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" size="large">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="room_number"
                                label={<Text strong>Số phòng</Text>}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số phòng!' },
                                    { validator: validateRoomNumber }
                                ]}
                                validateTrigger={['onBlur']}
                            >
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

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="base_price" label={<Text strong>Giá thuê / tháng</Text>} rules={[{ required: true }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    addonAfter="đ"
                                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(v) => v.replace(/\đ\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="area" label={<Text strong>Diện tích (m²)</Text>}>
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="20" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="floor" label={<Text strong>Tầng</Text>}>
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="1" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label={<Text strong>Tiện nghi / Mô tả</Text>}>
                        <Input.TextArea
                            rows={3}
                            placeholder="Ví dụ: Có điều hòa, máy nước nóng, ban công, wifi..."
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