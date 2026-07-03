# 🏠 Smart House — Hệ thống quản lý phòng cho thuê

Ứng dụng web quản lý nhà trọ và chung cư mini, hỗ trợ hai nhóm người dùng:
**Admin (chủ cơ sở)** và **Tenant (khách thuê)**, với đầy đủ quy trình từ
đặt phòng, ký hợp đồng, xuất hóa đơn đến xử lý sự cố.

---

## 🛠 Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| Frontend | ReactJS, Ant Design, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Khác | bcrypt, Nodemailer, jsPDF |

---

## ⚙️ Yêu cầu môi trường

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

---

## 🚀 Hướng dẫn cài đặt

1. Chạy backend:
   cd backend
   npm install
   node server.js
2. Chạy frontend:
   cd frontend
   npm install
   npm start

## ✨ Tính năng chính

**Phân hệ Admin:**
- Dashboard thống kê doanh thu, tỉ lệ phòng trống/đã thuê
- Quản lý phòng: thêm, sửa, xóa, upload ảnh phòng
- Duyệt/từ chối yêu cầu đặt phòng kèm lý do
- Lập, gia hạn và thanh lý hợp đồng
- Xuất hóa đơn PDF theo chỉ số điện/nước thực tế
- Quản lý và cập nhật tiến độ xử lý sự cố

**Phân hệ Tenant (Khách thuê):**
- Xem danh sách phòng trống, lọc theo giá/loại phòng
- Gửi yêu cầu đặt phòng và theo dõi trạng thái xét duyệt
- Xem chi tiết hóa đơn hàng tháng, tải PDF
- Báo cáo sự cố và theo dõi tiến độ sửa chữa
- Cập nhật hồ sơ cá nhân, đổi mật khẩu
- Khôi phục mật khẩu tự động qua email

**Bảo mật:**
- Mã hóa mật khẩu một chiều bằng bcrypt (cost factor 10)
- Phân quyền RBAC kiểm tra server-side, chống giả mạo role từ client

---
## 👨‍💻 Tác giả

Phạm Văn Thế Quân — Đồ án tốt nghiệp 2026
