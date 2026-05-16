import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const RoomManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form] = Form.useForm();

    // 1. Lấy dữ liệu: Giữ nguyên để lấy room_id gốc
    const fetchRooms = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rooms');
            setDataSource(res.data); // Dữ liệu trả về có room_id
        } catch (err) {
            message.error("Không thể lấy dữ liệu!");
        }
    };

    useEffect(() => { fetchRooms(); }, []);

    // 2. Hàm Xóa phòng
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/rooms/${id}`);
            message.success('Đã xóa phòng thành công!');
            fetchRooms();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Lỗi hệ thống khi xóa!';
            message.error(errorMsg);
        }
    };

    // 3. Hàm Lưu (Thêm mới hoặc Cập nhật)
    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingRoom) {
                    // Cập nhật dùng room_id
                    await axios.put(`http://localhost:5000/api/rooms/${editingRoom.room_id}`, values);
                    message.success('Cập nhật thành công!');
                } else {
                    // Thêm mới
                    await axios.post('http://localhost:5000/api/rooms', values);
                    message.success('Thêm mới thành công!');
                }
                setIsModalOpen(false);
                setEditingRoom(null);
                form.resetFields();
                fetchRooms();
            } catch (err) {
                message.error('Lỗi khi lưu dữ liệu!');
            }
        });
    };

    const columns = [
        { title: 'Số phòng', dataIndex: 'room_number', key: 'room_number' },
        { title: 'Loại phòng', dataIndex: 'room_type', key: 'room_type' },
        {
            title: 'Giá thuê (VND)',
            dataIndex: 'base_price',
            render: (price) => parseInt(price).toLocaleString('vi-VN')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status) => {
                const isAvailable = status === 'AVAILABLE';
                return (
                    <Tag color={isAvailable ? 'green' : 'red'}>
                        {isAvailable ? 'CÒN TRỐNG' : ' ĐÃ THUÊ'}
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        ghost
                        onClick={() => {
                            setEditingRoom(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    />
                    <Popconfirm
                        title="Xóa phòng này?"
                        onConfirm={() => handleDelete(record.room_id)} // Sử dụng room_id
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} ghost />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Quản lý danh sách phòng (Dữ liệu thật)</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    setEditingRoom(null);
                    form.resetFields();
                    setIsModalOpen(true);
                }}>
                    Thêm phòng mới
                </Button>
            </div>

            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey="room_id" // Cực kỳ quan trọng để hiện danh sách
            />

            <Modal
                title={editingRoom ? "Chỉnh sửa thông tin phòng" : "Thêm phòng trọ mới"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="room_number" label="Số phòng" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="room_type" label="Loại phòng" rules={[{ required: true }]}>
                        <Select placeholder="Chọn loại phòng">
                            <Select.Option value="Phòng đơn">Phòng đơn</Select.Option>
                            <Select.Option value="Phòng đôi">Phòng đôi</Select.Option>
                            <Select.Option value="Chung cư mini">Chung cư mini</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="base_price" label="Giá cơ bản" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="AVAILABLE">Trống</Select.Option>
                            <Select.Option value="OCCUPIED">Đã thuê</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoomManagement;