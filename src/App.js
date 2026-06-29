import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './components/AdminLayout';
import TenantLayout from './components/TenantLayout';

import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import AdminIssues from './pages/AdminIssues';
import AdminBookings from './pages/AdminBookings';
import Tenants from './pages/Tenants';
import TenantDashboard from './pages/TenantDashboard';
import TenantInvoices from './pages/TenantInvoices';
import TenantProfile from './pages/TenantProfile';
import RoomBooking from './pages/RoomBooking';
import Invoices from './pages/Invoices';
import Contracts from './pages/Contracts';
import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRole }) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== allowedRole) return <Navigate to="/login" replace />;
    return children;
};

const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
if (storedUser) {
    axios.defaults.headers.common['x-user-id'] = storedUser.id;
    axios.defaults.headers.common['x-user-role'] = storedUser.role;
}
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Phân hệ ADMIN */}
                <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="rooms" element={<RoomManagement />} />
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="contracts" element={<Contracts />} />
                    <Route path="services" element={<Services />} />
                    <Route path="issues" element={<AdminIssues />} />
                    <Route path="change-password" element={<ChangePassword />} />
                </Route>

                {/* Phân hệ KHÁCH THUÊ */}
                <Route path="/tenant" element={<ProtectedRoute allowedRole="TENANT"><TenantLayout /></ProtectedRoute>}>
                    <Route index element={<TenantDashboard />} />
                    <Route path="invoices" element={<TenantInvoices />} />
                    <Route path="booking" element={<RoomBooking />} />
                    <Route path="profile" element={<TenantProfile />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;