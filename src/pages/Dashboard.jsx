import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, List, Badge, Spin, Alert, Space } from 'antd';
import {
    HomeOutlined, UserOutlined, DollarOutlined, BellOutlined,
    WarningOutlined, RiseOutlined, CalendarOutlined,
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import axios from 'axios';

const { Title, Text } = Typography;

// ── Màu biểu đồ tròn
const PIE_COLORS = ['#10B981', '#6C63FF'];

/**
 * StatCard — card thống kê với icon gradient + border-top accent
 * @param gradient     chuỗi CSS gradient cho hộp icon
 * @param shadowColor  màu bóng cho hộp icon
 * @param className    CSS class accent border (stat-violet, stat-green...)
 */
const StatCard = ({ title, value, suffix, icon, gradient, shadowColor, className, extra }) => (
    <Card
        className={`hover-card ${className || ''}`}
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(108,99,255,0.07)', height: '100%' }}
        bodyStyle={{ padding: '20px 22px' }}
    >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: 500 }}>{title}</Text>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: '#1E1B4B', lineHeight: 1 }}>
                        {value}
                    </span>
                    {suffix && (
                        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{suffix}</Text>
                    )}
                </div>
                {extra && <div style={{ marginTop: 5 }}>{extra}</div>}
            </div>

            {/* Hộp icon gradient */}
            <div style={{
                width: 50, height: 50, flexShrink: 0,
                background: gradient,
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 16px ${shadowColor}`,
                marginLeft: 12,
            }}>
                {icon}
            </div>
        </div>
    </Card>
);

/**
 * Formatter trục Y biểu đồ — tự chuyển 1M / 100K / số thường
 */
const yAxisFormatter = (v) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000)     return (v / 1_000).toFixed(0) + 'K';
    return v.toString();
};

const Dashboard = () => {
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/admin/dashboard-stats')
            .then(res => { setStats(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#9CA3AF', fontSize: 14 }}>Đang tải dữ liệu...</div>
        </div>
    );

    const roomStatusData = [
        { name: 'Còn trống',    value: stats.rooms.available_rooms || 0 },
        { name: 'Đã cho thuê', value: stats.rooms.occupied_rooms  || 0 },
    ];

    return (
        <div>
            {/* ── Page heading ── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 22,
            }}>
                <div>
                    <Title level={4} style={{ margin: 0, color: '#1E1B4B', fontWeight: 800 }}>
                        Tổng quan hệ thống
                    </Title>
                    <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                        Dữ liệu cập nhật theo thời gian thực
                    </Text>
                </div>
                {/* Chip ngày hiện tại */}
                <div style={{
                    padding: '7px 16px',
                    background: 'linear-gradient(135deg, #F5F3FF, #EEF2FF)',
                    borderRadius: 20,
                    border: '1px solid rgba(108,99,255,0.18)',
                }}>
                    <Text style={{ color: '#6C63FF', fontSize: 13, fontWeight: 600 }}>
                        <CalendarOutlined style={{ marginRight: 6 }} />
                        {new Date().toLocaleDateString('vi-VN', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                    </Text>
                </div>
            </div>

            {/* ── Cảnh báo hóa đơn chưa thu ── */}
            {stats.unpaid_count > 0 && (
                <Alert
                    message={
                        <Text strong>
                            Có{' '}
                            <span style={{ color: '#EF4444', fontSize: 15 }}>{stats.unpaid_count}</span>
                            {' '}hóa đơn chưa thu — tổng nợ:{' '}
                            <span style={{ color: '#EF4444', fontSize: 15 }}>
                                {parseInt(stats.unpaid_amount).toLocaleString()} đ
                            </span>
                        </Text>
                    }
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 20, borderRadius: 10 }}
                />
            )}

            {/* ── Stat cards — CSS grid 5 cột để chia đều không dùng span lẻ ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 14,
                marginBottom: 22,
            }}>
                <StatCard
                    title="Tổng số phòng"
                    value={stats.rooms.total_rooms}
                    icon={<HomeOutlined style={{ color: '#fff', fontSize: 22 }} />}
                    gradient="linear-gradient(135deg, #6C63FF, #4F46E5)"
                    shadowColor="rgba(108,99,255,0.38)"
                    className="stat-violet"
                />
                <StatCard
                    title="Phòng đang thuê"
                    value={stats.rooms.occupied_rooms}
                    icon={<HomeOutlined style={{ color: '#fff', fontSize: 22 }} />}
                    gradient="linear-gradient(135deg, #10B981, #059669)"
                    shadowColor="rgba(16,185,129,0.38)"
                    className="stat-green"
                />
                <StatCard
                    title="Khách đang ở"
                    value={stats.total_tenants}
                    icon={<UserOutlined style={{ color: '#fff', fontSize: 22 }} />}
                    gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
                    shadowColor="rgba(139,92,246,0.38)"
                    className="stat-purple"
                />
                <StatCard
                    title="Doanh thu thực tế"
                    value={parseInt(stats.total_income).toLocaleString()}
                    suffix="đ"
                    icon={<DollarOutlined style={{ color: '#fff', fontSize: 22 }} />}
                    gradient="linear-gradient(135deg, #F59E0B, #D97706)"
                    shadowColor="rgba(245,158,11,0.38)"
                    className="stat-amber"
                />
                <StatCard
                    title="Hóa đơn chưa thu"
                    value={stats.unpaid_count}
                    suffix="HĐ"
                    icon={<WarningOutlined style={{ color: '#fff', fontSize: 22 }} />}
                    gradient="linear-gradient(135deg, #EF4444, #DC2626)"
                    shadowColor="rgba(239,68,68,0.38)"
                    className="stat-red"
                    extra={
                        stats.unpaid_count > 0 && (
                            <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 500 }}>
                                ≈ {parseInt(stats.unpaid_amount).toLocaleString()} đ
                            </Text>
                        )
                    }
                />
            </div>

            {/* ── Charts row: 13 + 6 + 5 = 24 ── */}
            <Row gutter={[14, 14]}>
                {/* Biểu đồ cột doanh thu */}
                <Col span={13}>
                    <Card
                        title={
                            <Space>
                                <RiseOutlined style={{ color: '#6C63FF' }} />
                                <Text strong style={{ color: '#1E1B4B' }}>
                                    Doanh thu theo tháng hóa đơn (VNĐ)
                                </Text>
                            </Space>
                        }
                        bordered={false}
                        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(108,99,255,0.07)' }}
                    >
                        <div style={{ width: '100%', height: 270 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={stats.chartData}
                                    margin={{ top: 6, right: 6, left: 0, bottom: 0 }}
                                >
                                    {/* Defs gradient tô màu cột */}
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%"   stopColor="#6C63FF" />
                                            <stop offset="100%" stopColor="#06B6D4" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EFFE" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={yAxisFormatter}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        formatter={v => [parseInt(v).toLocaleString() + ' đ', 'Doanh thu']}
                                        contentStyle={{
                                            borderRadius: 10,
                                            border: '1px solid #EDE9FE',
                                            boxShadow: '0 4px 12px rgba(108,99,255,0.12)',
                                            fontSize: 13,
                                        }}
                                        cursor={{ fill: 'rgba(108,99,255,0.06)' }}
                                    />
                                    <Bar dataKey="doanhThu" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Biểu đồ tròn tỉ lệ phòng */}
                <Col span={6}>
                    <Card
                        title={<Text strong style={{ color: '#1E1B4B' }}>Tỉ lệ tình trạng phòng</Text>}
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            boxShadow: '0 2px 12px rgba(108,99,255,0.07)',
                            height: '100%',
                        }}
                    >
                        <div style={{ width: '100%', height: 242 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={roomStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%" cy="46%"
                                        outerRadius={78}
                                        innerRadius={32}
                                        paddingAngle={3}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {roomStatusData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(v, n) => [`${v} phòng`, n]}
                                        contentStyle={{ borderRadius: 10, fontSize: 13 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={32}
                                        iconType="circle"
                                        iconSize={10}
                                        formatter={v => (
                                            <span style={{ color: '#374151', fontSize: 12 }}>{v}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Bản tin vận hành */}
                <Col span={5}>
                    <Card
                        title={
                            <Space>
                                <BellOutlined style={{ color: '#6C63FF' }} />
                                <Text strong style={{ color: '#1E1B4B' }}>Bản tin vận hành</Text>
                            </Space>
                        }
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            boxShadow: '0 2px 12px rgba(108,99,255,0.07)',
                            height: '100%',
                        }}
                    >
                        <List
                            size="small"
                            dataSource={[
                                {
                                    text: `${stats.rooms.available_rooms} phòng trống, sẵn sàng đón khách.`,
                                    type: 'success',
                                },
                                {
                                    text: stats.unpaid_count > 0
                                        ? `Còn ${stats.unpaid_count} hóa đơn chưa thu (${parseInt(stats.unpaid_amount).toLocaleString()} đ).`
                                        : 'Tất cả hóa đơn đã thanh toán.',
                                    type: stats.unpaid_count > 0 ? 'error' : 'success',
                                },
                                {
                                    text: 'Kiểm tra mục Sự cố để xem phản hồi từ khách thuê.',
                                    type: 'warning',
                                },
                            ]}
                            renderItem={item => (
                                <List.Item style={{
                                    padding: '11px 0',
                                    borderBottom: '1px solid #F5F3FF',
                                }}>
                                    <Badge
                                        status={item.type}
                                        text={<Text style={{ fontSize: 13, color: '#374151' }}>{item.text}</Text>}
                                    />
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