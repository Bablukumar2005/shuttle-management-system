import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Users, MapPin, PlusCircle, History } from 'lucide-react';

export default function Sidebar() {
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;
  const role = user?.role || 'ADMIN'; // Default to ADMIN if unauthenticated

  const navSectionStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '16px 16px 8px',
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: isActive ? '#2563eb' : '#475569',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    borderRight: isActive ? '3px solid #2563eb' : '3px solid transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 101,
      }}
    >
      <div style={{ height: '60px', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Shuttle Portal</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {/* Admin Navigation Section */}
        {role === 'ADMIN' && (
          <>
            <div style={navSectionStyle}>Admin Workspace</div>
            <NavLink to="/admin/dashboard" style={navItemStyle}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/bookings" style={navItemStyle}>
              <CalendarCheck size={18} />
              <span>Bookings</span>
            </NavLink>
            <NavLink to="/admin/drivers" style={navItemStyle}>
              <Users size={18} />
              <span>Drivers & Timeline</span>
            </NavLink>
            <NavLink to="/admin/routes" style={navItemStyle}>
              <MapPin size={18} />
              <span>Routes</span>
            </NavLink>
          </>
        )}

        {/* Employee Navigation Section */}
        {(role === 'EMPLOYEE' || role === 'ADMIN') && (
          <>
            <div style={navSectionStyle}>Employee Workspace</div>
            <NavLink to="/employee/book" style={navItemStyle}>
              <PlusCircle size={18} />
              <span>Book Shuttle</span>
            </NavLink>
            <NavLink to="/employee/history" style={navItemStyle}>
              <History size={18} />
              <span>Trip History</span>
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}
