import React, { useState, useEffect } from 'react';
import {
    Card, Form, Input, Button, Typography, message,
    Tabs, Spin, Avatar, Divider, Result, Upload
} from 'antd';
import {
    UserOutlined, PhoneOutlined, IdcardOutlined,
    HomeOutlined, SaveOutlined, LockOutlined,
    SafetyCertificateOutlined, CheckCircleOutlined,
    EditOutlined, MailOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const TenantProfile = () => {
    const [profileForm]  = Form.useForm();
    const [passwordForm] = Form.useForm();

    const [loadingProfile,  setLoadingProfile]  = useState(true);
    const [savingProfile,   setSavingProfile]   = useState(false);
    const [savingPassword,  setSavingPassword]  = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const [avatarUrl,       setAvatarUrl]       = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Tải thông tin hồ sơ khi mount — bao gồm email
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/tenant/profile/${user.id}`);
                profileForm.setFieldsValue({
                    full_name: res.data.full_name,
                    username:  res.data.username,
                    email:     res.data.email,       // ← field bổ sung
                    phone:     res.data.phone,
                    cccd:      res.data.cccd,
                    hometown:  res.data.hometown,
                });
                setAvatarUrl(res.data.avatar_path || null);
            } catch {
                message.error('Không thể tải thông tin hồ sơ!');
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    // Lưu thông tin cá nhân — gửi kèm email lên server
    const onSaveProfile = async (values) => {
        setSavingProfile(true);
        try {
            await axios.put(`http://localhost:5000/api/tenant/profile/${user.id}`, {
                full_name: values.full_name,
                email:     values.email,             // ← truyền email
                phone:     values.phone,
                cccd:      values.cccd,
                hometown:  values.hometown,
            });

            // Cập nhật lại full_name trong localStorage để header hiển thị đúng ngay
            const updatedUser = { ...user, full_name: values.full_name };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            message.success('Cập nhật hồ sơ thành công!');
        } catch (err) {
            message.error(err.response?.data?.error || 'Lỗi hệ thống!');
        } finally {
            setSavingProfile(false);
        }
    };

    // Đổi mật khẩu — xác minh mật khẩu cũ trước rồi mới hash mật khẩu mới
    const onChangePassword = async (values) => {
        setSavingPassword(true);
        try {
            await axios.put('http://localhost:5000/api/change-password', {
                user_id:      user.id,
                old_password: values.old_password,
                new_password: values.new_password,
            });
            setPasswordSuccess(true);
            passwordForm.resetFields();
        } catch (err) {
            message.error(err.response?.data?.error || 'Lỗi hệ thống!');
        } finally {
            setSavingPassword(false);
        }
    };

    /**
     * Upload avatar — validate dung lượng/định dạng client-side trước
     * rồi gửi multipart/form-data; server xóa ảnh cũ trước khi lưu ảnh mới.
     */
    const handleAvatarChange = async (info) => {
        const file = info.file;
        if (!file) return;

        if (!file.type?.startsWith('image/')) {
            message.error('Chỉ chấp nhận file ảnh!');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            message.error('Ảnh không được vượt quá 5MB!');
            return;
        }

        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await axios.post(
                `http://localhost:5000/api/tenant/profile/${user.id}/avatar`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setAvatarUrl(res.data.avatar_path);
            message.success('Cập nhật ảnh đại diện thành công!');
        } catch (err) {
            message.error(err.response?.data?.error || 'Lỗi tải ảnh lên!');
        } finally {
            setAvatarUploading(false);
        }
    };

    if (loadingProfile) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <Spin size="large" />
            </div>
        );
    }

    // ── Tab 1: Thông tin cá nhân ──
    const renderProfileTab = () => (
        <Form form={profileForm} layout="vertical" onFinish={onSaveProfile} size="large">

            {/* Tên đăng nhập — chỉ đọc */}
            <Form.Item
                name="username"
                label={<Text strong>Tên đăng nhập</Text>}
            >
                <Input prefix={<UserOutlined />} disabled />
            </Form.Item>

            {/* Họ và tên */}
            <Form.Item
                name="full_name"
                label={<Text strong>Họ và tên</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            {/* Email — có thể chỉnh sửa, dùng để khôi phục mật khẩu */}
            <Form.Item
                name="email"
                label={<Text strong>Email</Text>}
                rules={[
                    { type: 'email', message: 'Email không đúng định dạng!' },
                ]}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="example@email.com (dùng để khôi phục mật khẩu)"
                />
            </Form.Item>

            {/* Số điện thoại */}
            <Form.Item
                name="phone"
                label={<Text strong>Số điện thoại</Text>}
                rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ!' },
                ]}
            >
                <Input prefix={<PhoneOutlined />} placeholder="090xxxxxxx" />
            </Form.Item>

            {/* Số CCCD */}
            <Form.Item
                name="cccd"
                label={<Text strong>Số CCCD / CMND</Text>}
                rules={[
                    { pattern: /^[0-9]{9,12}$/, message: 'Số CCCD không hợp lệ (9–12 chữ số)!' },
                ]}
            >
                <Input prefix={<IdcardOutlined />} placeholder="001xxxxxxxxx" />
            </Form.Item>

            {/* Địa chỉ / Quê quán */}
            <Form.Item
                name="hometown"
                label={<Text strong>Địa chỉ / Quê quán</Text>}
            >
                <Input prefix={<HomeOutlined />} placeholder="Thành phố, Tỉnh" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={savingProfile}
                    icon={<SaveOutlined />}
                >
                    Lưu thông tin
                </Button>
            </Form.Item>
        </Form>
    );

    // ── Tab 2: Đổi mật khẩu ──
    const renderPasswordTab = () => {
        if (passwordSuccess) {
            return (
                <Result
                    icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    title="Đổi mật khẩu thành công!"
                    subTitle="Vui lòng dùng mật khẩu mới cho lần đăng nhập tiếp theo."
                    extra={
                        <Button type="primary" onClick={() => setPasswordSuccess(false)}>
                            Đổi lần khác
                        </Button>
                    }
                />
            );
        }

        return (
            <Form form={passwordForm} layout="vertical" onFinish={onChangePassword} size="large">
                <Form.Item
                    name="old_password"
                    label={<Text strong>Mật khẩu hiện tại</Text>}
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu đang dùng" />
                </Form.Item>

                <Form.Item
                    name="new_password"
                    label={<Text strong>Mật khẩu mới</Text>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
                </Form.Item>

                <Form.Item
                    name="confirm_password"
                    label={<Text strong>Xác nhận mật khẩu mới</Text>}
                    dependencies={['new_password']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('new_password') === value)
                                    return Promise.resolve();
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={savingPassword}
                        icon={<SafetyCertificateOutlined />}
                    >
                        Cập nhật mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        );
    };

    return (
        <div style={{ maxWidth: 520, margin: '20px auto' }}>
            <Card
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(108,99,255,0.08)' }}
            >
                {/* Avatar — bấm vào để đổi ảnh */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={avatarUploading}
                    >
                        <div style={{
                            position: 'relative',
                            display: 'inline-block',
                            cursor: 'pointer',
                        }}>
                            <Avatar
                                size={72}
                                src={avatarUrl ? `http://localhost:5000${avatarUrl}` : undefined}
                                icon={!avatarUrl && <UserOutlined />}
                                style={{
                                    background: 'linear-gradient(135deg, #6C63FF, #06B6D4)',
                                    marginBottom: 12,
                                }}
                            />
                            {/* Nút edit nhỏ góc dưới phải avatar */}
                            <div style={{
                                position: 'absolute', bottom: 8, right: -4,
                                background: '#6C63FF',
                                borderRadius: '50%',
                                width: 24, height: 24,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 6px rgba(108,99,255,0.4)',
                            }}>
                                <EditOutlined style={{ color: '#fff', fontSize: 12 }} />
                            </div>
                        </div>
                    </Upload>

                    {avatarUploading && (
                        <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Đang tải ảnh lên...</Text>
                        </div>
                    )}

                    <Title level={4} style={{ margin: '8px 0 0', color: '#1E1B4B' }}>
                        {user.full_name}
                    </Title>
                    <Text type="secondary">@{user.username}</Text>
                </div>

                <Divider style={{ margin: '0 0 24px' }} />

                <Tabs
                    defaultActiveKey="info"
                    type="card"
                    size="middle"
                    items={[
                        {
                            key: 'info',
                            label: <span><UserOutlined /> Thông tin cá nhân</span>,
                            children: renderProfileTab(),
                        },
                        {
                            key: 'password',
                            label: <span><LockOutlined /> Đổi mật khẩu</span>,
                            children: renderPasswordTab(),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default TenantProfile;