import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Tag, Button, Modal, Form, DatePicker,
    InputNumber, Input, Typography, Spin, Empty, message,
    Badge, Descriptions, Result, Alert, Select, Space
} from 'antd';
import {
    HomeOutlined, CalendarOutlined, AppstoreOutlined,
    TeamOutlined, FileTextOutlined, ClockCircleOutlined,
    ExpandOutlined, ApartmentOutlined, SearchOutlined, FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const RoomBooking = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [existingBooking, setExistingBooking] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // State cho tìm kiếm và lọc phòng
    const [searchNumber, setSearchNumber] = useState('');
    const [priceRange, setPriceRange] = useState({ min: null, max: null });
    const [filterType, setFilterType] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchData = async (filters = {}) => {
        setLoading(true);
        try {
            const params = {};
            if (filters.room_number) params.room_number = filters.room_number;
            if (filters.min_price) params.min_price = filters.min_price;
            if (filters.max_price) params.max_price = filters.max_price;
            if (filters.room_type) params.room_type = filters.room_type;

            const resRooms = await axios.get('http://localhost:5000/api/tenant/available-rooms', { params });
            setRooms(resRooms.data);
        } catch (err) {
            message.error('Không thể tải danh sách phòng!');
        }
        if (user.tenant_id) {
            try {
                const resBooking = await axios.get(`http://localhost:5000/api/tenant/booking-status/${user.tenant_id}`);
                setExistingBooking(resBooking.data);
            } catch (err) {
                if (err.response?.status !== 404) console.error('Lỗi lấy trạng thái booking:', err);
            }
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // Áp dụng tìm kiếm/lọc — gọi lại API mỗi khi người dùng bấm "Tìm kiếm"
    const handleApplyFilters = () => {
        fetchData({
            room_number: searchNumber,
            min_price: priceRange.min,
            max_price: priceRange.max,
            room_type: filterType
        });
    };

    const handleResetFilters = () => {
        setSearchNumber('');
        setPriceRange({ min: null, max: null });
        setFilterType(null);
        fetchData({});
    };

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
        form.setFieldsValue({ move_in_date: dayjs().add(1, 'day'), num_people: 1, note: '' });
        setIsModalOpen(true);
    };

    const handleSubmitBooking = async (values) => {
        setSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/tenant/booking-request', {
                tenant_id: user.tenant_id,
                room_id: selectedRoom.room_id,
                move_in_date: values.move_in_date.format('YYYY-MM-DD'),
                num_people: values.num_people,
                note: values.note || ''
            });
            setIsModalOpen(false);
            message.success('Đã gửi yêu cầu đặt phòng! Vui lòng chờ chủ trọ xét duyệt.');
            fetchData();
        } catch (err) {
            message.error(err.response?.data?.error || 'Lỗi hệ thống!');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}><Spin size="large" /></div>;

    if (existingBooking?.status === 'PENDING') {
        return (
            <div style={{ maxWidth: 600, margin: '40px auto' }}>
                <Result
                    icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                    title="Yêu cầu đặt phòng đang chờ duyệt"
                    subTitle="Chủ trọ sẽ xem xét và phản hồi sớm nhất có thể."
                    extra={<Button onClick={() => navigate('/tenant')}>Về trang chủ</Button>}
                >
                    <Card bordered={false} style={{ background: '#fffbe6', borderRadius: 8 }}>
                        <Descriptions column={1} size="middle">
                            <Descriptions.Item label="Phòng đã chọn">
                                <Tag color="blue" style={{ fontWeight: 'bold' }}>Phòng {existingBooking.room_number}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phòng">{existingBooking.room_type}</Descriptions.Item>
                            <Descriptions.Item label="Ngày dự kiến vào ở">
                                {new Date(existingBooking.move_in_date).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số người ở">{existingBooking.num_people} người</Descriptions.Item>
                            {existingBooking.note && <Descriptions.Item label="Ghi chú">{existingBooking.note}</Descriptions.Item>}
                            <Descriptions.Item label="Trạng thái">
                                <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ chủ trọ duyệt</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Result>
            </div>
        );
    }

    if (existingBooking?.status === 'REJECTED') {
        return (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <Alert
                    message="Yêu cầu đặt phòng bị từ chối"
                    description={<span>Lý do: <b>{existingBooking.reject_reason || 'Không có lý do cụ thể'}</b>. Bạn có thể chọn phòng khác bên dưới.</span>}
                    type="error" showIcon style={{ marginBottom: 24 }}
                />
                {renderRoomList()}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
                <AppstoreOutlined style={{ fontSize: 36, color: '#1890ff', marginBottom: 8 }} />
                <Title level={3} style={{ margin: 0 }}>Danh Sách Phòng Trống</Title>
                <Text type="secondary">Chọn phòng phù hợp và gửi yêu cầu thuê</Text>
            </div>
            {renderRoomList()}
        </div>
    );

    function renderSearchBar() {
        return (
            <Card
                size="small"
                style={{ marginBottom: 20, borderRadius: 10, background: '#fafafa' }}
                bodyStyle={{ padding: '14px 16px' }}
            >
                <Row gutter={[12, 12]} align="bottom">
                    <Col xs={24} sm={6}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Số phòng</Text>
                        <Input
                            placeholder="Ví dụ: 101"
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={4}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Giá từ</Text>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0"
                            min={0}
                            value={priceRange.min}
                            onChange={(v) => setPriceRange(prev => ({ ...prev, min: v }))}
                            formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                        />
                    </Col>
                    <Col xs={12} sm={4}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Đến</Text>
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Không giới hạn"
                            min={0}
                            value={priceRange.max}
                            onChange={(v) => setPriceRange(prev => ({ ...prev, max: v }))}
                            formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                        />
                    </Col>
                    <Col xs={12} sm={5}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Loại phòng</Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Tất cả loại phòng"
                            value={filterType}
                            onChange={setFilterType}
                            allowClear
                        >
                            <Select.Option value="Phòng đơn">Phòng đơn</Select.Option>
                            <Select.Option value="Phòng đôi">Phòng đôi</Select.Option>
                            <Select.Option value="Chung cư mini">Chung cư mini</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={5}>
                        <Space>
                            <Button type="primary" icon={<FilterOutlined />} onClick={handleApplyFilters}>
                                Tìm kiếm
                            </Button>
                            <Button onClick={handleResetFilters}>Xóa lọc</Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
        );
    }

    function renderRoomList() {
        return (
            <>
                {renderSearchBar()}

                {rooms.length === 0 ? (
                    <Empty description={<Text>Không tìm thấy phòng phù hợp với tiêu chí lọc. Vui lòng thử lại với điều kiện khác.</Text>} style={{ padding: '60px 0' }} />
                ) : (
                    <Row gutter={[20, 20]}>
                        {rooms.map(room => (
                            <Col xs={24} sm={12} md={8} key={room.room_id}>
                                <Card
                                    hoverable
                                    style={{ borderRadius: 12, border: '1px solid #e8f4ff', boxShadow: '0 2px 12px rgba(24,144,255,0.08)' }}
                                    actions={[
                                        <Button
                                            type="primary"
                                            icon={<HomeOutlined />}
                                            onClick={() => handleSelectRoom(room)}
                                            style={{ margin: '0 16px', width: 'calc(100% - 32px)' }}
                                        >
                                            Đặt phòng này
                                        </Button>
                                    ]}
                                >
                                    <div style={{ marginBottom: 8 }}>
                                        <Badge status="success" text={<Text style={{ color: '#52c41a', fontWeight: 600 }}>Còn trống</Text>} />
                                    </div>
                                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                                        <div style={{
                                            width: 56, height: 56, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8
                                        }}>
                                            <HomeOutlined style={{ fontSize: 24, color: '#fff' }} />
                                        </div>
                                        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>Phòng {room.room_number}</Title>
                                    </div>

                                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <Text type="secondary">Loại phòng</Text>
                                            <Tag color="blue">{room.room_type}</Tag>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <Text type="secondary">Giá thuê / tháng</Text>
                                            <Text strong style={{ color: '#d4380d', fontSize: 15 }}>
                                                {parseInt(room.base_price).toLocaleString('vi-VN')} đ
                                            </Text>
                                        </div>
                                        {room.area && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text type="secondary"><ExpandOutlined /> Diện tích</Text>
                                                <Text>{room.area} m²</Text>
                                            </div>
                                        )}
                                        {room.floor && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text type="secondary"><ApartmentOutlined /> Tầng</Text>
                                                <Text>Tầng {room.floor}</Text>
                                            </div>
                                        )}
                                        {room.description && (
                                            <div style={{ marginTop: 8, padding: '6px 8px', background: '#f6ffed', borderRadius: 4 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>🛋 {room.description}</Text>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Modal xác nhận đặt phòng */}
                <Modal
                    title={
                        <span style={{ fontSize: 17 }}>
                            <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            Đặt phòng {selectedRoom?.room_number}
                        </span>
                    }
                    open={isModalOpen}
                    onOk={() => form.submit()}
                    onCancel={() => setIsModalOpen(false)}
                    okText="Gửi yêu cầu đặt phòng"
                    cancelText="Hủy"
                    confirmLoading={submitting}
                    width={520}
                >
                    {selectedRoom && (
                        <>
                            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
                                <Descriptions.Item label="Phòng" span={1}>
                                    <Text strong style={{ color: '#1890ff' }}>Phòng {selectedRoom.room_number}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại" span={1}>{selectedRoom.room_type}</Descriptions.Item>
                                <Descriptions.Item label="Giá / tháng" span={1}>
                                    <Text strong style={{ color: '#d4380d' }}>
                                        {parseInt(selectedRoom.base_price).toLocaleString('vi-VN')} đ
                                    </Text>
                                </Descriptions.Item>
                                {selectedRoom.area && (
                                    <Descriptions.Item label="Diện tích" span={1}>{selectedRoom.area} m²</Descriptions.Item>
                                )}
                                {selectedRoom.floor && (
                                    <Descriptions.Item label="Tầng" span={1}>Tầng {selectedRoom.floor}</Descriptions.Item>
                                )}
                                {selectedRoom.description && (
                                    <Descriptions.Item label="Tiện nghi" span={2}>{selectedRoom.description}</Descriptions.Item>
                                )}
                            </Descriptions>

                            <Form form={form} layout="vertical" onFinish={handleSubmitBooking} size="large">
                                <Form.Item
                                    name="move_in_date"
                                    label={<Text strong><CalendarOutlined /> Ngày dự kiến vào ở</Text>}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                                >
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        format="DD/MM/YYYY"
                                        disabledDate={d => d && d < dayjs().startOf('day')}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="num_people"
                                    label={<Text strong><TeamOutlined /> Số người ở</Text>}
                                    rules={[{ required: true, message: 'Vui lòng nhập số người!' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={1}
                                        max={selectedRoom.room_type === 'Phòng đơn' ? 1 : 4}
                                        placeholder={selectedRoom.room_type === 'Phòng đơn' ? 'Tối đa 1 người' : 'Tối đa 4 người'}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="note"
                                    label={<Text strong><FileTextOutlined /> Ghi chú thêm</Text>}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input.TextArea rows={3} placeholder="Yêu cầu đặc biệt, thời gian liên hệ..." />
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </Modal>
            </>
        );
    }
};

export default RoomBooking;