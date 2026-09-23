import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, AlertCircle, Edit, MapPin, Clock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/routes');
      setRoutes(response.data);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err.response?.data?.message || 'Failed to fetch routes from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRoute(null);
    setName('');
    setPickupLocation('');
    setDropLocation('');
    setEstimatedMinutes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (route) => {
    setEditingRoute(route);
    setName(route.name || '');
    setPickupLocation(route.pickupLocation || '');
    setDropLocation(route.dropLocation || '');
    setEstimatedMinutes(route.estimatedMinutes ? route.estimatedMinutes.toString() : '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!name.trim()) {
      setFormError('Route name is required.');
      return;
    }
    if (!pickupLocation.trim()) {
      setFormError('Pickup location is required.');
      return;
    }
    if (!dropLocation.trim()) {
      setFormError('Drop location is required.');
      return;
    }

    const minutesNum = parseInt(estimatedMinutes, 10);
    if (isNaN(minutesNum) || minutesNum <= 0) {
      setFormError('Estimated travel time must be a positive number of minutes.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      pickupLocation: pickupLocation.trim(),
      dropLocation: dropLocation.trim(),
      estimatedMinutes: minutesNum,
    };

    try {
      if (editingRoute) {
        await axiosClient.put(`/routes/${editingRoute.id}`, payload);
      } else {
        await axiosClient.post('/routes', payload);
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save route. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Route Management</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Configure campus pickup and drop-off shuttle routes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchRoutes}
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
            Refresh Routes
          </button>
          <button
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Add Route
          </button>
        </div>
      </div>

      {/* Error Alert */}
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

      {/* Route List Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Fetching campus route configurations..." />
        ) : routes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <MapPin size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: '600', fontSize: '1rem', color: '#334155' }}>No Routes Found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Click "Add Route" to create the first shuttle route.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                  <th style={{ padding: '12px 16px' }}>Route ID</th>
                  <th style={{ padding: '12px 16px' }}>Route Name</th>
                  <th style={{ padding: '12px 16px' }}>From / Pickup Location</th>
                  <th style={{ padding: '12px 16px' }}>To / Drop Location</th>
                  <th style={{ padding: '12px 16px' }}>Est. Travel Time</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr
                    key={route.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                      #{route.id}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#334155' }}>
                      {route.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="#2563eb" />
                        {route.pickupLocation}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="#16a34a" />
                        {route.dropLocation}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#64748b" />
                        {route.estimatedMinutes ? `${route.estimatedMinutes} mins` : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenEditModal(route)}
                        style={{
                          padding: '5px 12px',
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
                        <Edit size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Route Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRoute ? 'Edit Route Details' : 'Create New Route'}
        >
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}
              >
                {formError}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                Route Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Express Campus Loop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                Pickup Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Library Entrance"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                Drop Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Science Complex"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                Estimated Travel Time (Minutes) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Saving Route...' : editingRoute ? 'Update Route' : 'Create Route'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
