import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import Tenants from './pages/Tenants';
import Invoices from './pages/Invoices';
import Contracts from "./pages/Contracts";
import Services from './pages/Services';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="rooms" element={<RoomManagement />} />
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="contracts" element={<Contracts />} />
                    <Route path="services" element={<Services />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;