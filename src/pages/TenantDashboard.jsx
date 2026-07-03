import React, { useState, useEffect } from 'react';
import {
    Card, Descriptions, Spin, Typography, Tag, Badge,
    Form, Input, Button, Table, message, Tabs, Modal,
    Divider, Alert, Result, Image, Row, Col
} from 'antd';
import {
    HomeOutlined, CalendarOutlined, SendOutlined, DollarOutlined, ToolOutlined,
    HistoryOutlined, EyeOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined,
    PictureOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const TenantDashboard = () => {
    const [roomData, setRoomData] = useState(null);
    const [issues, setIssues] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    // Trạng thái booking hiện tại (PENDING / REJECTED / null)
    const [bookingStatus, setBookingStatus] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Modal chi tiết hóa đơn
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [roomRent, setRoomRent] = useState(0);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchData = async () => {
        if (!user.id) return;
        try {
            // Lấy thông tin phòng (hợp đồng ACTIVE)
            const resRoom = await axios.get(`http://localhost:5000/api/tenant/room-info/${user.id}`);
            setRoomData(resRoom.data);

            if (user.tenant_id) {
                const [resIssues, resInvoices] = await Promise.all([
                    axios.get(`http://localhost:5000/api/tenant/issues/${user.tenant_id}`),
                    axios.get(`http://localhost:5000/api/tenant/invoices/${user.tenant_id}`)
                ]);
                setIssues(resIssues.data);
                setInvoices(resInvoices.data);
            }
        } catch (err) {
            // 404 = chưa có hợp đồng ACTIVE → kiểm tra tiếp trạng thái booking
            if (err.response?.status === 404 && user.tenant_id) {
                try {
                    const resBooking = await axios.get(`http://localhost:5000/api/tenant/booking-status/${user.tenant_id}`);
                    setBookingStatus(resBooking.data);
                } catch (bookingErr) {
                    // 404 = chưa có booking nào → chuyển sang trang chọn phòng
                    if (bookingErr.response?.status === 404) {
                        navigate('/tenant/booking', { replace: true });
                        return;
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const onFinishIssue = async (values) => {
        if (!roomData?.room_id) { message.error("Không tìm thấy thông tin phòng!"); return; }
        try {
            await axios.post('http://localhost:5000/api/issues', {
                tenant_id: Number(user.tenant_id),
                room_id: Number(roomData.room_id),
                title: values.title,
                description: values.description || '',
                status: 'PENDING'
            });
            message.success("Đã gửi báo cáo thành công!");
            form.resetFields();
            fetchData();
        } catch (err) {
            message.error("Gửi thất bại!");
        }
    };

    const handleViewDetail = async (invoice) => {
        setSelectedInvoice(invoice);
        setDetailModalOpen(true);
        setDetailLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/invoices/${invoice.invoice_id}/details`);
            setInvoiceDetails(res.data.details);
            setRoomRent(res.data.room_rent || 0);
        } catch (err) {
            message.error("Không thể tải chi tiết hóa đơn!");
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

    // --- TRẠNG THÁI BOOKING PENDING: Hiện màn hình chờ duyệt ---
    if (!roomData && bookingStatus?.status === 'PENDING') {
        return (
            <div style={{ maxWidth: 600, margin: '40px auto' }}>
                <Result
                    icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                    title="Yêu cầu đặt phòng đang chờ duyệt"
                    subTitle="Chủ trọ sẽ xem xét và phản hồi sớm nhất có thể."
                    extra={<Button onClick={fetchData}>Làm mới trạng thái</Button>}
                >
                    <Card bordered={false} style={{ background: '#fffbe6', borderRadius: 8 }}>
                        <Descriptions column={1} size="middle">
                            <Descriptions.Item label="Phòng đã chọn">
                                <Tag color="blue" style={{ fontWeight: 'bold' }}>Phòng {bookingStatus.room_number}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phòng">{bookingStatus.room_type}</Descriptions.Item>
                            <Descriptions.Item label="Ngày dự kiến vào ở">
                                {new Date(bookingStatus.move_in_date).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số người ở">{bookingStatus.num_people} người</Descriptions.Item>
                            {bookingStatus.note && <Descriptions.Item label="Ghi chú">{bookingStatus.note}</Descriptions.Item>}
                            <Descriptions.Item label="Trạng thái">
                                <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ chủ trọ duyệt</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Result>
            </div>
        );
    }

    // --- TRẠNG THÁI BOOKING REJECTED: Thông báo từ chối + cho chọn lại ---
    if (!roomData && bookingStatus?.status === 'REJECTED') {
        return (
            <div style={{ maxWidth: 600, margin: '40px auto' }}>
                <Result
                    status="error"
                    title="Yêu cầu đặt phòng bị từ chối"
                    subTitle={<span>Lý do: <b>{bookingStatus.reject_reason || 'Không có lý do cụ thể'}</b></span>}
                    extra={
                        <Button type="primary" onClick={() => navigate('/tenant/booking')}>
                            Chọn phòng khác
                        </Button>
                    }
                />
            </div>
        );
    }

    // --- CHƯA CÓ PHÒNG VÀ CHƯA CÓ BOOKING → redirect (đã xử lý trong fetchData) ---
    if (!roomData) return null;

    // --- ĐÃ CÓ PHÒNG: Render dashboard bình thường ---
    const unpaidInvoices = invoices.filter(i => i.status === 'UNPAID' || i.status === 'PENDING');

    const renderOverviewTab = () => (
        <div>
            {unpaidInvoices.length > 0 && (
                <Alert
                    message={`Bạn có ${unpaidInvoices.length} hóa đơn chưa thanh toán!`}
                    description="Vui lòng kiểm tra tab Hóa đơn hàng tháng."
                    type="warning" showIcon style={{ marginBottom: 20 }}
                />
            )}
            <Card
                title={<span style={{ fontSize: '16px' }}><HomeOutlined /> THÔNG TIN PHÒNG Ở</span>}
                bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}
            >
                <Row gutter={20}>
                    {/* Cột ảnh phòng — lấy từ image_path do Admin upload */}
                    <Col xs={24} sm={8}>
                        {roomData.image_path ? (
                            <Image
                                src={`http://localhost:5000${roomData.image_path}`}
                                style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 220 }}
                                preview={{ mask: 'Xem ảnh phòng' }}
                            />
                        ) : (
                            <div style={{
                                width: '100%', height: 180, background: '#f0f0f0', borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <PictureOutlined style={{ fontSize: 36, color: '#bfbfbf' }} />
                            </div>
                        )}
                    </Col>

                    <Col xs={24} sm={16}>
                        <Descriptions bordered column={2} size="middle">
                            <Descriptions.Item label="Số phòng">
                                <b style={{ fontSize: '16px', color: '#1890ff' }}>Phòng {roomData.room_number}</b>
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phòng">{roomData.room_type}</Descriptions.Item>
                            <Descriptions.Item label="Giá thuê / tháng">
                                <Text type="danger" strong>{roomData.base_price ? parseInt(roomData.base_price).toLocaleString() : 0} đ</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền cọc">
                                {roomData.deposit_amount ? parseInt(roomData.deposit_amount).toLocaleString() : 0} đ
                            </Descriptions.Item>
                            {roomData.area && (
                                <Descriptions.Item label="Diện tích">{roomData.area} m²</Descriptions.Item>
                            )}
                            {roomData.floor && (
                                <Descriptions.Item label="Tầng">Tầng {roomData.floor}</Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày bắt đầu thuê">
                                <CalendarOutlined /> {roomData.start_date ? new Date(roomData.start_date).toLocaleDateString('vi-VN') : ''}
                            </Descriptions.Item>
                            <Descriptions.Item label="Hợp đồng"><Badge status="success" text="Đang hiệu lực" /></Descriptions.Item>
                            {roomData.description && (
                                <Descriptions.Item label="Tiện nghi" span={2}>{roomData.description}</Descriptions.Item>
                            )}
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Card title={<span><ToolOutlined /> Báo Cáo Hỏng Hóc</span>} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <Form form={form} layout="vertical" onFinish={onFinishIssue}>
                        <Form.Item name="title" label="Tên sự cố" rules={[{ required: true, message: 'Nhập tên sự cố!' }]}>
                            <Input placeholder="Cháy bóng đèn, Tắc bồn cầu..." />
                        </Form.Item>
                        <Form.Item name="description" label="Mô tả chi tiết">
                            <Input.TextArea rows={3} placeholder="Mô tả để chủ trọ chuẩn bị dụng cụ..." />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button type="primary" htmlType="submit" icon={<SendOutlined />} block>Gửi yêu cầu</Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card title={<span><HistoryOutlined /> Nhật Ký Sự Cố</span>} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <Table
                        dataSource={issues} rowKey="issue_id" size="small"
                        columns={[
                            { title: 'Nội dung', dataIndex: 'title', key: 'title' },
                            {
                                title: 'Trạng thái', dataIndex: 'status', key: 'status',
                                render: s => {
                                    if (s === 'PENDING') return <Tag color="error">Chờ tiếp nhận</Tag>;
                                    if (s === 'PROCESSING') return <Tag color="warning">Đang sửa</Tag>;
                                    return <Tag color="success">Đã xong</Tag>;
                                }
                            }
                        ]}
                        pagination={{ pageSize: 4 }}
                    />
                </Card>
            </div>
        </div>
    );

    const renderInvoiceTab = () => (
        <Card title={<span><DollarOutlined /> Lịch Sử Hóa Đơn</span>} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Table
                dataSource={invoices} rowKey="invoice_id" bordered
                columns={[
                    { title: 'Mã HĐ', dataIndex: 'invoice_id', key: 'invoice_id', width: 80, align: 'center' },
                    { title: 'Kỳ hóa đơn', dataIndex: 'month', key: 'month', align: 'center' },
                    {
                        title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount',
                        render: p => <Text type="danger" strong>{p ? parseInt(p).toLocaleString() : 0} đ</Text>
                    },
                    {
                        title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center',
                        render: s => s === 'PAID' ? <Tag color="success">Đã đóng</Tag> : <Tag color="red">Chưa đóng</Tag>
                    },
                    {
                        title: 'Ngày phát hành', dataIndex: 'created_at', key: 'created_at',
                        render: d => new Date(d).toLocaleDateString('vi-VN')
                    },
                    {
                        title: 'Chi tiết', key: 'action', align: 'center', width: 100,
                        render: (_, record) => (
                            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>Xem</Button>
                        )
                    }
                ]}
                pagination={{ pageSize: 6 }}
            />

            <Modal
                title={<span><FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />Chi tiết hóa đơn tháng {selectedInvoice?.month}</span>}
                open={detailModalOpen}
                onCancel={() => { setDetailModalOpen(false); setInvoiceDetails([]); }}
                footer={null} width={600}
            >
                {detailLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
                    <>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
                            background: '#f0f5ff', borderRadius: 6, marginBottom: 12
                        }}>
                            <Text strong>Tiền phòng cố định</Text>
                            <Text strong style={{ color: '#1890ff' }}>{parseInt(roomRent).toLocaleString()} đ</Text>
                        </div>
                        <Table
                            dataSource={invoiceDetails} rowKey="detail_id" size="middle" pagination={false} bordered
                            columns={[
                                { title: 'Dịch vụ', dataIndex: 'service_name', key: 'service_name', render: t => <Text strong>{t}</Text> },
                                { title: 'Chỉ số cũ', dataIndex: 'old_index', key: 'old_index', align: 'center', render: v => v ?? 0 },
                                { title: 'Chỉ số mới', dataIndex: 'new_index', key: 'new_index', align: 'center', render: v => v ?? 0 },
                                {
                                    title: 'Tiêu thụ', dataIndex: 'quantity', key: 'quantity', align: 'center',
                                    render: (v, r) => <Tag color="blue">{v} {r.unit}</Tag>
                                },
                                {
                                    title: 'Thành tiền', dataIndex: 'sub_total', key: 'sub_total', align: 'right',
                                    render: v => <Text strong style={{ color: '#d4380d' }}>{parseInt(v).toLocaleString()} đ</Text>
                                }
                            ]}
                        />
                        <Divider style={{ margin: '16px 0 12px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={5} style={{ margin: 0 }}>TỔNG CỘNG</Title>
                            <Title level={4} style={{ margin: 0, color: '#d4380d' }}>
                                {selectedInvoice?.total_amount ? parseInt(selectedInvoice.total_amount).toLocaleString() : 0} đ
                            </Title>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {selectedInvoice?.status === 'PAID'
                                ? <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>Đã thanh toán</Tag>
                                : <Tag color="error" style={{ fontSize: 14, padding: '4px 12px' }}>⚠ Chưa thanh toán</Tag>
                            }
                            {selectedInvoice?.status !== 'PAID' && (
                                <Button type="primary" icon={<DollarOutlined />}
                                        onClick={() => message.info('Vui lòng liên hệ chủ trọ để thanh toán trực tiếp hoặc chuyển khoản.')}>
                                    Yêu cầu thanh toán
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Modal>
        </Card>
    );

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '10px' }}>
            <Tabs defaultActiveKey="1" type="card" size="large" items={[
                { key: '1', label: 'Tổng quan & Báo hỏng', children: renderOverviewTab() },
                { key: '2', label: 'Hóa đơn hàng tháng', children: renderInvoiceTab() }
            ]} />
        </div>
    );
};

export default TenantDashboard;