import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminDriversPage from './pages/AdminDriversPage';
import AdminRoutesPage from './pages/AdminRoutesPage';
import EmployeeBookPage from './pages/EmployeeBookPage';
import EmployeeHistoryPage from './pages/EmployeeHistoryPage';

// Helper to retrieve current user session
const getUser = () => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

// Route guard requiring login
function ProtectedRoute() {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Route guard restricting admin pages to ADMIN role
function AdminRoute() {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'ADMIN') {
    return <Navigate to="/employee/book" replace />;
  }
  return <Outlet />;
}

// Default home redirection based on user role
function HomeRedirect() {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return user.role === 'ADMIN' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/employee/book" replace />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRedirect />} />

            {/* Admin Workspace Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/bookings" element={<AdminBookingsPage />} />
              <Route path="/admin/drivers" element={<AdminDriversPage />} />
              <Route path="/admin/routes" element={<AdminRoutesPage />} />
            </Route>

            {/* Employee Workspace Routes */}
            <Route path="/employee/book" element={<EmployeeBookPage />} />
            <Route path="/employee/history" element={<EmployeeHistoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
