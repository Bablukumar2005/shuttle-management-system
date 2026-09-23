import React, { useState, useEffect } from 'react';
import { X, User, Bus, MapPin, Shield, Edit2, LogIn, UserX, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import axiosClient from '../api/axiosClient';

export default function BookingDetailsDrawer({ isOpen, onClose, booking, onBookingUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Edit form options state
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Edit form selection state
  const [editDriverId, setEditDriverId] = useState('');
  const [editVehicleId, setEditVehicleId] = useState('');
  const [editRouteId, setEditRouteId] = useState('');
  const [editRequestedTime, setEditRequestedTime] = useState('');
  const [editPlannedDropTime, setEditPlannedDropTime] = useState('');

  useEffect(() => {
    if (booking) {
      setEditDriverId(booking.driverId || '');
      setEditVehicleId(booking.vehicleId || '');
      setEditRouteId(booking.routeId || '');
      setEditRequestedTime(booking.requestedPickupTime ? booking.requestedPickupTime.substring(0, 16) : '');
      setEditPlannedDropTime(booking.plannedDropTime ? booking.plannedDropTime.substring(0, 16) : '');
    }
    setIsEditing(false);
    setActionError(null);
  }, [booking]);

  const loadDropdownOptions = async () => {
    try {
      const [driversRes, vehiclesRes, routesRes] = await Promise.all([
        axiosClient.get('/drivers'),
        axiosClient.get('/vehicles'),
        axiosClient.get('/routes'),
      ]);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setRoutes(routesRes.data);
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    }
  };

  const handleStartEdit = () => {
    loadDropdownOptions();
    setIsEditing(true);
    setActionError(null);
  };

  if (!isOpen || !booking) return null;

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  const formatDate = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return timeStr;
    }
  };

  // Action Handlers
  const handleSignInRider = async () => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await axiosClient.post(`/bookings/${booking.id}/sign-in`);
      if (onBookingUpdated) await onBookingUpdated(booking.id);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to sign in rider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!window.confirm('Are you sure you want to mark this rider as No-Show?')) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await axiosClient.post(`/bookings/${booking.id}/no-show`);
      if (onBookingUpdated) await onBookingUpdated(booking.id);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to mark as No-Show');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await axiosClient.post(`/bookings/${booking.id}/cancel`);
      if (onBookingUpdated) await onBookingUpdated(booking.id);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTrip = async () => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await axiosClient.post(`/bookings/${booking.id}/complete`);
      if (onBookingUpdated) await onBookingUpdated(booking.id);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to complete trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);

    const payload = {
      driverId: editDriverId ? Number(editDriverId) : null,
      vehicleId: editVehicleId ? Number(editVehicleId) : null,
      routeId: editRouteId ? Number(editRouteId) : null,
      requestedPickupTime: editRequestedTime ? editRequestedTime : null,
      plannedDropTime: editPlannedDropTime ? editPlannedDropTime : null,
    };

    try {
      await axiosClient.put(`/bookings/${booking.id}`, payload);
      setIsEditing(false);
      if (onBookingUpdated) await onBookingUpdated(booking.id);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = booking.status;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="booking-drawer-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Booking Details</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>ID: {booking.bookingIdDisplay}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#991b1b', padding: '12px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{actionError}</span>
          </div>
        )}

        {/* Drawer Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

          {/* Rider / Employee Info Card */}
          <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  <User size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>{booking.employeeName || 'Unknown Employee'}</h4>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Emp ID: {booking.employeeEmpId || booking.employeeId || 'N/A'}</span>
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Requested Date:</span>
              <span style={{ fontWeight: '500', color: '#334155' }}>{formatDate(booking.requestedPickupTime)}</span>
            </div>
          </div>

          {/* EDIT FORM MODE */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>Edit Assignment & Times</h4>
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Route</label>
                <select
                  value={editRouteId}
                  onChange={(e) => setEditRouteId(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="">-- Select Route --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.pickupLocation} → {r.dropLocation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Assign Driver</label>
                <select
                  value={editDriverId}
                  onChange={(e) => setEditDriverId(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="">-- Select Driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Assign Vehicle</label>
                <select
                  value={editVehicleId}
                  onChange={(e) => setEditVehicleId(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.licensePlate} ({v.model} - {v.capacity} seats)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Requested Pickup Time</label>
                <input
                  type="datetime-local"
                  value={editRequestedTime}
                  onChange={(e) => setEditRequestedTime(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Planned Drop Time</label>
                <input
                  type="datetime-local"
                  value={editPlannedDropTime}
                  onChange={(e) => setEditPlannedDropTime(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW DETAILS MODE */
            <>
              {/* Route Timeline */}
              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#2563eb" /> Route ({booking.routeName || 'Campus Route'})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
                  <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#cbd5e1' }} />

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>{booking.pickupLocation || 'Pickup Point'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Requested: {formatTime(booking.requestedPickupTime)}
                      {booking.actualPickupTime && <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: '500' }}>Actual: {formatTime(booking.actualPickupTime)}</span>}
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>{booking.dropLocation || 'Drop-off Point'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Planned Drop: {formatTime(booking.plannedDropTime)}
                      {booking.actualDropTime && <span style={{ marginLeft: '8px', color: '#16a34a', fontWeight: '500' }}>Actual Drop: {formatTime(booking.actualDropTime)}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Specs */}
              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bus size={16} color="#2563eb" /> Assigned Vehicle
                </h4>
                {booking.vehicleLicensePlate ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8125rem' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>License Plate:</span>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{booking.vehicleLicensePlate}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Model:</span>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{booking.vehicleModel || 'Standard Shuttle'}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>No vehicle assigned yet</div>
                )}
              </div>

              {/* Driver Info */}
              <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="#2563eb" /> Assigned Driver
                </h4>
                {booking.driverName ? (
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>{booking.driverName}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Phone: {booking.driverPhone || 'N/A'}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>No driver assigned yet</div>
                )}
              </div>
            </>
          )}

        </div>

        {/* STATUS-BASED ACTION BUTTONS FOOTER */}
        {!isEditing && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* Primary Status Lifecycle Actions */}
            {status === 'ACCEPTED' && (
              <button
                onClick={handleSignInRider}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <LogIn size={18} />
                {isSubmitting ? 'Processing...' : 'Sign in rider'}
              </button>
            )}

            {status === 'ON_GOING' && (
              <button
                onClick={handleCompleteTrip}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: '600',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={18} />
                {isSubmitting ? 'Completing...' : 'Complete Trip'}
              </button>
            )}

            {/* Secondary Action Controls */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(status === 'REQUESTED' || status === 'ACCEPTED') && (
                <button
                  onClick={handleStartEdit}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}

              {(status === 'REQUESTED' || status === 'ACCEPTED') && (
                <button
                  onClick={handleMarkNoShow}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#9333ea',
                    border: '1px solid #9333ea',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <UserX size={16} />
                  Mark No-Show
                </button>
              )}

              {(status === 'REQUESTED' || status === 'ACCEPTED') && (
                <button
                  onClick={handleCancelBooking}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
