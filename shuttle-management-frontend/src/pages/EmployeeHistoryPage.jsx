import React, { useState, useEffect } from 'react';
import { History, RefreshCw, AlertCircle, XCircle, Search, Calendar } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const getLoggedInUser = () => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

export default function EmployeeHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Cancel modal state
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = getLoggedInUser();
      const empId = currentUser?.id || 2;
      const response = await axiosClient.get('/bookings');
      // Filter bookings belonging to the employee
      const empBookings = response.data.filter((b) => b.employeeId === empId);
      setBookings(empBookings);
    } catch (err) {
      console.error('Error fetching employee booking history:', err);
      setError(err.response?.data?.message || 'Failed to fetch trip history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await axiosClient.post(`/bookings/${cancelModalBooking.id}/cancel`);
      setCancelModalBooking(null);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      searchTerm === '' ||
      (b.bookingIdDisplay && b.bookingIdDisplay.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.pickupLocation && b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.dropLocation && b.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>My Trip History</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>View your past shuttle requests, active rides, and status details</p>
        </div>
        <button
          onClick={fetchHistory}
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
          Refresh History
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Booking ID or Location..."
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

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ON_GOING">On Going</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* History Table Container */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Fetching your shuttle trip history..." />
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <History size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: '600', fontSize: '1rem', color: '#334155' }}>No Trips Found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'You have not made any shuttle bookings yet.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                  <th style={{ padding: '12px 16px' }}>Booking ID</th>
                  <th style={{ padding: '12px 16px' }}>Date & Requested Pickup</th>
                  <th style={{ padding: '12px 16px' }}>From</th>
                  <th style={{ padding: '12px 16px' }}>To</th>
                  <th style={{ padding: '12px 16px' }}>Driver</th>
                  <th style={{ padding: '12px 16px' }}>Vehicle</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((row) => {
                  const canCancel = row.status === 'REQUESTED' || row.status === 'ACCEPTED';
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                        #{row.bookingIdDisplay}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>
                        {formatDate(row.requestedPickupTime)}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {row.pickupLocation || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {row.dropLocation || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {row.driverName ? `${row.driverName}` : 'Unassigned'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {row.vehicleLicensePlate ? `${row.vehicleModel || 'Shuttle'} (${row.vehicleLicensePlate})` : 'Unassigned'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {canCancel ? (
                          <button
                            onClick={() => setCancelModalBooking(row)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid #fecdd3',
                              background: '#fff1f2',
                              color: '#be123c',
                              fontWeight: '500',
                              fontSize: '0.8125rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      {cancelModalBooking && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Confirm Cancellation
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '20px' }}>
              Are you sure you want to cancel booking <strong>#{cancelModalBooking.bookingIdDisplay}</strong>? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelling}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Ride'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
