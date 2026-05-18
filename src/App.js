import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Pages
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import Tenants from './pages/Tenants';
import Invoices from './pages/Invoices';
import Contracts from "./pages/Contracts";
import Services from './pages/Services';
import Login from './pages/Login'; // Import trang Login vừa tạo

// ==========================================
// THÊM MỚI: Kỹ thuật Bảo vệ Route (Phân quyền)
// ==========================================
const ProtectedRoute = ({ children, allowedRole }) => {
    // Lấy thông tin user từ LocalStorage (được lưu lúc đăng nhập)
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // 1. Nếu chưa đăng nhập -> Đuổi về trang Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu đã đăng nhập nhưng sai quyền (VD: Khách thuê đòi vào trang Admin) -> Đuổi về Login
    if (user.role !== allowedRole) {
        return <Navigate to="/login" replace />;
    }

    // 3. Hợp lệ thì cho phép vào xem
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Tuyến đường công khai: Bất kỳ ai cũng vào được */}
                <Route path="/login" element={<Login />} />

                {/* 2. Phân hệ ADMIN: Được bảo vệ bởi ProtectedRoute */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="rooms" element={<RoomManagement />} />
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="contracts" element={<Contracts />} />
                    <Route path="services" element={<Services />} />
                </Route>

                {/* 3. Phân hệ KHÁCH THUÊ: Chuẩn bị sẵn để làm tiếp */}
                <Route
                    path="/tenant"
                    element={
                        <ProtectedRoute allowedRole="TENANT">
                            {/* Tạm thời để một dòng chữ, sau này sẽ thay bằng TenantLayout */}
                            <div style={{ padding: 50, textAlign: 'center', fontSize: 24 }}>
                                <h1>Chào mừng Khách Thuê</h1>
                                <p>Giao diện của bạn đang được xây dựng...</p>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        window.location.href = '/login';
                                    }}
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </ProtectedRoute>
                    }
                />

                {/* 4. Tuyến đường dự phòng: Gõ link bậy bạ sẽ về trang Login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;