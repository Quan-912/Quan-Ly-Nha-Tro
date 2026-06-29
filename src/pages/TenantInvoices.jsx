import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, Spin, message, Button } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import jsPDF from 'jspdf';

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

    // Xuất PDF hóa đơn — dùng chung logic với phía Admin, chỉ khác nguồn dữ liệu record
    const handleExportPDF = async (record) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/invoices/${record.invoice_id}/details`);
            const { room_rent, details } = res.data;

            const doc = new jsPDF();
            const removeAccents = (str) => str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D');

            const pageW = doc.internal.pageSize.getWidth();

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('HOA DON TIEN PHONG', pageW / 2, 20, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Phong: ${record.room_number}`, 14, 35);
            doc.text(`Ky thanh toan: Thang ${record.billing_month}`, 14, 42);
            doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 49);
            doc.text(`Trang thai: ${record.status === 'PAID' ? 'Da dong tien' : 'Con no tien phong'}`, 14, 56);

            doc.setLineWidth(0.5);
            doc.line(14, 60, pageW - 14, 60);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Dich vu',       14,  70);
            doc.text('Chi so cu',     80,  70, { align: 'right' });
            doc.text('Chi so moi',   115,  70, { align: 'right' });
            doc.text('Tieu thu',     145,  70, { align: 'right' });
            doc.text('Thanh tien',   195,  70, { align: 'right' });
            doc.line(14, 73, pageW - 14, 73);

            doc.setFont('helvetica', 'normal');
            let y = 81;

            doc.text('Tien phong co dinh', 14, y);
            doc.text('-', 80, y, { align: 'right' });
            doc.text('-', 115, y, { align: 'right' });
            doc.text('1 thang', 145, y, { align: 'right' });
            doc.text(`${parseInt(room_rent).toLocaleString()} d`, 195, y, { align: 'right' });
            y += 9;

            details.forEach(d => {
                doc.text(removeAccents(d.service_name),  14,  y);
                doc.text(String(d.old_index ?? 0),        80,  y, { align: 'right' });
                doc.text(String(d.new_index ?? 0),       115,  y, { align: 'right' });
                doc.text(`${d.quantity} ${removeAccents(d.unit)}`, 145, y, { align: 'right' });
                doc.text(`${parseInt(d.sub_total).toLocaleString()} d`, 195, y, { align: 'right' });
                y += 9;
            });

            doc.line(14, y, pageW - 14, y);
            y += 8;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('TONG CONG:', 120, y);
            doc.text(`${parseInt(record.total_amount).toLocaleString()} d`, 195, y, { align: 'right' });

            y += 16;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.text('He thong quan ly nha tro - Pham Van The Quan', pageW / 2, y, { align: 'center' });

            doc.save(`HoaDon_Phong${record.room_number}_Thang${record.billing_month}.pdf`);
        } catch (err) {
            message.error('Không thể tải hóa đơn PDF!');
        }
    };

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
        },
        {
            title: 'Hóa đơn PDF',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportPDF(record)}
                >
                    Tải về
                </Button>
            )
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