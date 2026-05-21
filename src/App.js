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
import Login from './pages/Login';
import Register from "./pages/Register";
import TenantLayout from './components/TenantLayout';
import TenantDashboard from './pages/TenantDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.role !== allowedRole) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. VỪA KHỞI CHẠY: Tự động chuyển hướng thẳng vào trang login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Trang công khai */}
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                {/* 2. Phân hệ ADMIN: Chuyển gốc thành /admin */}
                <Route
                    path="/admin"
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

                {/* 3. Phân hệ KHÁCH THUÊ */}
                <Route
                    path="/tenant"
                    element={
                        <ProtectedRoute allowedRole="TENANT">
                            <TenantLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<TenantDashboard />} />
                </Route>

                {/* 4. Tuyến đường dự phòng */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;