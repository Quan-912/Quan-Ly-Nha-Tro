import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, message, Card, Typography } from 'antd';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchServices = async () => {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
    };

    useEffect(() => { fetchServices(); }, []);

    const handleUpdatePrice = async (id, newPrice) => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/services/${id}`, { unit_price: newPrice });
            message.success("Đã cập nhật đơn giá mới!");
            fetchServices();
        } catch (err) {
            message.error("Lỗi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Tên dịch vụ', dataIndex: 'service_name', key: 'service_name' },
        {
            title: 'Đơn giá (VNĐ)',
            dataIndex: 'unit_price',
            render: (text, record) => (
                <InputNumber
                    defaultValue={text}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onBlur={(e) => handleUpdatePrice(record.key, e.target.value.replace(/,/g, ''))}
                    style={{ width: 150 }}
                />
            )
        },
        { title: 'Đơn vị tính', dataIndex: 'unit', key: 'unit' },
        {
            title: 'Thao tác',
            render: () => <Button type="link" icon={<SaveOutlined />}>Lưu</Button>
        }
    ];

    return (
        <Card>
            <Title level={3}><SettingOutlined /> Cấu hình đơn giá dịch vụ</Title>
            <p style={{ color: 'gray' }}>* Thay đổi đơn giá bên dưới sẽ áp dụng cho các hóa đơn tạo từ tháng này.</p>
            <Table
                dataSource={services}
                columns={columns}
                pagination={false}
                loading={loading}
            />
        </Card>
    );
};

export default Services;