import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, Spin, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const TenantInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user.tenant_id) {
            axios.get(`http://localhost:5000/api/tenant/invoices/${user.tenant_id}`)
                .then(res => {
                    setInvoices(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    message.error("Lỗi lấy thông tin tiền phòng!");
                    setLoading(false);
                });
        }
    }, []);

    const columns = [
        { title: 'Kỳ thanh toán (Tháng)', dataIndex: 'billing_month', key: 'billing_month', render: t => <b>Tháng {t}</b> },
        {
            title: 'Tổng số tiền cần đóng',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: val => <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{parseInt(val).toLocaleString()} đ</span>
        },
        {
            title: 'Ngày lập hóa đơn',
            dataIndex: 'created_at',
            key: 'created_at',
            render: d => new Date(d).toLocaleDateString('vi-VN')
        },
        {
            title: 'Tình trạng thanh toán',
            dataIndex: 'status',
            key: 'status',
            render: status => status === 'PAID' ? <Tag color="success">Đã đóng tiền</Tag> : <Tag color="error">Còn nợ tiền phòng</Tag>
        }
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

    return (
        <div>
            <Title level={4} style={{ marginBottom: 20 }}><FileTextOutlined /> TRA CỨU HÓA ĐƠN TIỀN PHÒNG & DỊCH VỤ</Title>
            <Table dataSource={invoices} columns={columns} bordered pagination={{ pageSize: 6 }} />
        </div>
    );
};

export default TenantInvoices;