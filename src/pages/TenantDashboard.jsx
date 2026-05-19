import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Alert, Spin, message, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const TenantDashboard = () => {
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                // 1. Lấy user_id từ localStorage (đã lưu lúc đăng nhập)
                const userString = localStorage.getItem('user');
                const user = userString ? JSON.parse(userString) : null;

                if (user && user.id) {
                    // 2. Gọi API lấy thông tin phòng
                    const res = await axios.get(`http://localhost:5000/api/tenant/room-info/${user.id}`);
                    setRoomData(res.data);
                }
            } catch (err) {
                // Nếu không tìm thấy phòng, chúng ta không báo lỗi đỏ mà chỉ để roomData null
                console.log("Thông tin: ", err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomInfo();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Đang tải thông tin phòng..." /></div>;
    }

    return (
        <div>
            <Title level={4} style={{ marginBottom: 20 }}>Thông tin phòng của tôi</Title>

            {roomData ? (
                <Card
                    bordered={false}
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 12 }}
                >
                    <Descriptions
                        bordered
                        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                    >
                        <Descriptions.Item label="Số phòng">
                            <b style={{ color: '#1890ff', fontSize: 16 }}>{roomData.room_number}</b>
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại phòng">{roomData.room_type}</Descriptions.Item>
                        <Descriptions.Item label="Giá thuê hàng tháng">
                            <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                                {parseInt(roomData.base_price).toLocaleString('vi-VN')} VND
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiền cọc">
                            {parseInt(roomData.deposit_amount).toLocaleString('vi-VN')} VND
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày bắt đầu">
                            {new Date(roomData.start_date).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái hợp đồng">
                            <Alert message="Đang hiệu lực" type="success" showIcon style={{ padding: '2px 10px' }} />
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            ) : (
                <Alert
                    message="Thông báo"
                    description="Hiện tại hệ thống chưa ghi nhận hợp đồng thuê phòng nào của bạn. Vui lòng liên hệ chủ trọ để được cập nhật."
                    type="warning"
                    showIcon
                />
            )}
        </div>
    );
};

export default TenantDashboard;