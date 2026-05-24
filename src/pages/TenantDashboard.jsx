import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Alert, Spin, Typography, Tag, Badge } from 'antd';
import { HomeOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const TenantDashboard = () => {
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const userString = localStorage.getItem('user');
                const user = userString ? JSON.parse(userString) : null;
                if (user && user.id) {
                    const res = await axios.get(`http://localhost:5000/api/tenant/room-info/${user.id}`);
                    setRoomData(res.data);
                }
            } catch (err) {
                console.log("Thông tin: ", err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRoomInfo();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>;
    }

    return (
        <div style={{ maxWidth: 900 }}>
            {/* Header: Chữ to và đậm hơn */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HomeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Title level={4} style={{ margin: 0, fontWeight: 700 }}>THÔNG TIN PHÒNG THUÊ</Title>
            </div>

            {roomData ? (
                <Card
                    bordered={false}
                    bodyStyle={{ padding: '24px' }} // Tăng padding lên một chút để chữ "thở" được
                    style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: 12 }}
                >
                    <Descriptions
                        bordered
                        size="middle" // Chuyển từ small -> middle để chữ và khoảng cách to hơn
                        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                        labelStyle={{ fontSize: '15px', fontWeight: '500', backgroundColor: '#fafafa', width: '160px' }}
                        contentStyle={{ fontSize: '16px' }} // Chữ nội dung to 16px cực kỳ dễ đọc
                    >
                        <Descriptions.Item label="Số phòng">
                            <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>{roomData.room_number}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại phòng">
                            <Tag color="blue" style={{ fontSize: '14px', padding: '2px 10px' }}>{roomData.room_type}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Giá thuê">
                            <Text type="danger" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                {parseInt(roomData.base_price).toLocaleString('vi-VN')} đ
                            </Text>
                            <Text type="secondary" style={{ fontSize: '14px' }}> / tháng</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tiền đặt cọc">
                            <Text strong style={{ fontSize: '16px' }}>{parseInt(roomData.deposit_amount).toLocaleString('vi-VN')} đ</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày bắt đầu">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                                <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                {new Date(roomData.start_date).toLocaleDateString('vi-VN')}
                            </div>
                        </Descriptions.Item>

                        <Descriptions.Item label="Hợp đồng">
                            <Badge status="success" text={<Text strong style={{ color: '#52c41a', fontSize: '15px' }}>Đang hiệu lực</Text>} />
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Footer note: Chữ to rõ ràng */}
                    <div style={{ marginTop: 20, padding: '12px 16px', background: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                        <Text style={{ fontSize: '14px', color: '#0050b3' }}>
                            <InfoCircleOutlined style={{ marginRight: 8 }} />
                            Mọi thắc mắc về hợp đồng hoặc sự cố phòng, vui lòng liên hệ trực tiếp chủ trọ.
                        </Text>
                    </div>
                </Card>
            ) : (
                <Alert
                    message={<b style={{ fontSize: '16px' }}>Chưa có dữ liệu phòng</b>}
                    description={<span style={{ fontSize: '14px' }}>Tài khoản của bạn hiện chưa được gắn với hợp đồng nào. Vui lòng liên hệ Admin.</span>}
                    type="info"
                    showIcon
                />
            )}
        </div>
    );
};

export default TenantDashboard;