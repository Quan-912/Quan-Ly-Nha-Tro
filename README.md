# Hệ Thống Quản Lý Phòng Cho Thuê - Phạm Văn Thế Quân

## Công nghệ sử dụng
- **Frontend:** ReactJS, Ant Design, Axios
- **Backend:** NodeJS, Express, MySQL

## Hướng dẫn cài đặt
1. Import file `QuanLyNhatro.sql` vào MySQL.
2. Vào thư mục backend: `npm install` -> `node server.js`.
3. Vào thư mục frontend: `npm install` -> `npm start`.

## Tính năng nổi bật
- Bảo mật mật khẩu bằng thuật toán **Bcrypt**.
- Phân quyền người dùng: **Admin** (Quản lý) và **Tenant** (Khách thuê).
- Quản lý hóa đơn, hợp đồng và dịch vụ điện nước.
