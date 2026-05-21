const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Thêm thư viện mã hóa mật khẩu
const saltRounds = 10;           // Độ phức tạp của bản băm

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Thay bằng user của bạn nếu khác
    password: '',      // Thay bằng mật khẩu MySQL của bạn
    database: 'quanlynhatro_db'
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL: ' + err.stack);
        return;
    }
    console.log('Đã kết nối MySQL thành công!');
});

// ============================================================
// 1. API HỆ THỐNG (Đăng nhập & Bảo mật)
// ============================================================

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Lấy thông tin user dựa trên username
    const sql = `
        SELECT u.user_id, u.username, u.password_hash, u.role, u.full_name, t.tenant_id 
        FROM Users u
        LEFT JOIN Tenants t ON u.user_id = t.user_id
        WHERE u.username = ?
    `;

    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
            const user = result[0];

            // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
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
                return res.status(401).json({ error: "Sai mật khẩu!" });
            }
        } else {
            return res.status(401).json({ error: "Tài khoản không tồn tại!" });
        }
    });
});

// ============================================================
// 2. QUẢN LÝ PHÒNG (Rooms)
// ============================================================

app.get('/api/rooms', (req, res) => {
    const sql = "SELECT room_id, room_id as 'key', room_number, room_type, base_price, status FROM Rooms";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/rooms', (req, res) => {
    const { room_number, room_type, base_price, status } = req.body;
    const sql = "INSERT INTO Rooms (room_number, room_type, base_price, status) VALUES (?, ?, ?, ?)";
    db.query(sql, [room_number, room_type, base_price, status || 'AVAILABLE'], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Thêm thành công!", id: data.insertId });
    });
});

app.put('/api/rooms/:id', (req, res) => {
    const { room_number, room_type, base_price, status } = req.body;
    const sql = "UPDATE Rooms SET room_number = ?, room_type = ?, base_price = ?, status = ? WHERE room_id = ?";
    db.query(sql, [room_number, room_type, base_price, status, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Cập nhật thành công!" });
    });
});

app.delete('/api/rooms/:id', (req, res) => {
    const sql = "DELETE FROM Rooms WHERE room_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Phòng đang có hợp đồng, không thể xóa!" });
        return res.json({ message: "Xóa thành công!" });
    });
});

// ============================================================
// 3. QUẢN LÝ KHÁCH THUÊ (Tenants)
// ============================================================

app.get('/api/tenants', (req, res) => {
    const sql = `
        SELECT t.tenant_id, t.tenant_id as 'key', u.full_name, u.username, t.phone, t.cccd, t.hometown
        FROM Tenants t
        JOIN Users u ON t.user_id = u.user_id
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/tenants', async (req, res) => {
    const { username, password, full_name, phone, cccd, hometown } = req.body;

    try {
        // Mã hóa mật khẩu trước khi lưu vào DB
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sqlUser = "INSERT INTO Users (username, password_hash, role, full_name) VALUES (?, ?, 'TENANT', ?)";
        db.query(sqlUser, [username, hashedPassword, full_name], (err, result) => {
            if (err) return res.status(500).json(err);

            const userId = result.insertId;
            const sqlTenant = "INSERT INTO Tenants (user_id, phone, cccd, hometown) VALUES (?, ?, ?, ?)";
            db.query(sqlTenant, [userId, phone, cccd, hometown], (err2) => {
                if (err2) return res.status(500).json(err2);
                return res.json("Thêm khách thuê và bảo mật mật khẩu thành công!");
            });
        });
    } catch (e) {
        res.status(500).json("Lỗi mã hóa dữ liệu");
    }
});

// ============================================================
// 4. QUẢN LÝ HỢP ĐỒNG (Contracts)
// ============================================================

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

app.post('/api/contracts', (req, res) => {
    const { room_id, tenant_id, start_date, end_date, deposit_amount } = req.body;
    const sql = "INSERT INTO Contracts (room_id, tenant_id, start_date, end_date, deposit_amount, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')";

    db.query(sql, [room_id, tenant_id, start_date, end_date, deposit_amount], (err, result) => {
        if (err) return res.status(500).json(err);
        const updateRoomSql = "UPDATE Rooms SET status = 'OCCUPIED' WHERE room_id = ?";
        db.query(updateRoomSql, [room_id]);
        return res.json("Tạo hợp đồng thành công!");
    });
});

app.delete('/api/contracts/:id', (req, res) => {
    const contractId = req.params.id;
    db.query("SELECT room_id FROM Contracts WHERE contract_id = ?", [contractId], (err, result) => {
        if (err || result.length === 0) return res.status(404).json("Hợp đồng không tồn tại");
        const roomId = result[0].room_id;
        db.query("DELETE FROM Contracts WHERE contract_id = ?", [contractId], (err2) => {
            if (err2) return res.status(500).json(err2);
            db.query("UPDATE Rooms SET status = 'AVAILABLE' WHERE room_id = ?", [roomId], (err3) => {
                return res.json("Xóa thành công!");
            });
        });
    });
});

// ============================================================
// 5. QUẢN LÝ DỊCH VỤ & HÓA ĐƠN (Invoices)
// ============================================================

app.get('/api/services', (req, res) => {
    const sql = "SELECT service_id as 'key', service_name, unit_price, unit FROM Services";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.put('/api/services/:id', (req, res) => {
    const { unit_price } = req.body;
    const sql = "UPDATE Services SET unit_price = ? WHERE service_id = ?";
    db.query(sql, [unit_price, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json("Cập nhật đơn giá thành công!");
    });
});

app.post('/api/invoices', (req, res) => {
    const { room_id, billing_month, services } = req.body;
    const total_amount = services.reduce((sum, s) => sum + s.sub_total, 0);
    const sqlInvoice = "INSERT INTO Invoices (room_id, billing_month, total_amount, status) VALUES (?, ?, ?, 'UNPAID')";
    db.query(sqlInvoice, [room_id, billing_month, total_amount], (err, result) => {
        if (err) return res.status(500).json(err);
        const invoiceId = result.insertId;
        const detailValues = services.map(s => [invoiceId, s.service_id, s.old_index, s.new_index, s.quantity, s.sub_total]);
        const sqlDetails = "INSERT INTO Invoice_Details (invoice_id, service_id, old_index, new_index, quantity, sub_total) VALUES ?";
        db.query(sqlDetails, [detailValues], (err2) => {
            if (err2) return res.status(500).json(err2);
            return res.json({ message: "Đã xuất hóa đơn!", invoiceId });
        });
    });
});

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

app.put('/api/invoices/:id/pay', (req, res) => {
    const sql = "UPDATE Invoices SET status = 'PAID' WHERE invoice_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json("Đã thanh toán hóa đơn!");
    });
});

// ============================================================
// 6. DASHBOARD DÀNH CHO KHÁCH THUÊ (Tenant Portal)
// ============================================================

app.get('/api/tenant/room-info/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT r.room_number, r.room_type, r.base_price, c.start_date, c.deposit_amount, c.status as contract_status
        FROM Users u 
        JOIN Tenants t ON u.user_id = t.user_id
        JOIN Contracts c ON t.tenant_id = c.tenant_id
        JOIN Rooms r ON c.room_id = r.room_id
        WHERE u.user_id = ? AND c.status = 'ACTIVE'
        LIMIT 1`;

    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
        if (result.length === 0) return res.status(404).json({ message: "Chưa có hợp đồng hoạt động." });
        res.json(result[0]);
    });
});

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Backend đang chạy tại http://localhost:${PORT}`);
});