import React from 'react';
import { Card, Col, Row, Statistic, Typography, List, Badge } from 'antd';
import { HomeOutlined, UserOutlined, DollarOutlined, BellOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

const Dashboard = () => {
    const dataChart = [
        { name: 'T1', doanhThu: 15000000 },
        { name: 'T2', doanhThu: 18000000 },
        { name: 'T3', doanhThu: 12000000 },
        { name: 'T4', doanhThu: 25000000 },
        { name: 'T5', doanhThu: 22000000 },
        { name: 'T6', doanhThu: 30000000 },
    ];

    return (
        <div style={{ padding: '0px' }}>
            {/* Header: Tăng nhẹ level để chữ rõ hơn */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0, fontSize: '26px' }}>Báo cáo tổng quan</Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>Cập nhật lúc: {new Date().toLocaleDateString()}</Text>
            </div>

            {/* Hàng 1: Tăng fontSize của Label và Value */}
            <Row gutter={[12, 12]}>
                <Col span={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px' }} style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: '14px', color: '#595959' }}>DOANH THU THÁNG</Text>}
                            value={30000000}
                            valueStyle={{ color: '#3f8600', fontSize: '26px', fontWeight: 'bold' }} // Tăng lên 26px
                            prefix={<DollarOutlined style={{ fontSize: '20px' }} />}
                            suffix={<span style={{ fontSize: '14px' }}>đ</span>}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: '14px', color: '#595959' }}>TỔNG SỐ PHÒNG</Text>}
                            value={20}
                            valueStyle={{ fontSize: '26px', fontWeight: 'bold' }}
                            prefix={<HomeOutlined style={{ fontSize: '20px' }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: '14px', color: '#595959' }}>PHÒNG TRỐNG</Text>}
                            value={4}
                            valueStyle={{ color: '#cf1322', fontSize: '26px', fontWeight: 'bold' }}
                            prefix={<Badge status="error" style={{ marginRight: 8 }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: '14px', color: '#595959' }}>KHÁCH THUÊ MỚI</Text>}
                            value={3}
                            valueStyle={{ fontSize: '26px', fontWeight: 'bold' }}
                            prefix={<UserOutlined style={{ fontSize: '20px' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Hàng 2: Biểu đồ và Thông báo */}
            <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                <Col span={15}>
                    <Card
                        title={<Text strong style={{ fontSize: '16px' }}>Tăng trưởng doanh thu</Text>}
                        bordered={false}
                    >
                        <div style={{ width: '100%', height: 260 }}> {/* Tăng nhẹ chiều cao để biểu đồ thoáng hơn */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 500 }} />
                                    <YAxis tick={{ fontSize: 13 }} />
                                    <Tooltip
                                        contentStyle={{ fontSize: '14px' }}
                                        formatter={(value) => value.toLocaleString() + " đ"}
                                    />
                                    <Bar dataKey="doanhThu" fill="#1890ff" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                <Col span={9}>
                    <Card
                        title={<Text strong style={{ fontSize: '16px' }}><BellOutlined /> Thông báo</Text>}
                        bordered={false}
                        style={{ height: '100%' }}
                    >
                        <List
                            size="large" // Chuyển từ small sang large để giãn dòng và tăng chữ
                            dataSource={[
                                { text: 'Phòng 102 thanh toán hóa đơn', type: 'success' },
                                { text: 'Phòng 201 sắp hết hạn hợp đồng', type: 'warning' },
                                { text: 'Phòng 305 báo hỏng vòi nước', type: 'error' },
                                { text: 'Đã chốt số điện tháng 04', type: 'info' },
                            ]}
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0 border-bottom: 1px solid #f0f0f0' }}>
                                    <Badge status={item.type} text={<Text style={{ fontSize: '15px' }}>{item.text}</Text>} />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;