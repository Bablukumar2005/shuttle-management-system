import React, { useState, useEffect } from 'react';
import { Search, Calendar, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingDetailsDrawer from '../components/BookingDetailsDrawer';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-09-22');

  // Drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || `Failed to connect to backend service at ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewBooking = async (id) => {
    try {
      const response = await axiosClient.get(`/bookings/${id}`);
      setSelectedBooking(response.data);
      setIsDrawerOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch booking details');
    }
  };

  // Called by drawer after any action (sign-in, no-show, cancel, complete, edit)
  const handleBookingUpdated = async (id) => {
    try {
      const [singleRes, listRes] = await Promise.all([
        axiosClient.get(`/bookings/${id}`),
        axiosClient.get('/bookings'),
      ]);
      setSelectedBooking(singleRes.data);
      setBookings(listRes.data);
    } catch (err) {
      console.error('Error refreshing updated booking data:', err);
      fetchBookings();
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  // Frontend Search & Date Filtering
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      searchTerm === '' ||
      (b.bookingIdDisplay && b.bookingIdDisplay.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.employeeName && b.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.employeeEmpId && b.employeeEmpId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate =
      !selectedDate ||
      (b.requestedPickupTime && b.requestedPickupTime.startsWith(selectedDate));

    return matchesSearch && matchesDate;
  });

  return (
    <div>
      {/* Page Title & Subtitle */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Booking Management</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Monitor, track, and inspect passenger shuttle requests</p>
        </div>
        <button
          onClick={fetchBookings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* Control Bar: Search input & Date Selector */}
      <div className="card control-bar" style={{ padding: '16px', marginBottom: '20px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Emp, ID, Booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '38px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#64748b" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Error State Notice */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>API Error:</strong>
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Main Table Content Container */}
      <div className="card table-responsive" style={{ padding: '0' }}>
        {loading ? (
          <LoadingSpinner message="Fetching live booking records from Spring Boot backend..." />
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontWeight: '500', fontSize: '1rem', color: '#334155' }}>No Bookings Found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Try clearing your search query or selecting a different date.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                  <th style={{ padding: '12px 16px' }}>Booking ID</th>
                  <th style={{ padding: '12px 16px' }}>Employee</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>From</th>
                  <th style={{ padding: '12px 16px' }}>To</th>
                  <th style={{ padding: '12px 16px' }}>Vehicle</th>
                  <th style={{ padding: '12px 16px' }}>Requested Pickup</th>
                  <th style={{ padding: '12px 16px' }}>Pickup Time</th>
                  <th style={{ padding: '12px 16px' }}>Planned Drop</th>
                  <th style={{ padding: '12px 16px' }}>Actual Drop</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {row.bookingIdDisplay}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#334155' }}>
                      {row.employeeName || 'Unknown'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {row.pickupLocation || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {row.dropLocation || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontWeight: '500' }}>
                      {row.vehicleLicensePlate || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {formatTime(row.requestedPickupTime)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {formatTime(row.actualPickupTime)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {formatTime(row.plannedDropTime)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {formatTime(row.actualDropTime)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewBooking(row.id)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#2563eb',
                          fontWeight: '500',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right-Side Booking Details Drawer */}
      <BookingDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        booking={selectedBooking}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
}
