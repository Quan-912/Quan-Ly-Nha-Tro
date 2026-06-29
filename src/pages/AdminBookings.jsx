import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Button, Space, Typography, message,
    Modal, Form, Input, InputNumber, Descriptions, Popconfirm, DatePicker
} from 'antd';
import {
    CheckCircleOutlined, CloseCircleOutlined,
    ClockCircleOutlined, HomeOutlined, DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal nhập tiền cọc khi duyệt
    const [approveModal, setApproveModal] = useState({ open: false, booking: null });
    const [approveForm] = Form.useForm();
    const [approving, setApproving] = useState(false);

    // Modal nhập lý do từ chối
    const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
    const [rejectForm] = Form.useForm();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/admin/bookings');
            setBookings(res.data);
        } catch (err) {
            message.error('Không thể tải danh sách yêu cầu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    /**
     * Admin nhập tiền cọc trong modal → gửi lên server kèm deposit_amount.
     * Server tạo hợp đồng ACTIVE với tiền cọc đúng thay vì hardcode 0.
     */
    const handleApproveSubmit = async (values) => {
        setApproving(true);
        try {
            await axios.put(
                `http://localhost:5000/api/admin/bookings/${approveModal.booking.booking_id}/approve`,
                {
                    deposit_amount: values.deposit_amount || 0,
                    end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null
                }
            );
            message.success('Đã duyệt! Hợp đồng được tạo tự động.');
            setApproveModal({ open: false, booking: null });
            approveForm.resetFields();
            fetchBookings();
        } catch (err) {
            message.error(err.response?.data?.error || 'Lỗi khi duyệt!');
        } finally {
            setApproving(false);
        }
    };

    const handleRejectSubmit = async (values) => {
        try {
            await axios.put(
                `http://localhost:5000/api/admin/bookings/${rejectModal.bookingId}/reject`,
                { reject_reason: values.reject_reason }
            );
            message.success('Đã từ chối yêu cầu.');
            setRejectModal({ open: false, bookingId: null });
            rejectForm.resetFields();
            fetchBookings();
        } catch (err) {
            message.error('Lỗi khi từ chối!');
        }
    };

    const statusTag = (status) => {
        if (status === 'PENDING')  return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
        if (status === 'APPROVED') return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
        return <Tag color="error" icon={<CloseCircleOutlined />}>Từ chối</Tag>;
    };

    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'room_number',
            key: 'room_number',
            width: 90,
            render: t => <Tag color="blue" style={{ fontWeight: 'bold' }}>{t}</Tag>
        },
        {
            title: 'Loại phòng',
            dataIndex: 'room_type',
            key: 'room_type',
            width: 120
        },
        {
            title: 'Khách thuê',
            dataIndex: 'full_name',
            key: 'full_name',
            render: t => <Text strong>{t}</Text>
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
            width: 120
        },
        {
            title: 'Ngày vào ở',
            dataIndex: 'move_in_date',
            key: 'move_in_date',
            width: 120,
            render: d => new Date(d).toLocaleDateString('vi-VN')
        },
        {
            title: 'Số người',
            dataIndex: 'num_people',
            key: 'num_people',
            align: 'center',
            width: 90
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: t => <Text type="secondary">{t || '—'}</Text>
        },
        {
            title: 'Ngày gửi',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 110,
            render: d => new Date(d).toLocaleDateString('vi-VN')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: statusTag
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 180,
            render: (_, record) => {
                if (record.status !== 'PENDING') {
                    return (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {record.status === 'APPROVED'
                                ? 'Đã tạo hợp đồng'
                                : `Lý do: ${record.reject_reason || '—'}`}
                        </Text>
                    );
                }
                return (
                    <Space size="small">
                        {/* Nút Duyệt → mở modal nhập tiền cọc */}
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => {
                                setApproveModal({ open: true, booking: record });
                                approveForm.resetFields();
                            }}
                        >
                            Duyệt
                        </Button>
                        <Button
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => setRejectModal({ open: true, bookingId: record.booking_id })}
                        >
                            Từ chối
                        </Button>
                    </Space>
                );
            }
        }
    ];

    return (
        <div>
            <Title level={4} style={{ marginBottom: 20 }}>
                <HomeOutlined /> DUYỆT YÊU CẦU ĐẶT PHÒNG
            </Title>

            <Table
                dataSource={bookings}
                columns={columns}
                rowKey="booking_id"
                loading={loading}
                bordered
                size="middle"
                pagination={{ pageSize: 8 }}
            />

            {/* Modal duyệt — nhập tiền cọc */}
            <Modal
                title={<Text strong>Xác nhận duyệt & nhập tiền cọc</Text>}
                open={approveModal.open}
                onOk={() => approveForm.submit()}
                onCancel={() => {
                    setApproveModal({ open: false, booking: null });
                    approveForm.resetFields();
                }}
                okText="Xác nhận duyệt"
                cancelText="Hủy"
                confirmLoading={approving}
            >
                {approveModal.booking && (
                    <>
                        <Descriptions bordered size="small" column={1} style={{ marginBottom: 20 }}>
                            <Descriptions.Item label="Khách thuê">
                                <Text strong>{approveModal.booking.full_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phòng">
                                <Tag color="blue" style={{ fontWeight: 'bold' }}>
                                    Phòng {approveModal.booking.room_number}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày vào ở">
                                {new Date(approveModal.booking.move_in_date).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Form form={approveForm} layout="vertical" onFinish={handleApproveSubmit} size="large">
                            <Form.Item
                                name="deposit_amount"
                                label={<Text strong><DollarOutlined /> Tiền đặt cọc</Text>}
                                initialValue={0}
                                rules={[{ required: true, message: 'Vui lòng nhập tiền cọc!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    addonAfter="đ"
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={v => v.replace(/\đ\s?|(,*)/g, '')}
                                    placeholder="Nhập 0 nếu không thu cọc"
                                />
                            </Form.Item>
                            <Form.Item
                                name="end_date"
                                label={<Text strong>Ngày hết hạn hợp đồng</Text>}
                                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn!' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày kết thúc hợp đồng"
                                    disabledDate={d => d && d < dayjs().endOf('day')}
                                />
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Modal>

            {/* Modal từ chối — nhập lý do */}
            <Modal
                title={<Text strong>Lý do từ chối</Text>}
                open={rejectModal.open}
                onOk={() => rejectForm.submit()}
                onCancel={() => {
                    setRejectModal({ open: false, bookingId: null });
                    rejectForm.resetFields();
                }}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <Form form={rejectForm} layout="vertical" onFinish={handleRejectSubmit}>
                    <Form.Item
                        name="reject_reason"
                        label="Nhập lý do từ chối để thông báo cho khách"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Phòng đã có người đặt trước, yêu cầu không hợp lệ..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminBookings;