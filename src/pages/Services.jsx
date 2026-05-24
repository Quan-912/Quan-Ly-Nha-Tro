import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message, Typography, Space } from 'antd';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchServices = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/services');
            setServices(res.data);
        } catch (err) {
            message.error("Lỗi tải dữ liệu");
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleUpdatePrice = async (id, newPrice) => {
        if (!newPrice) return;
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/services/${id}`, { unit_price: newPrice });
            message.success("Đã cập nhật đơn giá!");
            fetchServices();
        } catch (err) {
            message.error("Lỗi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tên dịch vụ',
            dataIndex: 'service_name',
            key: 'service_name',
            render: (text) => <Text strong style={{ fontSize: '16px' }}>{text}</Text>
        },
        {
            title: 'Đơn giá (VNĐ)',
            dataIndex: 'unit_price',
            width: 250, // Mở rộng chiều rộng để Input to hơn
            render: (text, record) => (
                <InputNumber
                    size="middle" // Tăng từ small lên middle để ô nhập to rõ
                    defaultValue={text}
                    addonAfter={<Text strong>đ</Text>}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\đ\s?|(,*)/g, '')}
                    onBlur={(e) => handleUpdatePrice(record.key || record.service_id, e.target.value.replace(/,/g, ''))}
                    style={{ width: '100%', fontSize: '16px', fontWeight: 'bold' }} // Chữ trong ô nhập to 16px
                />
            )
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            align: 'center',
            width: 120,
            render: (unit) => <Text style={{ fontSize: '15px' }}>{unit}</Text>
        },
        {
            title: 'Thao tác',
            align: 'center',
            width: 100,
            render: () => (
                <Button
                    type="text"
                    size="middle"
                    icon={<SaveOutlined style={{ color: '#52c41a', fontSize: '20px' }} />}
                >
                    <Text style={{ color: '#52c41a' }}>Lưu</Text>
                </Button>
            )
        }
    ];

    return (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="middle">
                    <SettingOutlined style={{ fontSize: '22px', color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0, letterSpacing: '0.5px' }}>CẤU HÌNH ĐƠN GIÁ DỊCH VỤ</Title>
                </Space>
                <Tag color="blue" style={{ fontSize: '13px', padding: '2px 10px' }}>
                    Áp dụng cho hóa đơn mới
                </Tag>
            </div>

            <Table
                dataSource={services}
                columns={columns}
                pagination={false}
                loading={loading}
                size="middle" // Dùng middle thay cho small để cân bằng giữa nén và to rõ
                bordered
                rowKey={(record) => record.key || record.service_id}
            />

            <div style={{ marginTop: 16 }}>
                <Text type="secondary" italic style={{ fontSize: '14px' }}>
                    * Lưu ý: Khi thay đổi đơn giá, hệ thống sẽ tự động lưu khi bạn nhấn chuột ra ngoài ô nhập (onBlur).
                </Text>
            </div>
        </div>
    );
};

export default Services;