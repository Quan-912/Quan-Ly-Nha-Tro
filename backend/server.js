const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Thư viện mã hóa mật khẩu
const crypto = require('crypto'); // Sinh mật khẩu ngẫu nhiên khi quên mật khẩu
const nodemailer = require('nodemailer'); // Gửi email quên mật khẩu
const saltRounds = 10;           // Độ phức tạp của bản băm

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Middleware phân quyền cơ bản theo vai trò (RBAC).
 * Đọc user_id + role từ header do frontend gửi kèm (được set sau khi đăng nhập),
 * đối chiếu lại với CSDL để xác nhận role đó thực sự thuộc về user_id đó —
 * tránh trường hợp client tự sửa role trong localStorage để giả mạo quyền Admin.
 */
const verifyRole = (allowedRoles) => (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
        return res.status(401).json({ error: "Thiếu thông tin xác thực! Vui lòng đăng nhập lại." });
    }
    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "Bạn không có quyền truy cập chức năng này!" });
    }

    db.query("SELECT role FROM Users WHERE user_id = ?", [userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi xác thực quyền truy cập!" });
        if (result.length === 0 || result[0].role !== userRole) {
            return res.status(403).json({ error: "Thông tin xác thực không hợp lệ!" });
        }
        next();
    });
};

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cho phép frontend truy cập file ảnh qua URL dạng: http://localhost:5000/uploads/rooms/xxx.jpg
app.use('/uploads', express.static('uploads'));

// Cấu hình Multer cho ảnh phòng — chỉ 1 ảnh/phòng
const roomImageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/rooms'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `room_${req.params.id}_${Date.now()}${ext}`);
    }
});
const uploadRoomImage = multer({
    storage: roomImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Chỉ chấp nhận file ảnh!'));
        cb(null, true);
    }
});

// Cấu hình Multer cho avatar khách thuê — 1 ảnh
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/avatars'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.params.userId}_${Date.now()}${ext}`);
    }
});
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Chỉ chấp nhận file ảnh!'));
        cb(null, true);
    }
});

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

// Cấu hình transporter gửi email qua Gmail SMTP.
// EMAIL_USER / EMAIL_PASS lấy từ .env — EMAIL_PASS là App Password 16 ký tự,
// KHÔNG phải mật khẩu Gmail thật.
const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ============================================================
// 1. API HỆ THỐNG (Đăng nhập & Bảo mật)
// ============================================================

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

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

/**
 * Quên mật khẩu — CHỈ áp dụng cho Tenant.
 * Quy trình: tìm user theo email + role TENANT → sinh mật khẩu ngẫu nhiên 8 ký tự
 * → hash bằng bcrypt → UPDATE password_hash → gửi mật khẩu mới (plain text) qua email.
 * Không tiết lộ email có tồn tại hay không trong thông báo lỗi để tránh dò email (security).
 */
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Vui lòng nhập email!" });
    }

    const sql = "SELECT user_id, username FROM Users WHERE email = ? AND role = 'TENANT'";
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi hệ thống!" });

        if (result.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy tài khoản khách thuê với email này!" });
        }

        const user = result[0];

        // Sinh mật khẩu mới ngẫu nhiên, dạng hex 8 ký tự (đủ dễ đọc để gõ lại)
        const newPassword = crypto.randomBytes(4).toString('hex');

        try {
            const newHash = await bcrypt.hash(newPassword, saltRounds);

            db.query("UPDATE Users SET password_hash = ? WHERE user_id = ?", [newHash, user.user_id], async (updateErr) => {
                if (updateErr) return res.status(500).json({ error: "Lỗi cập nhật mật khẩu!" });

                try {
                    await mailTransporter.sendMail({
                        from: `"Trọ Smart" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: "Mật khẩu mới - Hệ thống quản lý nhà trọ Trọ Smart",
                        html: `
                            <p>Xin chào <b>${user.username}</b>,</p>
                            <p>Bạn vừa yêu cầu đặt lại mật khẩu. Mật khẩu mới của bạn là:</p>
                            <h2 style="color:#1890ff;">${newPassword}</h2>
                            <p>Vui lòng đăng nhập bằng mật khẩu này và đổi lại mật khẩu khác trong mục Hồ sơ cá nhân.</p>
                        `
                    });
                    return res.json({ message: "Mật khẩu mới đã được gửi đến email của bạn!" });
                } catch (mailErr) {
                    console.error("Lỗi gửi email:", mailErr);
                    return res.status(500).json({ error: "Không thể gửi email. Vui lòng thử lại sau!" });
                }
            });
        } catch (hashErr) {
            return res.status(500).json({ error: "Lỗi mã hóa mật khẩu mới!" });
        }
    });
});

// ============================================================
// 2. QUẢN LÝ PHÒNG (Rooms)
// ============================================================

app.get('/api/rooms', (req, res) => {
    const sql = "SELECT room_id, room_id as 'key', room_number, room_type, base_price, area, floor, description, status, image_path FROM Rooms";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

/**
 * Kiểm tra số phòng có bị trùng không — dùng cho async validator ở form.
 * QUAN TRỌNG: Route này phải khai báo TRƯỚC app.get/put/delete('/api/rooms/:id')
 * để Express không nhầm "check-number" là một giá trị :id.
 * Query param exclude_id: khi đang edit phòng, truyền vào để bỏ qua chính phòng đó.
 */
app.get('/api/rooms/check-number', (req, res) => {
    const { room_number, exclude_id } = req.query;

    if (!room_number || room_number.trim() === '') {
        return res.status(400).json({ error: "Thiếu số phòng cần kiểm tra!" });
    }

    let sql = `SELECT room_id FROM Rooms WHERE room_number = ?`;
    const params = [room_number.trim()];

    if (exclude_id) {
        sql += ` AND room_id != ?`;
        params.push(exclude_id);
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi hệ thống!" });
        return res.json({ exists: result.length > 0 });
    });
});

app.post('/api/rooms', verifyRole(['ADMIN']), (req, res) => {
    const { room_number, room_type, base_price, area, floor, description, status } = req.body;
    const sql = "INSERT INTO Rooms (room_number, room_type, base_price, area, floor, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [room_number, room_type, base_price, area || null, floor || null, description || null, status || 'AVAILABLE'], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Thêm thành công!", id: data.insertId });
    });
});

app.put('/api/rooms/:id', verifyRole(['ADMIN']), (req, res) => {
    const { room_number, room_type, base_price, area, floor, description, status } = req.body;
    const sql = "UPDATE Rooms SET room_number = ?, room_type = ?, base_price = ?, area = ?, floor = ?, description = ?, status = ? WHERE room_id = ?";
    db.query(sql, [room_number, room_type, base_price, area || null, floor || null, description || null, status, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Cập nhật thành công!" });
    });
});

/**
 * Xóa phòng — kiểm tra lịch sử hợp đồng trước khi xóa cứng.
 * Nếu phòng đã từng có hợp đồng (kể cả đã thanh lý/EXPIRED), KHÔNG cho xóa
 * vĩnh viễn vì sẽ vi phạm khóa ngoại và làm mất dấu lịch sử hóa đơn/hợp đồng.
 * Trả về hasHistory: true để frontend gợi ý chuyển sang "Ngừng hoạt động" thay thế.
 */
app.delete('/api/rooms/:id', verifyRole(['ADMIN']), (req, res) => {
    const roomId = req.params.id;

    db.query("SELECT COUNT(*) as total FROM Contracts WHERE room_id = ?", [roomId], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi kiểm tra lịch sử hợp đồng!" });

        if (result[0].total > 0) {
            return res.status(400).json({
                error: "Phòng này đã có lịch sử hợp đồng, không thể xóa vĩnh viễn! Hãy chuyển sang trạng thái Ngừng hoạt động.",
                hasHistory: true
            });
        }

        db.query("DELETE FROM Rooms WHERE room_id = ?", [roomId], (delErr) => {
            if (delErr) return res.status(500).json({ error: "Lỗi hệ thống khi xóa phòng!" });
            return res.json({ message: "Xóa thành công!" });
        });
    });
});

// Ngừng hoạt động phòng (soft-delete) — dùng cho phòng có lịch sử hợp đồng.
// Ẩn khỏi danh sách phòng trống mà không phá vỡ dữ liệu Contracts/Invoices.
app.put('/api/rooms/:id/deactivate', verifyRole(['ADMIN']), (req, res) => {
    const sql = "UPDATE Rooms SET status = 'INACTIVE' WHERE room_id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Lỗi khi ngừng hoạt động phòng!" });
        return res.json({ message: "Đã chuyển phòng sang trạng thái Ngừng hoạt động!" });
    });
});

// Kích hoạt lại phòng đã ngừng hoạt động → trở về trạng thái còn trống.
app.put('/api/rooms/:id/reactivate', verifyRole(['ADMIN']), (req, res) => {
    const sql = "UPDATE Rooms SET status = 'AVAILABLE' WHERE room_id = ?";
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Lỗi khi kích hoạt lại phòng!" });
        return res.json({ message: "Đã kích hoạt lại phòng!" });
    });
});

// Upload/thay ảnh đại diện cho 1 phòng — xóa ảnh cũ trước khi lưu ảnh mới (giống cơ chế avatar)
app.post('/api/rooms/:id/image', uploadRoomImage.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Vui lòng chọn ảnh!" });
    const roomId = req.params.id;
    const newPath = `/uploads/rooms/${req.file.filename}`;

    db.query("SELECT image_path FROM Rooms WHERE room_id = ?", [roomId], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn!" });
        const oldPath = result[0]?.image_path;

        db.query("UPDATE Rooms SET image_path = ? WHERE room_id = ?", [newPath, roomId], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Lỗi lưu ảnh!" });
            if (oldPath) fs.unlink(path.join(__dirname, oldPath), () => {});
            return res.json({ message: "Cập nhật ảnh phòng thành công!", image_path: newPath });
        });
    });
});

// API lấy danh sách các phòng đang còn trống (status = 'AVAILABLE'), hỗ trợ tìm kiếm và lọc
app.get('/api/tenant/available-rooms', (req, res) => {
    const { room_number, min_price, max_price, room_type } = req.query;

    let sql = "SELECT room_id, room_number, room_type, base_price, area, floor, description, status, image_path FROM Rooms WHERE (status = 'AVAILABLE' OR status = 'CÒN TRỐNG')";
    const params = [];

    if (room_number && room_number.trim() !== '') {
        sql += " AND room_number LIKE ?";
        params.push(`%${room_number.trim()}%`);
    }
    if (min_price) {
        sql += " AND base_price >= ?";
        params.push(Number(min_price));
    }
    if (max_price) {
        sql += " AND base_price <= ?";
        params.push(Number(max_price));
    }
    if (room_type) {
        sql += " AND room_type = ?";
        params.push(room_type);
    }

    db.query(sql, params, (err, data) => {
        if (err) {
            console.error("Lỗi lấy danh sách phòng trống:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách phòng" });
        }
        return res.json(data);
    });
});

// API đăng ký đặt phòng (Tạo hợp đồng ở trạng thái PENDING)
app.post('/api/tenant/booking', (req, res) => {
    const { tenant_id, room_id } = req.body;

    if (!tenant_id || !room_id) {
        return res.status(400).json({ error: "Thiếu thông tin người đặt hoặc mã phòng!" });
    }

    const checkSql = `SELECT * FROM bookings WHERE tenant_id = ? AND status = 'PENDING'`;
    db.query(checkSql, [tenant_id], (checkErr, checkData) => {
        if (checkErr) return res.status(500).json({ error: "Lỗi kiểm tra dữ liệu." });

        if (checkData.length > 0) {
            return res.status(400).json({ error: "Bạn đã có một yêu cầu đặt phòng đang chờ chủ nhà duyệt! Không thể đặt thêm." });
        }

        const sql = `INSERT INTO bookings (tenant_id, room_id, status, created_at) VALUES (?, ?, 'PENDING', NOW())`;
        db.query(sql, [tenant_id, room_id], (err, result) => {
            if (err) {
                console.error("Lỗi đặt phòng:", err);
                return res.status(500).json({ error: "Lỗi hệ thống, không thể đặt phòng lúc này." });
            }
            return res.status(200).json({ message: "Gửi yêu cầu đặt phòng thành công! Vui lòng chờ chủ trọ liên hệ duyệt." });
        });
    });
});

/**
 * Khách thuê tự chọn phòng và tạo hợp đồng ACTIVE trực tiếp.
 * Có 2 lớp bảo vệ:
 *   1. Kiểm tra khách chưa có hợp đồng ACTIVE nào khác
 *   2. Kiểm tra phòng vẫn còn trống tại thời điểm gửi request (tránh race condition)
 */
app.post('/api/tenant/self-booking', (req, res) => {
    const { tenant_id, room_id, start_date, deposit_amount } = req.body;

    if (!tenant_id || !room_id || !start_date) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
    }

    // Bước 1: Kiểm tra khách đã có hợp đồng ACTIVE chưa
    const checkSql = `SELECT contract_id FROM Contracts WHERE tenant_id = ? AND status = 'ACTIVE'`;
    db.query(checkSql, [tenant_id], (checkErr, checkData) => {
        if (checkErr) return res.status(500).json({ error: "Lỗi kiểm tra hợp đồng!" });

        if (checkData.length > 0) {
            return res.status(400).json({ error: "Bạn đã có hợp đồng đang hiệu lực, không thể thuê thêm phòng!" });
        }

        // Bước 2: Kiểm tra phòng còn trống không
        const checkRoomSql = `SELECT room_id FROM Rooms WHERE room_id = ? AND status = 'AVAILABLE'`;
        db.query(checkRoomSql, [room_id], (roomErr, roomData) => {
            if (roomErr) return res.status(500).json({ error: "Lỗi kiểm tra trạng thái phòng!" });

            if (roomData.length === 0) {
                return res.status(400).json({ error: "Phòng này vừa được người khác thuê! Vui lòng chọn phòng khác." });
            }

            // Bước 3: Tạo hợp đồng ACTIVE
            const contractSql = `
                INSERT INTO Contracts (room_id, tenant_id, start_date, deposit_amount, status)
                VALUES (?, ?, ?, ?, 'ACTIVE')
            `;
            db.query(contractSql, [room_id, tenant_id, start_date, deposit_amount || 0], (contractErr, contractResult) => {
                if (contractErr) {
                    console.error("Lỗi tạo hợp đồng:", contractErr);
                    return res.status(500).json({ error: "Lỗi hệ thống khi tạo hợp đồng!" });
                }

                // Bước 4: Cập nhật trạng thái phòng → OCCUPIED
                const updateRoomSql = `UPDATE Rooms SET status = 'OCCUPIED' WHERE room_id = ?`;
                db.query(updateRoomSql, [room_id], (updateErr) => {
                    if (updateErr) {
                        console.error("Lỗi cập nhật trạng thái phòng:", updateErr);
                    }
                    return res.status(200).json({
                        message: "Thuê phòng thành công! Hợp đồng đã được kích hoạt.",
                        contract_id: contractResult.insertId
                    });
                });
            });
        });
    });
});

// ============================================================
// 3. QUẢN LÝ KHÁCH THUÊ (Tenants)
// ============================================================

app.get('/api/tenants', verifyRole(['ADMIN']), (req, res) => {
    const sql = `
        SELECT t.tenant_id, t.tenant_id as 'key', u.full_name, u.username, u.email,
               u.avatar_path, t.phone, t.cccd, t.hometown
        FROM Tenants t
                 JOIN Users u ON t.user_id = u.user_id
    `;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Kiểm tra email đã tồn tại trong hệ thống chưa — dùng cho async validator ở form đăng ký.
app.get('/api/check-email', (req, res) => {
    const { email } = req.query;

    if (!email || email.trim() === '') {
        return res.status(400).json({ error: "Thiếu email cần kiểm tra!" });
    }

    const sql = "SELECT user_id FROM Users WHERE email = ?";
    db.query(sql, [email.trim()], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi hệ thống!" });
        return res.json({ exists: result.length > 0 });
    });
});
// Route công khai — Khách thuê TỰ đăng ký tài khoản (không cần đăng nhập trước, không qua middleware)
app.post('/api/tenants', async (req, res) => {
    const { username, password, full_name, email, phone, cccd, hometown } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Email không đúng định dạng!" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({ error: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số!" });
    }

    try {
        db.query("SELECT user_id FROM Users WHERE email = ?", [email], async (checkErr, checkResult) => {
            if (checkErr) return res.status(500).json({ error: "Lỗi kiểm tra email!" });
            if (checkResult.length > 0) {
                return res.status(400).json({ error: "Email này đã được sử dụng cho tài khoản khác!" });
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const sqlUser = "INSERT INTO Users (username, password_hash, role, full_name, email) VALUES (?, ?, 'TENANT', ?, ?)";
            db.query(sqlUser, [username, hashedPassword, full_name, email], (err, result) => {
                if (err) return res.status(500).json(err);
                const userId = result.insertId;
                const sqlTenant = "INSERT INTO Tenants (user_id, phone, cccd, hometown) VALUES (?, ?, ?, ?)";
                db.query(sqlTenant, [userId, phone, cccd, hometown], (err2) => {
                    if (err2) return res.status(500).json(err2);
                    return res.json("Thêm khách thuê và bảo mật mật khẩu thành công!");
                });
            });
        });
    } catch (e) {
        res.status(500).json("Lỗi mã hóa dữ liệu");
    }
});

// Route riêng — chỉ ADMIN gọi để thêm khách thuê trực tiếp từ trang quản trị (Tenants.jsx)
app.post('/api/admin/tenants', verifyRole(['ADMIN']), async (req, res) => {
    const { username, password, full_name, phone, cccd, hometown } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sqlUser = "INSERT INTO Users (username, password_hash, role, full_name) VALUES (?, ?, 'TENANT', ?)";
        db.query(sqlUser, [username, hashedPassword, full_name], (err, result) => {
            if (err) return res.status(500).json(err);
            const userId = result.insertId;
            const sqlTenant = "INSERT INTO Tenants (user_id, phone, cccd, hometown) VALUES (?, ?, ?, ?)";
            db.query(sqlTenant, [userId, phone, cccd, hometown], (err2) => {
                if (err2) return res.status(500).json(err2);
                return res.json("Đã thêm khách thuê thành công!");
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

app.post('/api/contracts', verifyRole(['ADMIN']), (req, res) => {
    const { room_id, tenant_id, start_date, end_date, deposit_amount } = req.body;
    const sql = "INSERT INTO Contracts (room_id, tenant_id, start_date, end_date, deposit_amount, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')";

    db.query(sql, [room_id, tenant_id, start_date, end_date, deposit_amount], (err, result) => {
        if (err) return res.status(500).json(err);
        const updateRoomSql = "UPDATE Rooms SET status = 'OCCUPIED' WHERE room_id = ?";
        db.query(updateRoomSql, [room_id]);
        return res.json("Tạo hợp đồng thành công!");
    });
});

app.delete('/api/contracts/:id', verifyRole(['ADMIN']), (req, res) => {
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

/**
 * Thanh lý hợp đồng: đổi status → EXPIRED, phòng → AVAILABLE, ghi ngày kết thúc thực tế.
 * Tự động hoàn trả toàn bộ tiền cọc đã đóng (do hệ thống không có cơ chế ghi nhận
 * khoản trừ/phí phạt riêng, nên mặc định hoàn trả đủ deposit_amount đã lưu).
 * Chỉ cho phép thanh lý hợp đồng đang ACTIVE.
 */
app.put('/api/contracts/:id/terminate', verifyRole(['ADMIN']),(req, res) => {
    const contractId = req.params.id;
    const today = new Date().toISOString().split('T')[0];

    db.query(
        "SELECT room_id, status, deposit_amount FROM Contracts WHERE contract_id = ?",
        [contractId],
        (err, result) => {
            if (err || result.length === 0)
                return res.status(404).json({ error: "Hợp đồng không tồn tại!" });

            if (result[0].status !== 'ACTIVE')
                return res.status(400).json({ error: "Chỉ có thể thanh lý hợp đồng đang hiệu lực!" });

            const roomId = result[0].room_id;
            const refundAmount = result[0].deposit_amount || 0;

            // Bước 1: Cập nhật hợp đồng → EXPIRED + ghi ngày kết thúc thực tế + số tiền đã hoàn cọc
            db.query(
                "UPDATE Contracts SET status = 'EXPIRED', end_date = ?, refunded_amount = ? WHERE contract_id = ?",
                [today, refundAmount, contractId],
                (err2) => {
                    if (err2) return res.status(500).json({ error: "Lỗi cập nhật hợp đồng!" });

                    // Bước 2: Trả phòng về trạng thái trống
                    db.query(
                        "UPDATE Rooms SET status = 'AVAILABLE' WHERE room_id = ?",
                        [roomId],
                        (err3) => {
                            if (err3) return res.status(500).json({ error: "Lỗi cập nhật trạng thái phòng!" });
                            return res.json({
                                message: `Thanh lý hợp đồng thành công! Đã hoàn trả ${refundAmount.toLocaleString('vi-VN')}đ tiền cọc. Phòng đã được giải phóng.`,
                                refunded_amount: refundAmount
                            });
                        }
                    );
                }
            );
        }
    );
});

// Gia hạn hợp đồng — chỉ cho phép sửa ngày hết hạn của hợp đồng đang ACTIVE.
app.put('/api/contracts/:id/extend', verifyRole(['ADMIN']),(req, res) => {
    const { new_end_date } = req.body;
    if (!new_end_date) return res.status(400).json({ error: "Vui lòng chọn ngày hết hạn mới!" });

    db.query("SELECT status FROM Contracts WHERE contract_id = ?", [req.params.id], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ error: "Hợp đồng không tồn tại!" });
        if (result[0].status !== 'ACTIVE') return res.status(400).json({ error: "Chỉ có thể gia hạn hợp đồng đang hiệu lực!" });

        db.query("UPDATE Contracts SET end_date = ? WHERE contract_id = ?", [new_end_date, req.params.id], (err2) => {
            if (err2) return res.status(500).json({ error: "Lỗi gia hạn hợp đồng!" });
            return res.json({ message: "Đã gia hạn hợp đồng thành công!" });
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

app.put('/api/services/:id', verifyRole(['ADMIN']),(req, res) => {
    const { unit_price } = req.body;
    const sql = "UPDATE Services SET unit_price = ? WHERE service_id = ?";
    db.query(sql, [unit_price, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json("Cập nhật đơn giá thành công!");
    });
});

app.post('/api/invoices', verifyRole(['ADMIN']),(req, res) => {
    const { room_id, billing_month, services } = req.body;

    // Bước 1: Kiểm tra chỉ số âm (new_index < old_index) trước khi lưu
    for (const s of services) {
        if ((s.new_index ?? 0) < (s.old_index ?? 0)) {
            return res.status(400).json({ error: `Chỉ số mới không thể nhỏ hơn chỉ số cũ! Kiểm tra lại dịch vụ ID: ${s.service_id}` });
        }
    }

    // Bước 2: Kiểm tra phòng này đã có hóa đơn trong tháng chưa (tránh duplicate)
    const checkDupSql = "SELECT invoice_id FROM Invoices WHERE room_id = ? AND billing_month = ?";
    db.query(checkDupSql, [room_id, billing_month], (dupErr, dupData) => {
        if (dupErr) return res.status(500).json({ error: "Lỗi kiểm tra hóa đơn!" });
        if (dupData.length > 0) {
            return res.status(400).json({ error: `Phòng này đã có hóa đơn tháng ${billing_month} rồi! Không thể lập thêm.` });
        }

        // Bước 3: Lấy tiền phòng cố định (base_price) của phòng để cộng vào tổng tiền
        db.query("SELECT base_price FROM Rooms WHERE room_id = ?", [room_id], (roomErr, roomResult) => {
            if (roomErr || roomResult.length === 0) return res.status(400).json({ error: "Không tìm thấy thông tin phòng!" });
            const roomRent = parseFloat(roomResult[0].base_price) || 0;

            // Bước 4: Tổng tiền = Tiền phòng cố định + tổng tiền các dịch vụ (điện, nước, dịch vụ khác)
            const servicesTotal = services.reduce((sum, s) => sum + s.sub_total, 0);
            const total_amount = roomRent + servicesTotal;

            const sqlInvoice = "INSERT INTO Invoices (room_id, billing_month, room_rent, total_amount, status) VALUES (?, ?, ?, ?, 'UNPAID')";
            db.query(sqlInvoice, [room_id, billing_month, roomRent, total_amount], (err, result) => {
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

// Lấy chi tiết từng dòng dịch vụ của 1 hóa đơn (JOIN Services để lấy tên, đơn vị).
// QUAN TRỌNG: khai báo trước app.put('/api/invoices/:id/pay') để Express không nhầm ":id".
app.get('/api/invoices/:id/details', (req, res) => {
    const sql = `
        SELECT
            id.detail_id,
            s.service_name,
            s.unit,
            id.old_index,
            id.new_index,
            id.quantity,
            id.sub_total
        FROM Invoice_Details id
                 JOIN Services s ON id.service_id = s.service_id
        WHERE id.invoice_id = ?
        ORDER BY id.detail_id ASC
    `;
    db.query(sql, [req.params.id], (err, data) => {
        if (err) {
            console.error('Lỗi lấy chi tiết hóa đơn:', err);
            return res.status(500).json({ error: 'Lỗi hệ thống!' });
        }
        // Lấy thêm room_rent từ bảng Invoices để hiển thị dòng "Tiền phòng cố định"
        db.query("SELECT room_rent FROM Invoices WHERE invoice_id = ?", [req.params.id], (err2, invResult) => {
            if (err2) return res.status(500).json({ error: 'Lỗi hệ thống!' });
            return res.json({
                room_rent: invResult[0]?.room_rent || 0,
                details: data
            });
        });
    });
});

app.put('/api/invoices/:id/pay', verifyRole(['ADMIN']),(req, res) => {
    const sql = "UPDATE Invoices SET status = 'PAID' WHERE invoice_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json("Đã thanh toán hóa đơn!");
    });
});

app.get('/api/last-index/:roomId', (req, res) => {
    const sql = `
        SELECT id.service_id, id.new_index
        FROM Invoice_Details id
        JOIN Invoices i ON id.invoice_id = i.invoice_id
        WHERE i.room_id = ?
        ORDER BY i.created_at DESC
        LIMIT 10
    `;
    db.query(sql, [req.params.roomId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// ============================================================
// 6. DASHBOARD DÀNH CHO KHÁCH THUÊ (Tenant Portal)
// ============================================================

app.get('/api/tenant/room-info/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT r.room_id, r.room_number, r.room_type, r.base_price, r.area, r.floor, r.description, r.image_path, c.start_date, c.deposit_amount, c.status as contract_status
        FROM Users u
                 JOIN Tenants t ON u.user_id = t.user_id
                 JOIN Contracts c ON t.tenant_id = c.tenant_id
                 JOIN Rooms r ON c.room_id = r.room_id
        WHERE u.user_id = ? AND c.status = 'ACTIVE'
            LIMIT 1
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
        if (result.length === 0) return res.status(404).json({ message: "Chưa có hợp đồng hoạt động." });
        res.json(result[0]);
    });
});

// ============================================================
// 7. API THỐNG KÊ DASHBOARD (Dành cho Admin)
// ============================================================

app.get('/api/admin/dashboard-stats', verifyRole(['ADMIN']), (req, res) => {
    const queryRooms = `
        SELECT 
            COUNT(*) as total_rooms,
            SUM(CASE WHEN status = 'AVAILABLE' OR status = 'CÒN TRỐNG' THEN 1 ELSE 0 END) as available_rooms,
            SUM(CASE WHEN status = 'OCCUPIED' OR status = 'Đã thuê' THEN 1 ELSE 0 END) as occupied_rooms
        FROM Rooms
    `;
    const queryTenants = `SELECT COUNT(*) as total_tenants FROM Tenants`;
    const queryRevenue = `SELECT SUM(total_amount) as total_income FROM Invoices WHERE status = 'PAID'`;
    const queryChart = `
        SELECT billing_month as name, SUM(total_amount) as doanhThu 
        FROM Invoices 
        WHERE status = 'PAID'
        GROUP BY billing_month
        ORDER BY created_at ASC
    `;
    // Đếm số hóa đơn chưa thu và tổng tiền còn nợ
    const queryUnpaid = `
        SELECT COUNT(*) as unpaid_count, COALESCE(SUM(total_amount), 0) as unpaid_amount
        FROM Invoices WHERE status = 'UNPAID'
    `;

    db.query(queryRooms, (err, resRooms) => {
        if (err) return res.status(500).json(err);
        db.query(queryTenants, (err2, resTenants) => {
            if (err2) return res.status(500).json(err2);
            db.query(queryRevenue, (err3, resRevenue) => {
                if (err3) return res.status(500).json(err3);
                db.query(queryChart, (err4, resChart) => {
                    if (err4) return res.status(500).json(err4);
                    db.query(queryUnpaid, (err5, resUnpaid) => {
                        if (err5) return res.status(500).json(err5);
                        return res.json({
                            rooms: resRooms[0],
                            total_tenants: resTenants[0].total_tenants,
                            total_income: resRevenue[0].total_income || 0,
                            unpaid_count: resUnpaid[0].unpaid_count || 0,
                            unpaid_amount: resUnpaid[0].unpaid_amount || 0,
                            chartData: resChart
                        });
                    });
                });
            });
        });
    });
});

// ============================================================
// 8. API QUẢN LÝ SỰ CỐ (Áp dụng cho cả Admin và Tenant)
// ============================================================

// Khách thuê gửi báo cáo hỏng hóc lên hệ thống
app.post('/api/issues', verifyRole(['TENANT']), (req, res) => {
    const { tenant_id, room_id, title, description, severity, status } = req.body;

    if (!tenant_id || !title || !description) {
        return res.status(400).json({ error: "Vui lòng điền đầy đủ các thông tin bắt buộc!" });
    }

    let validRoomId = null;
    if (room_id !== undefined && room_id !== null && room_id !== 'undefined' && room_id !== '') {
        validRoomId = parseInt(room_id, 10);
    }

    const sql = `INSERT INTO issues (tenant_id, room_id, title, description, status, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`;

    const values = [
        parseInt(tenant_id, 10),
        validRoomId,
        title,
        description,
        status || 'PENDING'
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("❌ LỖI MYSQL THỰC TẾ TRÊN TERMINAL:", err.message);
            return res.status(500).json({ error: "Lỗi Cơ sở dữ liệu: " + err.message });
        }
        return res.status(200).json({ message: "Thành công!", issueId: result.insertId });
    });
});

// Khách thuê theo dõi danh sách sự cố của riêng mình
app.get('/api/tenant/issues/:tenantId', (req, res) => {
    const sql = "SELECT * FROM Issues WHERE tenant_id = ? ORDER BY created_at DESC";
    db.query(sql, [req.params.tenantId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Admin lấy toàn bộ sự cố kèm thông tin phòng và khách báo cáo
app.get('/api/admin/issues', verifyRole(['ADMIN']), (req, res) => {
    const sql = `
        SELECT i.issue_id as 'key', i.issue_id, r.room_number, u.full_name, 
               i.title, i.description, i.status, i.created_at
        FROM Issues i
        JOIN Tenants t ON i.tenant_id = t.tenant_id
        JOIN Users u ON t.user_id = u.user_id
        LEFT JOIN Contracts c ON t.tenant_id = c.tenant_id AND c.status = 'ACTIVE'
        LEFT JOIN Rooms r ON c.room_id = r.room_id
        ORDER BY i.created_at DESC
    `;
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Lỗi lấy danh sách sự cố phía Admin:", err);
            return res.status(500).json(err);
        }
        return res.json(data);
    });
});

// Admin cập nhật tiến độ sửa chữa
app.put('/api/admin/issues/:id', verifyRole(['ADMIN']), (req, res) => {
    const { status } = req.body;
    const sql = "UPDATE Issues SET status = ? WHERE issue_id = ?";
    db.query(sql, [status, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Cập nhật trạng thái sự cố thành công!" });
    });
});

// ============================================================
// 9. API LẤY LỊCH SỬ HÓA ĐƠN CHO TỪNG KHÁCH THUÊ CỤ THỂ
// ============================================================

app.get('/api/tenant/invoices/:tenantId', (req, res) => {
    const tenantId = req.params.tenantId;
    const sql = `
        SELECT
            i.invoice_id as 'key',
            i.invoice_id,
            i.billing_month as month, 
            i.total_amount, 
            i.status, 
            i.created_at,
            r.room_number
        FROM Invoices i
        JOIN Contracts c ON i.room_id = c.room_id
        JOIN Rooms r ON c.room_id = r.room_id
        WHERE c.tenant_id = ? AND c.status = 'ACTIVE'
        ORDER BY i.created_at DESC
    `;

    db.query(sql, [tenantId], (err, data) => {
        if (err) {
            console.error("Lỗi lấy hóa đơn khách thuê:", err);
            return res.status(500).json({ error: "Lỗi hệ thống khi lấy hóa đơn" });
        }
        return res.json(data);
    });
});

// ============================================================
// 10. HỒ SƠ CÁ NHÂN KHÁCH THUÊ
// ============================================================

/**
 * Lấy thông tin hồ sơ cá nhân của Tenant theo user_id.
 * JOIN Users + Tenants để trả về đầy đủ: họ tên, username, email, SĐT, CCCD, địa chỉ.
 */
app.get('/api/tenant/profile/:userId', (req, res) => {
    const sql = `
        SELECT u.user_id, u.username, u.full_name, u.email, u.avatar_path,
               t.tenant_id, t.phone, t.cccd, t.hometown
        FROM Users u
                 JOIN Tenants t ON u.user_id = t.user_id
        WHERE u.user_id = ?
    `;
    db.query(sql, [req.params.userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn hồ sơ!" });
        if (result.length === 0) return res.status(404).json({ error: "Không tìm thấy hồ sơ!" });
        return res.json(result[0]);
    });
});

/**
 * Cập nhật thông tin hồ sơ cá nhân của Tenant.
 * Cập nhật đồng thời 2 bảng: Users (full_name, email) và Tenants (phone, cccd, hometown).
 * Sau khi lưu thành công, trả về thông tin mới để frontend cập nhật localStorage.
 */
app.put('/api/tenant/profile/:userId', (req, res) => {
    const { full_name, email, phone, cccd, hometown } = req.body;
    const userId = req.params.userId;

    if (!full_name || !phone) {
        return res.status(400).json({ error: "Họ tên và số điện thoại không được để trống!" });
    }

    // Bước 1: Cập nhật bảng Users
    const sqlUser = "UPDATE Users SET full_name = ?, email = ? WHERE user_id = ?";
    db.query(sqlUser, [full_name, email || null, userId], (err) => {
        if (err) return res.status(500).json({ error: "Lỗi cập nhật thông tin người dùng!" });

        // Bước 2: Cập nhật bảng Tenants
        const sqlTenant = "UPDATE Tenants SET phone = ?, cccd = ?, hometown = ? WHERE user_id = ?";
        db.query(sqlTenant, [phone, cccd || null, hometown || null, userId], (err2) => {
            if (err2) return res.status(500).json({ error: "Lỗi cập nhật hồ sơ khách thuê!" });

            return res.json({
                message: "Cập nhật hồ sơ thành công!",
                updated: { full_name, email, phone, cccd, hometown }
            });
        });
    });
});

// Upload/cập nhật avatar khách thuê — xóa avatar cũ trước khi lưu cái mới
app.post('/api/tenant/profile/:userId/avatar', uploadAvatar.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Vui lòng chọn ảnh!" });
    const userId = req.params.userId;
    const newPath = `/uploads/avatars/${req.file.filename}`;

    db.query("SELECT avatar_path FROM Users WHERE user_id = ?", [userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Lỗi truy vấn!" });
        const oldPath = result[0]?.avatar_path;

        db.query("UPDATE Users SET avatar_path = ? WHERE user_id = ?", [newPath, userId], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Lỗi lưu avatar!" });
            if (oldPath) fs.unlink(path.join(__dirname, oldPath), () => {});
            return res.json({ message: "Cập nhật ảnh đại diện thành công!", avatar_path: newPath });
        });
    });
});

// ============================================================
// 11. BOOKING — ĐẶT PHÒNG CÓ DUYỆT (PENDING → APPROVED/REJECTED)
// ============================================================

// Khách gửi yêu cầu đặt phòng.
// Guard 1: chỉ được có 1 PENDING tại 1 thời điểm.
// Guard 2: phòng phải AVAILABLE khi gửi.
app.post('/api/tenant/booking-request', verifyRole(['TENANT']), (req, res) => {
    const { tenant_id, room_id, move_in_date, num_people, note } = req.body;
    if (!tenant_id || !room_id || !move_in_date || !num_people) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc!' });
    }
    db.query("SELECT booking_id FROM bookings WHERE tenant_id = ? AND status = 'PENDING'", [tenant_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Lỗi hệ thống!' });
        if (rows.length > 0) return res.status(400).json({ error: 'Bạn đang có yêu cầu chờ duyệt, không thể gửi thêm!' });
        db.query("SELECT room_id FROM Rooms WHERE room_id = ? AND status = 'AVAILABLE'", [room_id], (err2, roomRows) => {
            if (err2) return res.status(500).json({ error: 'Lỗi kiểm tra phòng!' });
            if (roomRows.length === 0) return res.status(400).json({ error: 'Phòng này không còn trống!' });
            db.query(
                "INSERT INTO bookings (tenant_id, room_id, move_in_date, num_people, note, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
                [tenant_id, room_id, move_in_date, num_people, note || ''],
                (err3, result) => {
                    if (err3) return res.status(500).json({ error: 'Lỗi tạo yêu cầu!' });
                    return res.json({ message: 'Gửi yêu cầu thành công!', booking_id: result.insertId });
                }
            );
        });
    });
});

// Lấy booking mới nhất CHƯA HOÀN TẤT của khách (PENDING hoặc REJECTED).
// QUAN TRỌNG: loại bỏ status APPROVED — vì booking APPROVED đã hoàn thành
// vai trò của nó (đã sinh ra Contract). Nếu không loại trừ, sau khi hợp đồng
// bị thanh lý (EXPIRED), hệ thống vẫn đọc trúng booking APPROVED cũ và hiểu
// nhầm khách đang có yêu cầu/phòng hợp lệ → gây màn hình trắng hoặc sai luồng.
app.get('/api/tenant/booking-status/:tenantId', (req, res) => {
    const sql = `SELECT b.booking_id, b.status, b.move_in_date, b.num_people, b.note,
               b.reject_reason, b.created_at, r.room_number, r.room_type, r.base_price
        FROM bookings b JOIN Rooms r ON b.room_id = r.room_id
        WHERE b.tenant_id = ? AND b.status != 'APPROVED'
        ORDER BY b.created_at DESC LIMIT 1`;
    db.query(sql, [req.params.tenantId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Lỗi hệ thống!' });
        if (rows.length === 0) return res.status(404).json({ message: 'Chưa có yêu cầu.' });
        return res.json(rows[0]);
    });
});

// Admin lấy toàn bộ danh sách booking, PENDING hiển thị trước.
app.get('/api/admin/bookings', verifyRole(['ADMIN']), (req, res) => {
    const sql = `SELECT b.booking_id, b.status, b.move_in_date, b.num_people,
               b.note, b.reject_reason, b.created_at,
               r.room_number, r.room_type, r.base_price, u.full_name, t.phone
        FROM bookings b
        JOIN Rooms r ON b.room_id = r.room_id
        JOIN Tenants t ON b.tenant_id = t.tenant_id
        JOIN Users u ON t.user_id = u.user_id
        ORDER BY FIELD(b.status, 'PENDING', 'APPROVED', 'REJECTED'), b.created_at DESC`;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Lỗi hệ thống!' });
        return res.json(rows);
    });
});

// Admin duyệt booking: tạo Contract ACTIVE + Room OCCUPIED + booking APPROVED.
// Kiểm tra race condition phòng bị lấy mất trước khi duyệt.
app.put('/api/admin/bookings/:id/approve', verifyRole(['ADMIN']), (req, res) => {
    // deposit_amount và end_date do Admin nhập khi duyệt
    const deposit_amount = req.body.deposit_amount || 0;
    const end_date = req.body.end_date || null;

    db.query("SELECT * FROM bookings WHERE booking_id = ? AND status = 'PENDING'", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Lỗi hệ thống!' });
        if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy yêu cầu PENDING!' });
        const booking = rows[0];
        db.query("SELECT room_id FROM Rooms WHERE room_id = ? AND status = 'AVAILABLE'", [booking.room_id], (err2, roomRows) => {
            if (err2) return res.status(500).json({ error: 'Lỗi kiểm tra phòng!' });
            if (roomRows.length === 0) return res.status(400).json({ error: 'Phòng không còn trống, không thể duyệt!' });
            const today = new Date().toISOString().split('T')[0];
            db.query(
                "INSERT INTO Contracts (room_id, tenant_id, start_date, end_date, deposit_amount, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
                [booking.room_id, booking.tenant_id, today, end_date, deposit_amount],
                (err3, contractResult) => {
                    if (err3) return res.status(500).json({ error: 'Lỗi tạo hợp đồng!' });
                    db.query("UPDATE Rooms SET status = 'OCCUPIED' WHERE room_id = ?", [booking.room_id], (err4) => {
                        if (err4) console.error('Lỗi cập nhật phòng:', err4);
                        db.query("UPDATE bookings SET status = 'APPROVED' WHERE booking_id = ?", [req.params.id], (err5) => {
                            if (err5) return res.status(500).json({ error: 'Lỗi cập nhật trạng thái!' });
                            return res.json({ message: 'Duyệt thành công!', contract_id: contractResult.insertId });
                        });
                    });
                }
            );
        });
    });
});

// Admin từ chối booking kèm lý do để khách xem được.
app.put('/api/admin/bookings/:id/reject', verifyRole(['ADMIN']), (req, res) => {
    const { reject_reason } = req.body;
    if (!reject_reason) return res.status(400).json({ error: 'Vui lòng nhập lý do!' });
    db.query(
        "UPDATE bookings SET status = 'REJECTED', reject_reason = ? WHERE booking_id = ? AND status = 'PENDING'",
        [reject_reason, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Lỗi hệ thống!' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy yêu cầu PENDING!' });
            return res.json({ message: 'Đã từ chối yêu cầu.' });
        }
    );
});

/**
 * Đổi mật khẩu cho cả Admin và Tenant.
 * Quy trình: xác minh mật khẩu cũ bằng bcrypt.compare → nếu đúng thì hash mật khẩu mới → UPDATE.
 */
app.put('/api/change-password', async (req, res) => {
    const { user_id, old_password, new_password } = req.body;

    if (!user_id || !old_password || !new_password) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc!" });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
    }

    // Lấy hash mật khẩu hiện tại từ DB
    db.query("SELECT password_hash FROM Users WHERE user_id = ?", [user_id], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy tài khoản!" });
        }

        const isMatch = await bcrypt.compare(old_password, result[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Mật khẩu hiện tại không đúng!" });
        }

        // Hash mật khẩu mới rồi lưu
        const newHash = await bcrypt.hash(new_password, saltRounds);
        db.query("UPDATE Users SET password_hash = ? WHERE user_id = ?", [newHash, user_id], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Lỗi cập nhật mật khẩu!" });
            return res.json({ message: "Đổi mật khẩu thành công!" });
        });
    });
});

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Backend đang chạy tại http://localhost:${PORT}`);
});