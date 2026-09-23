import React from 'react';
import { CalendarCheck, Users, MapPin, Bus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Admin Overview</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Campus Transit Dispatch & Fleet Status</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Link to="/admin/bookings" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
            <CalendarCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>Bookings</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Manage Trips</div>
          </div>
        </Link>

        <Link to="/admin/drivers" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>Drivers</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Timeline View</div>
          </div>
        </Link>

        <Link to="/admin/routes" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
            <MapPin size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: '500' }}>Routes</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Campus Stops</div>
          </div>
        </Link>
      </div>

      <div className="card">
        <h3 className="card-title">Welcome to MoveInSync Shuttle Management System</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Select a section from the left sidebar navigation to manage shuttle bookings, monitor driver schedules, update routes, or handle passenger dispatch operations.
        </p>
      </div>
    </div>
  );
}
