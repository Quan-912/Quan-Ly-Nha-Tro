const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình kết nối MySQL (Thay đổi thông số theo máy của bạn)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Thường là root
    password: '',      // Mật khẩu MySQL của bạn
    database: 'quanlynhatro_db' // Tên database bạn đã tạo
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL: ' + err.stack);
        return;
    }
    console.log('Đã kết nối MySQL thành công!');
});

// ==========================================
// THÊM MỚI: API Đăng nhập hệ thống
// ==========================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const sql = `
        SELECT u.user_id, u.username, u.role, u.full_name, t.tenant_id 
        FROM Users u
        LEFT JOIN Tenants t ON u.user_id = t.user_id
        WHERE u.username = ? AND u.password_hash = ?
    `;

    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
            const user = result[0];
            return res.json({
                message: "Đăng nhập thành công!",
                user: {
                    id: user.user_id,
                    username: user.username,
                    role: user.role,
                    full_name: user.full_name,
                    tenant_id: user.tenant_id
                }
            });
        } else {
            return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu!" });
        }
    });
});

// API: Lấy danh sách phòng
app.get('/api/rooms', (req, res) => {
    const sql = "SELECT room_id as 'key', room_number, room_type, base_price, status FROM Rooms";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API: Thêm phòng mới
app.post('/api/rooms', (req, res) => {
    const { room_number, room_type, base_price, status } = req.body;
    const sql = "INSERT INTO Rooms (room_number, room_type, base_price, status) VALUES (?, ?, ?, ?)";
    db.query(sql, [room_number, room_type, base_price, status || 'AVAILABLE'], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Thêm thành công!", id: data.insertId });
    });
});

// API: Cập nhật phòng
app.put('/api/rooms/:id', (req, res) => {
    const { room_number, room_type, base_price, status } = req.body;
    const sql = "UPDATE Rooms SET room_number = ?, room_type = ?, base_price = ?, status = ? WHERE room_id = ?";
    db.query(sql, [room_number, room_type, base_price, status, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Cập nhật thành công!" });
    });
});

// API: Xóa phòng
app.delete('/api/rooms/:id', (req, res) => {
    const sql = "DELETE FROM Rooms WHERE room_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Phòng đang có hợp đồng, không thể xóa!" });
        return res.json({ message: "Xóa thành công!" });
    });
});

// API: Lấy danh sách khách thuê
app.get('/api/tenants', (req, res) => {
    const sql = `
        SELECT t.tenant_id as 'key', u.full_name, u.username, t.phone, t.cccd, t.hometown
        FROM Tenants t
                 JOIN Users u ON t.user_id = u.user_id
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API: Thêm khách thuê mới (Cần tạo User trước rồi mới tạo Tenant)
app.post('/api/tenants', async (req, res) => {
    const { username, password, full_name, phone, cccd, hometown } = req.body;

    // 1. Tạo tài khoản User
    const sqlUser = "INSERT INTO Users (username, password_hash, role, full_name) VALUES (?, ?, 'TENANT', ?)";
    db.query(sqlUser, [username, password, full_name], (err, result) => {
        if (err) return res.status(500).json(err);

        const userId = result.insertId;
        // 2. Tạo hồ sơ Tenant
        const sqlTenant = "INSERT INTO Tenants (user_id, phone, cccd, hometown) VALUES (?, ?, ?, ?)";
        db.query(sqlTenant, [userId, phone, cccd, hometown], (err2) => {
            if (err2) return res.status(500).json(err2);
            return res.json("Thêm khách thuê thành công!");
        });
    });
});

// API: Lấy danh sách hợp đồng (Join với Rooms và Tenants để lấy tên)
app.get('/api/contracts', (req, res) => {
    const sql = `
        SELECT c.contract_id as 'key', r.room_number, u.full_name,
               c.start_date, c.end_date, c.deposit_amount, c.status
        FROM Contracts c
                 JOIN Rooms r ON c.room_id = r.room_id
                 JOIN Tenants t ON c.tenant_id = t.tenant_id
                 JOIN Users u ON t.user_id = u.user_id
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API: Tạo hợp đồng mới
app.post('/api/contracts', (req, res) => {
    const { room_id, tenant_id, start_date, end_date, deposit_amount } = req.body;
    const sql = "INSERT INTO Contracts (room_id, tenant_id, start_date, end_date, deposit_amount, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')";

    db.query(sql, [room_id, tenant_id, start_date, end_date, deposit_amount], (err, result) => {
        if (err) return res.status(500).json(err);

        // Sau khi tạo hợp đồng, tự động cập nhật trạng thái phòng sang 'OCCUPIED'
        const updateRoomSql = "UPDATE Rooms SET status = 'OCCUPIED' WHERE room_id = ?";
        db.query(updateRoomSql, [room_id]);

        return res.json("Tạo hợp đồng thành công!");
    });
});

// API: Xóa hợp đồng và cập nhật lại trạng thái phòng
app.delete('/api/contracts/:id', (req, res) => {
    const contractId = req.params.id; // Đây là giá trị 'key' từ frontend gửi về

    // Lấy room_id để trả phòng về trạng thái trống
    db.query("SELECT room_id FROM Contracts WHERE contract_id = ?", [contractId], (err, result) => {
        if (err || result.length === 0) return res.status(404).json("Hợp đồng không tồn tại");

        const roomId = result[0].room_id;

        // Xóa hợp đồng (Dùng đúng contract_id)
        db.query("DELETE FROM Contracts WHERE contract_id = ?", [contractId], (err2) => {
            if (err2) return res.status(500).json(err2);

            // Cập nhật lại phòng
            db.query("UPDATE Rooms SET status = 'AVAILABLE' WHERE room_id = ?", [roomId], (err3) => {
                return res.json("Xóa thành công!");
            });
        });
    });
});

// API: Lấy danh sách dịch vụ
app.get('/api/services', (req, res) => {
    const sql = "SELECT service_id as 'key', service_name, unit_price, unit FROM Services";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API: Cập nhật đơn giá dịch vụ (ví dụ khi giá điện tăng)
app.put('/api/services/:id', (req, res) => {
    const { unit_price } = req.body;
    const sql = "UPDATE Services SET unit_price = ? WHERE service_id = ?";
    db.query(sql, [unit_price, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json("Cập nhật đơn giá thành công!");
    });
});

// API: Lấy thông tin số cũ (Chỉ số điện/nước mới nhất của tháng trước)
app.get('/api/last-index/:roomId', (req, res) => {
    const sql = `
        SELECT service_id, new_index
        FROM Invoice_Details id
                 JOIN Invoices i ON id.invoice_id = i.invoice_id
        WHERE i.room_id = ?
        ORDER BY i.created_at DESC LIMIT 2`;
    db.query(sql, [req.params.roomId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API: Tạo hóa đơn tổng hợp
app.post('/api/invoices', (req, res) => {
    const { room_id, billing_month, services } = req.body; // services là mảng chi tiết điện, nước...

    // 1. Tính tổng tiền
    const total_amount = services.reduce((sum, s) => sum + s.sub_total, 0);

    // 2. Lưu vào bảng Invoices
    const sqlInvoice = "INSERT INTO Invoices (room_id, billing_month, total_amount, status) VALUES (?, ?, ?, 'UNPAID')";
    db.query(sqlInvoice, [room_id, billing_month, total_amount], (err, result) => {
        if (err) return res.status(500).json(err);

        const invoiceId = result.insertId;
        // 3. Lưu chi tiết từng dịch vụ vào Invoice_Details
        const detailValues = services.map(s => [invoiceId, s.service_id, s.old_index, s.new_index, s.quantity, s.sub_total]);
        const sqlDetails = "INSERT INTO Invoice_Details (invoice_id, service_id, old_index, new_index, quantity, sub_total) VALUES ?";

        db.query(sqlDetails, [detailValues], (err2) => {
            if (err2) return res.status(500).json(err2);
            return res.json({ message: "Đã xuất hóa đơn!", invoiceId });
        });
    });
});

// API: Lấy danh sách hóa đơn để hiện lên bảng
app.get('/api/invoices', (req, res) => {
    const sql = `
        SELECT i.invoice_id as 'key', r.room_number, i.billing_month, i.total_amount, i.status
        FROM Invoices i
                 JOIN Rooms r ON i.room_id = r.room_id
        ORDER BY i.created_at DESC
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API: Xác nhận thanh toán (Dùng cho nút bấm sau này)
app.put('/api/invoices/:id/pay', (req, res) => {
    const sql = "UPDATE Invoices SET status = 'PAID' WHERE invoice_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json("Đã thanh toán hóa đơn!");
    });
});

// Chạy server tại cổng 5000
app.listen(5000, () => {
    console.log('Server Backend đang chạy tại http://localhost:5000');
});