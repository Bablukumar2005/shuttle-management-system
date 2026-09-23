import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, Car, User } from 'lucide-react';
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

export default function EmployeeBookPage() {
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  
  // Datetime input helper (YYYY-MM-DDTHH:MM)
  const getInitialPickupTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [requestedPickupTime, setRequestedPickupTime] = useState(getInitialPickupTime());
  
  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Active / Current Booking state
  const [activeBooking, setActiveBooking] = useState(null);
  const [loadingActiveBooking, setLoadingActiveBooking] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Load routes & active booking on mount
  useEffect(() => {
    fetchRoutes();
    fetchActiveBooking();
  }, []);

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const response = await axiosClient.get('/routes');
      setRoutes(response.data);
      if (response.data.length > 0) {
        setSelectedRouteId(response.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const fetchActiveBooking = async () => {
    setLoadingActiveBooking(true);
    try {
      const currentUser = getLoggedInUser();
      const empId = currentUser?.id || 2;
      const response = await axiosClient.get('/bookings');
      const empBookings = response.data.filter((b) => b.employeeId === empId);
      // Find latest active booking (REQUESTED, ACCEPTED, ON_GOING)
      const current = empBookings.find(
        (b) => b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'ON_GOING'
      );
      setActiveBooking(current || null);
    } catch (err) {
      console.error('Error fetching active booking:', err);
    } finally {
      setLoadingActiveBooking(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) {
      setSubmitError('Please select a valid route.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setCreatedBooking(null);

    try {
      const currentUser = getLoggedInUser();
      const payload = {
        employeeId: currentUser?.id || 2,
        routeId: parseInt(selectedRouteId, 10),
        requestedPickupTime: requestedPickupTime ? new Date(requestedPickupTime).toISOString() : new Date().toISOString(),
      };

      const response = await axiosClient.post('/bookings', payload);
      setCreatedBooking(response.data);
      setActiveBooking(response.data);
    } catch (err) {
      console.error('Error creating booking:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const response = await axiosClient.post(`/bookings/${cancelModalBooking.id}/cancel`);
      if (activeBooking && activeBooking.id === cancelModalBooking.id) {
        setActiveBooking(response.data);
      }
      if (createdBooking && createdBooking.id === cancelModalBooking.id) {
        setCreatedBooking(response.data);
      }
      setCancelModalBooking(null);
      fetchActiveBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '-';
    try {
      return new Date(dtStr).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return dtStr;
    }
  };

  const selectedRouteObj = routes.find((r) => r.id.toString() === selectedRouteId);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Book a Shuttle Ride</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Request shuttle transportation across campus locations</p>
        </div>
        <button
          onClick={() => {
            fetchRoutes();
            fetchActiveBooking();
          }}
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
          Refresh Status
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Booking Form */}
        <div>
          <div className="card" style={{ padding: '24px' }}>
            <h3 className="card-title" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>
              Request New Booking
            </h3>

            {submitError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
            )}

            {loadingRoutes ? (
              <LoadingSpinner message="Loading available routes & pickup locations..." />
            ) : routes.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '16px 0' }}>
                No routes available in system. Please contact admin.
              </div>
            ) : (
              <form onSubmit={handleBookSubmit}>
                {/* Select Route / Location */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Select Route / Journey
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.pickupLocation} → {r.dropLocation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* From / Pickup Location */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    From / Pickup Location
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      fontWeight: '500',
                    }}
                  >
                    <MapPin size={16} color="#2563eb" />
                    <span>{selectedRouteObj ? selectedRouteObj.pickupLocation : 'Select a route'}</span>
                  </div>
                </div>

                {/* To / Drop Location */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    To / Drop Location
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      fontWeight: '500',
                    }}
                  >
                    <MapPin size={16} color="#16a34a" />
                    <span>{selectedRouteObj ? selectedRouteObj.dropLocation : 'Select a route'}</span>
                  </div>
                </div>

                {/* Requested Pickup Time */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Requested Pickup Time
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="datetime-local"
                      value={requestedPickupTime}
                      onChange={(e) => setRequestedPickupTime(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Form Action Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: submitting ? '#93c5fd' : '#2563eb',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.9375rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {submitting ? (
                    <span>Processing Booking...</span>
                  ) : (
                    <span>Submit Booking Request</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Active / Current Ride Information */}
        <div>
          {/* Success Banner if booking just created */}
          {createdBooking && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#15803d', fontSize: '0.95rem' }}>
                  Booking Created Successfully!
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#166534' }}>
                  Your shuttle request #{createdBooking.bookingIdDisplay} is now set to{' '}
                  <strong>{createdBooking.status}</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Current Ride Information Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                Current Ride / Booking
              </h3>
              {activeBooking && <StatusBadge status={activeBooking.status} />}
            </div>

            {loadingActiveBooking ? (
              <LoadingSpinner message="Checking active bookings..." />
            ) : !activeBooking ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                <Calendar size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <p style={{ fontWeight: '500', color: '#334155', margin: '4px 0' }}>No Active Booking</p>
                <p style={{ fontSize: '0.85rem' }}>Use the form on the left to request a shuttle ride.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Booking ID & Status */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                      Booking ID
                    </span>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                      #{activeBooking.bookingIdDisplay}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                      Rider
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', margin: 0 }}>
                      {activeBooking.employeeName || 'Thompson'}
                    </p>
                  </div>
                </div>

                {/* Route Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      From (Pickup)
                    </span>
                    <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                      {activeBooking.pickupLocation || '-'}
                    </strong>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      To (Drop)
                    </span>
                    <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                      {activeBooking.dropLocation || '-'}
                    </strong>
                  </div>
                </div>

                {/* Timing Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      Requested Pickup
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>
                      {formatDateTime(activeBooking.requestedPickupTime)}
                    </span>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      Planned Drop
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>
                      {formatDateTime(activeBooking.plannedDropTime)}
                    </span>
                  </div>
                </div>

                {/* Driver & Vehicle */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <User size={16} color="#64748b" />
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Driver:</strong> {activeBooking.driverName ? `${activeBooking.driverName} (${activeBooking.driverPhone || ''})` : 'Not yet assigned'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Car size={16} color="#64748b" />
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Vehicle:</strong> {activeBooking.vehicleLicensePlate ? `${activeBooking.vehicleModel || 'Shuttle'} - ${activeBooking.vehicleLicensePlate}` : 'Not yet assigned'}
                    </span>
                  </div>
                </div>

                {/* Cancel Booking Action */}
                {(activeBooking.status === 'REQUESTED' || activeBooking.status === 'ACCEPTED') && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      onClick={() => setCancelModalBooking(activeBooking)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #fecdd3',
                        backgroundColor: '#fff1f2',
                        color: '#be123c',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <XCircle size={16} />
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Cancel Booking */}
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
