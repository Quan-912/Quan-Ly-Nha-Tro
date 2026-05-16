import React from 'react';
import { Card, Col, Row, Statistic, /*Table*/  } from 'antd';
import { HomeOutlined, UserOutlined, DollarOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, /*LineChart, Line*/ } from 'recharts';

const Dashboard = () => {
    // Dữ liệu giả lập cho biểu đồ doanh thu 6 tháng qua
    const dataChart = [
        { name: 'Tháng 11', doanhThu: 15000000 },
        { name: 'Tháng 12', doanhThu: 18000000 },
        { name: 'Tháng 01', doanhThu: 12000000 },
        { name: 'Tháng 02', doanhThu: 25000000 },
        { name: 'Tháng 03', doanhThu: 22000000 },
        { name: 'Tháng 04', doanhThu: 30000000 },
    ];

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>Báo cáo tổng quan</h2>

            {/* Hàng 1: Các con số thống kê nhanh */}
            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Tổng doanh thu tháng này"
                            value={30000000}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Tổng số phòng"
                            value={20}
                            prefix={<HomeOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Phòng đang trống"
                            value={4}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Khách thuê mới"
                            value={3}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Hàng 2: Biểu đồ doanh thu */}
            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={16}>
                    <Card title="Biểu đồ tăng trưởng doanh thu (6 tháng)" bordered={false}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataChart}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => value.toLocaleString() + " đ"} />
                                    <Bar dataKey="doanhThu" fill="#1890ff" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Thông báo mới nhất" bordered={false} style={{ height: '100%' }}>
                        <ul style={{ paddingLeft: 20 }}>
                            <li style={{ marginBottom: 10 }}>Phòng <b>102</b> vừa thanh toán hóa đơn.</li>
                            <li style={{ marginBottom: 10 }}>Hợp đồng phòng <b>201</b> sắp hết hạn (còn 5 ngày).</li>
                            <li style={{ marginBottom: 10 }}>Khách phòng <b>305</b> báo hỏng vòi nước.</li>
                            <li style={{ marginBottom: 10 }}>Đã chốt số điện tháng 04 cho 15/20 phòng.</li>
                        </ul>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;