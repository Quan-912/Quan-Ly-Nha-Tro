import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Select, DatePicker, InputNumber,
    message, Tag, Typography, Popconfirm, Badge, Row, Col, Space
} from 'antd';
import { FileDoneOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const resCon = await axios.get('http://localhost:5000/api/contracts');
            const resRooms = await axios.get('http://localhost:5000/api/rooms');
            const resTenants = await axios.get('http://localhost:5000/api/tenants');

            setContracts(resCon.data);
            setRooms(resRooms.data.filter(r =>
                r.status === 'AVAILABLE' || r.status === 'CÒN TRỐNG'
            ));
            setTenants(resTenants.data);
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu!");
        }
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
                message.success("Đã lập hợp đồng!");
                setIsModalOpen(false);
                form.resetFields();
                fetchData();
            });
    };

    const handleDelete = async (contractKey) => {
        try {
            await axios.delete(`http://localhost:5000/api/contracts/${contractKey}`);
            message.success("Đã xóa!");
            fetchData();
        } catch (error) {
            message.error("Lỗi khi xóa!");
        }
    };

    /**
     * Thanh lý hợp đồng: gọi PUT /terminate → server đổi ACTIVE → EXPIRED
     * và trả phòng về AVAILABLE, ghi ngày kết thúc thực tế hôm nay.
     */
    const handleTerminate = async (contractKey) => {
        try {
            await axios.put(`http://localhost:5000/api/contracts/${contractKey}/terminate`);
            message.success("Đã thanh lý hợp đồng! Phòng đã được giải phóng.");
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.error || "Lỗi khi thanh lý hợp đồng!");
        }
    };

    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'room_number',
            key: 'room_number',
            width: 100,
            render: (text) => (
                <Tag color="blue" style={{ fontSize: '14px', fontWeight: 'bold', padding: '2px 8px' }}>
                    {text}
                </Tag>
            )
        },
        {
            title: 'Khách thuê',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text) => <Text style={{ fontSize: '15px', fontWeight: '600' }}>{text}</Text>
        },
        {
            title: 'Thời hạn',
            key: 'duration',
            render: (_, record) => (
                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    <div>
                        <Text type="secondary">Từ:</Text>{' '}
                        <Text strong>{record.start_date ? new Date(record.start_date).toLocaleDateString('vi-VN') : '—'}</Text>
                    </div>
                    <div>
                        <Text type="secondary">Đến:</Text>{' '}
                        <Text strong>{record.end_date ? new Date(record.end_date).toLocaleDateString('vi-VN') : 'Dài hạn'}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Tiền cọc',
            dataIndex: 'deposit_amount',
            align: 'right',
            render: val => (
                <Text style={{ fontSize: '15px', color: '#52c41a', fontWeight: 'bold' }}>
                    {val?.toLocaleString()}đ
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
            width: 130,
            render: s => {
                if (s === 'ACTIVE')
                    return <Badge status="success" text={<Text style={{ fontSize: '14px' }}>Hiệu lực</Text>} />;
                if (s === 'EXPIRED')
                    return <Badge status="default" text={<Text style={{ fontSize: '14px' }}>Đã thanh lý</Text>} />;
                return <Badge status="error" text={<Text style={{ fontSize: '14px' }}>Hết hạn</Text>} />;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => {
                const id = record.key || record.contract_id;
                return (
                    <Space size="small">
                        {/* Nút Thanh lý — chỉ hiện khi hợp đồng đang ACTIVE */}
                        {record.status === 'ACTIVE' && (
                            <Popconfirm
                                title="Xác nhận thanh lý hợp đồng?"
                                description="Phòng sẽ được giải phóng và trở về trạng thái trống."
                                onConfirm={() => handleTerminate(id)}
                                okText="Thanh lý"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    type="text"
                                    size="middle"
                                    icon={<StopOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />}
                                    title="Thanh lý hợp đồng"
                                />
                            </Popconfirm>
                        )}

                        {/* Nút Xóa — chỉ hiện khi hợp đồng đã EXPIRED (không cho xóa đang ACTIVE) */}
                        {record.status !== 'ACTIVE' && (
                            <Popconfirm
                                title="Xóa hợp đồng?"
                                description="Hành động này không thể hoàn tác."
                                onConfirm={() => handleDelete(id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    size="middle"
                                    danger
                                    icon={<DeleteOutlined style={{ fontSize: '18px' }} />}
                                    title="Xóa hợp đồng"
                                />
                            </Popconfirm>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, fontSize: '20px' }}>QUẢN LÝ HỢP ĐỒNG</Title>
                <Button
                    type="primary"
                    size="middle"
                    icon={<FileDoneOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    style={{ fontWeight: '500' }}
                >
                    Lập hợp đồng mới
                </Button>
            </div>

            <Table
                dataSource={contracts}
                columns={columns}
                size="middle"
                pagination={{ pageSize: 8 }}
                bordered
            />

            <Modal
                title={<span style={{ fontSize: '18px' }}>Lập hợp đồng mới</span>}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                width={550}
                okText="Ký kết"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleCreate} size="large">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="room_id" label={<Text strong>Phòng trống</Text>} rules={[{ required: true }]}>
                                <Select placeholder="Chọn phòng">
                                    {rooms.map(r => (
                                        <Select.Option key={r.room_id} value={r.room_id}>{r.room_number}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="tenant_id" label={<Text strong>Khách thuê</Text>} rules={[{ required: true }]}>
                                <Select placeholder="Chọn khách">
                                    {tenants.map(t => (
                                        <Select.Option key={t.tenant_id} value={t.tenant_id}>{t.full_name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="start_date" label={<Text strong>Ngày vào ở</Text>} rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="Bắt đầu" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="end_date" label={<Text strong>Ngày hết hạn</Text>}>
                                <DatePicker style={{ width: '100%' }} placeholder="Kết thúc" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="deposit_amount" label={<Text strong>Tiền đặt cọc</Text>} style={{ marginBottom: 0 }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            addonAfter="đ"
                            formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={v => v.replace(/\đ\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Contracts;