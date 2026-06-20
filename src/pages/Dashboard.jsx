import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, List, Badge, Spin, Alert } from 'antd';
import { HomeOutlined, UserOutlined, DollarOutlined, BellOutlined, WarningOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/admin/dashboard-stats')
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '0px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0, fontSize: '26px' }}>Báo cáo tổng quan</Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>Hệ thống quản lý thời gian thực</Text>
            </div>

            {/* Cảnh báo nổi bật nếu có hóa đơn chưa thu */}
            {stats.unpaid_count > 0 && (
                <Alert
                    message={
                        <Text strong>
                            Có <span style={{ color: '#cf1322', fontSize: 16 }}>{stats.unpaid_count}</span> hóa đơn chưa thu —
                            tổng số tiền còn nợ: <span style={{ color: '#cf1322', fontSize: 16 }}>{parseInt(stats.unpaid_amount).toLocaleString()} đ</span>
                        </Text>
                    }
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 20 }}
                />
            )}

            {/* Thẻ thống kê nhanh — 5 thẻ, hàng đầu */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={5}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic
                            title="Tổng số phòng"
                            value={stats.rooms.total_rooms}
                            prefix={<HomeOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic
                            title="Phòng đang thuê"
                            value={stats.rooms.occupied_rooms}
                            valueStyle={{ color: '#389e0d' }}
                            prefix={<HomeOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={4}>
                    <Card bordered={false} style={{ background: '#fff7e6' }}>
                        <Statistic
                            title="Khách đang ở"
                            value={stats.total_tenants}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={5}>
                    <Card bordered={false} style={{ background: '#f9f0ff' }}>
                        <Statistic
                            title="Doanh thu thực tế"
                            value={parseInt(stats.total_income).toLocaleString()}
                            valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                            suffix="đ"
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                {/* Thẻ hóa đơn chưa thu — nổi bật màu đỏ nhạt */}
                <Col span={5}>
                    <Card bordered={false} style={{ background: '#fff1f0', border: stats.unpaid_count > 0 ? '1px solid #ffa39e' : 'none' }}>
                        <Statistic
                            title={<Text style={{ color: '#cf1322' }}>Hóa đơn chưa thu</Text>}
                            value={stats.unpaid_count}
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            suffix={<Text style={{ fontSize: 13, color: '#cf1322' }}>hóa đơn</Text>}
                            prefix={<WarningOutlined style={{ color: '#cf1322' }} />}
                        />
                        {stats.unpaid_count > 0 && (
                            <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginTop: 4 }}>
                                ≈ {parseInt(stats.unpaid_amount).toLocaleString()} đ
                            </Text>
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                {/* Biểu đồ doanh thu */}
                <Col span={15}>
                    <Card
                        title={<Text strong style={{ fontSize: '16px' }}>Biểu đồ doanh thu theo tháng hóa đơn (VND)</Text>}
                        bordered={false}
                    >
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => value.toLocaleString()} />
                                    <Tooltip formatter={(value) => [value.toLocaleString() + ' đ', 'Doanh thu']} />
                                    <Bar dataKey="doanhThu" fill="#1890ff" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Bản tin vận hành — hiển thị động theo dữ liệu thực */}
                <Col span={9}>
                    <Card
                        title={<Text strong style={{ fontSize: '16px' }}><BellOutlined /> Bản tin vận hành nhanh</Text>}
                        bordered={false}
                        style={{ height: '100%' }}
                    >
                        <List
                            size="large"
                            dataSource={[
                                {
                                    text: `Hệ thống ghi nhận có ${stats.rooms.available_rooms} phòng trống sẵn sàng đón khách.`,
                                    type: 'info'
                                },
                                {
                                    text: stats.unpaid_count > 0
                                        ? `Còn ${stats.unpaid_count} hóa đơn chưa thu, tổng cộng ${parseInt(stats.unpaid_amount).toLocaleString()} đ. Vui lòng kiểm tra mục Hóa đơn.`
                                        : 'Tất cả hóa đơn đã được thanh toán đầy đủ.',
                                    type: stats.unpaid_count > 0 ? 'error' : 'success'
                                },
                                {
                                    text: 'Vui lòng kiểm tra mục Quản lý sự cố để xem phản hồi từ khách thuê.',
                                    type: 'warning'
                                }
                            ]}
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0' }}>
                                    <Badge status={item.type} text={<Text style={{ fontSize: '14px' }}>{item.text}</Text>} />
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