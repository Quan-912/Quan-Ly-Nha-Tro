import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, message, Popconfirm } from 'antd';
import { ToolOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const AdminIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/admin/issues');
            setIssues(res.data);
        } catch (err) {
            message.error("Không thể lấy danh sách sự cố!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIssues(); }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/issues/${id}`, { status: newStatus });
            message.success("Đã cập nhật trạng thái xử lý!");
            fetchIssues();
        } catch (err) {
            message.error("Lỗi cập nhật trạng thái!");
        }
    };

    const columns = [
        { title: 'Phòng', dataIndex: 'room_number', key: 'room_number', width: 90 },
        { title: 'Khách báo cáo', dataIndex: 'full_name', key: 'full_name' },
        { title: 'Tiêu đề sự cố', dataIndex: 'title', key: 'title', render: text => <b>{text}</b> },
        { title: 'Mô tả chi tiết', dataIndex: 'description', key: 'description' },
        {
            title: 'Ngày báo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: date => new Date(date).toLocaleString('vi-VN')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                if (status === 'PENDING') return <Tag color="error" icon={<ClockCircleOutlined />}>Chờ tiếp nhận</Tag>;
                if (status === 'PROCESSING') return <Tag color="warning" icon={<ToolOutlined />}>Đang sửa chữa</Tag>;
                return <Tag color="success" icon={<CheckCircleOutlined />}>Đã khắc phục</Tag>;
            }
        },
        {
            title: 'Thao tác xử lý',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'PENDING' && (
                        <Button type="primary" ghost icon={<ToolOutlined />} onClick={() => updateStatus(record.issue_id, 'PROCESSING')}>
                            Sửa chữa
                        </Button>
                    )}
                    {record.status === 'PROCESSING' && (
                        <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => updateStatus(record.issue_id, 'RESOLVED')}>
                            Hoàn thành
                        </Button>
                    )}
                    {record.status === 'RESOLVED' && <span style={{ color: '#bfbfbf', italic: true }}>Nút đã khóa</span>}
                </Space>
            )
        }
    ];

    return (
        <div>
            <Title level={4} style={{ marginBottom: 20 }}><ToolOutlined /> DANH SÁCH SỰ CỐ & SỬA CHỮA HẠ TẦNG</Title>
            <Table dataSource={issues} columns={columns} loading={loading} bordered />
        </div>
    );
};

export default AdminIssues;