import React, { useState, useEffect } from 'react';
import {
    Table, Button, Tag, Modal, Form, InputNumber, Select, message,
    Space, Typography, Divider, Popconfirm, Row, Col, Badge
} from 'antd';
import { CalculatorOutlined, PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import jsPDF from 'jspdf';

const { Text, Title } = Typography;

const Invoices = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [services, setServices] = useState([]);
    const [currentOldValues, setCurrentOldValues] = useState({});
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            const [resInvoices, resRooms, resServices] = await Promise.all([
                axios.get('http://localhost:5000/api/invoices'),
                axios.get('http://localhost:5000/api/rooms'),
                axios.get('http://localhost:5000/api/services')
            ]);
            setDataSource(resInvoices.data);
            setRooms(resRooms.data.filter(r => r.status === 'OCCUPIED' || r.status === 'Đã thuê'));
            setServices(resServices.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateInvoice = async (values) => {
        try {
            const invoiceDetails = services.map(s => {
                const oldIdx = values[`old_${s.key}`] || 0;
                const newIdx = values[`new_${s.key}`] || 0;
                const qty = newIdx - oldIdx;
                return {
                    service_id: s.key,
                    old_index: oldIdx,
                    new_index: newIdx,
                    quantity: qty,
                    sub_total: qty * s.unit_price
                };
            });
            await axios.post('http://localhost:5000/api/invoices', {
                room_id: values.room_id,
                billing_month: values.month,
                services: invoiceDetails
            });
            message.success('Đã tạo hóa đơn!');
            setIsModalOpen(false);
            form.resetFields();
            setCurrentOldValues({});
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.error || 'Lỗi khi tạo hóa đơn!');
        }
    };

    const handlePayment = async (invoiceId) => {
        try {
            await axios.put(`http://localhost:5000/api/invoices/${invoiceId}/pay`);
            message.success('Xác nhận thanh toán thành công!');
            fetchData();
        } catch (error) {
            message.error('Lỗi cập nhật!');
        }
    };

    const handleRoomChange = async (roomId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/last-index/${roomId}`);
            const oldIndices = {};
            const oldValuesMap = {};
            res.data.forEach(item => {
                oldIndices[`old_${item.service_id}`] = item.new_index;
                oldValuesMap[item.service_id] = item.new_index;
            });
            form.setFieldsValue(oldIndices);
            setCurrentOldValues(oldValuesMap);
            services.forEach(s => {
                const newVal = form.getFieldValue(`new_${s.key}`);
                if (newVal !== undefined && newVal !== null) form.validateFields([`new_${s.key}`]);
            });
        } catch (err) {
            console.error("Không lấy được số cũ:", err);
        }
    };

    /**
     * Xuất PDF hóa đơn bằng jsPDF.
     * Tải chi tiết từng dòng dịch vụ từ API, sau đó vẽ bảng PDF thủ công.
     * Dùng font mặc định (latin) nên các ký tự tiếng Việt được chuyển sang
     * dạng không dấu để tránh lỗi encoding.
     */
    const handleExportPDF = async (record) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/invoices/${record.key || record.invoice_id}/details`);
            const details = res.data;

            const doc = new jsPDF();

            // Hàm loại bỏ dấu tiếng Việt vì jsPDF font mặc định không hỗ trợ Unicode
            const removeAccents = (str) => str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D');

            const pageW = doc.internal.pageSize.getWidth();

            // --- Header ---
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('HOA DON TIEN PHONG', pageW / 2, 20, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Phong: ${record.room_number}`, 14, 35);
            doc.text(`Ky thanh toan: ${record.billing_month}`, 14, 42);
            doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 49);
            doc.text(
                `Trang thai: ${record.status === 'PAID' ? 'Da thanh toan' : 'Chua thanh toan'}`,
                14, 56
            );

            // --- Đường kẻ ngang ---
            doc.setLineWidth(0.5);
            doc.line(14, 60, pageW - 14, 60);

            // --- Tiêu đề bảng ---
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Dich vu',       14,  70);
            doc.text('Chi so cu',     80,  70, { align: 'right' });
            doc.text('Chi so moi',   115,  70, { align: 'right' });
            doc.text('Tieu thu',     145,  70, { align: 'right' });
            doc.text('Thanh tien',   195,  70, { align: 'right' });
            doc.line(14, 73, pageW - 14, 73);

            // --- Dữ liệu từng dòng ---
            doc.setFont('helvetica', 'normal');
            let y = 81;
            details.forEach(d => {
                doc.text(removeAccents(d.service_name),  14,  y);
                doc.text(String(d.old_index ?? 0),        80,  y, { align: 'right' });
                doc.text(String(d.new_index ?? 0),       115,  y, { align: 'right' });
                doc.text(`${d.quantity} ${removeAccents(d.unit)}`, 145, y, { align: 'right' });
                doc.text(`${parseInt(d.sub_total).toLocaleString()} d`, 195, y, { align: 'right' });
                y += 9;
            });

            // --- Tổng cộng ---
            doc.line(14, y, pageW - 14, y);
            y += 8;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('TONG CONG:', 120, y);
            doc.text(`${parseInt(record.total_amount).toLocaleString()} d`, 195, y, { align: 'right' });

            // --- Footer ---
            y += 16;
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.text('He thong quan ly nha tro - Pham Van The Quan', pageW / 2, y, { align: 'center' });

            doc.save(`HoaDon_Phong${record.room_number}_${record.billing_month?.replace('/', '-')}.pdf`);
        } catch (err) {
            message.error('Không thể xuất PDF!');
        }
    };

    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'room_number',
            key: 'room_number',
            width: 100,
            render: (text) => <Tag color="blue" style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>{text}</Tag>
        },
        {
            title: 'Tháng',
            dataIndex: 'billing_month',
            key: 'billing_month',
            width: 110,
            render: (text) => <Text style={{ fontSize: '14px' }}>{text}</Text>
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            render: (val) => (
                <Text strong style={{ color: '#d4380d', fontSize: '15px' }}>
                    {parseInt(val).toLocaleString()} đ
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 160,
            render: (status) => (
                <Badge
                    status={status === 'PAID' ? 'success' : 'warning'}
                    text={<Text style={{ fontSize: '14px' }}>{status === 'PAID' ? 'Đã xong' : 'Chưa thu'}</Text>}
                />
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'UNPAID' && (
                        <Popconfirm title="Xác nhận đã thu tiền?" onConfirm={() => handlePayment(record.key || record.invoice_id)}>
                            <Button type="text" size="middle" icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />} />
                        </Popconfirm>
                    )}
                    {/* Nút xuất PDF — luôn hiển thị cho mọi hóa đơn */}
                    <Button
                        type="text"
                        size="middle"
                        icon={<PrinterOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
                        title="Xuất PDF"
                        onClick={() => handleExportPDF(record)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, fontSize: '20px' }}>QUẢN LÝ HÓA ĐƠN & THU TIỀN</Title>
                <Button type="primary" size="middle" danger icon={<CalculatorOutlined />} onClick={() => setIsModalOpen(true)}>
                    Lập hóa đơn
                </Button>
            </div>

            <Table columns={columns} dataSource={dataSource} size="middle" pagination={{ pageSize: 8 }} bordered />

            <Modal
                title={<Text strong style={{ fontSize: '18px' }}>Lập hóa đơn mới</Text>}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); setCurrentOldValues({}); }}
                width={550}
                okText="Tạo hóa đơn"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateInvoice} size="middle">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="room_id" label={<Text strong>Phòng</Text>} rules={[{ required: true }]}>
                                <Select placeholder="Chọn" onChange={handleRoomChange}>
                                    {rooms.map(r => <Select.Option key={r.key} value={r.key}>{r.room_number}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="month" label={<Text strong>Kỳ thanh toán</Text>} initialValue="06/2026">
                                <Select>
                                    {['06','07','08','09','10','11','12'].map(m => (
                                        <Select.Option key={m} value={`${m}/2026`}>Tháng {m}/2026</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '15px 0' }}><Text type="secondary">Chỉ số điện nước</Text></Divider>

                    {services.map(s => (
                        <div key={s.key} style={{ background: '#fafafa', padding: '12px', borderRadius: 6, marginBottom: 10, border: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text strong style={{ fontSize: '14px' }}>{s.service_name}</Text>
                                <Text type="secondary" style={{ fontSize: '13px' }}>{parseInt(s.unit_price).toLocaleString()}đ/{s.unit}</Text>
                            </div>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name={`old_${s.key}`} label="Số cũ" initialValue={0} style={{ marginBottom: 0 }}>
                                        <InputNumber style={{ width: '100%' }} min={0} disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={`new_${s.key}`}
                                        label="Số mới"
                                        style={{ marginBottom: 0 }}
                                        rules={[
                                            { required: true, message: 'Nhập số mới!' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    const oldVal = getFieldValue(`old_${s.key}`) || 0;
                                                    if (value === undefined || value === null) return Promise.resolve();
                                                    if (value < oldVal) return Promise.reject(new Error(`Số mới phải ≥ số cũ (${oldVal})`));
                                                    return Promise.resolve();
                                                }
                                            })
                                        ]}
                                    >
                                        <InputNumber style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}
                </Form>
            </Modal>
        </div>
    );
};

export default Invoices;