import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import axiosClient from '../api/axiosClient';

export default function AddBreakModal({ isOpen, onClose, driverId, scheduleId, onBreakAdded }) {
  const [breakStart, setBreakStart] = useState('12:00');
  const [breakEnd, setBreakEnd] = useState('13:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!breakStart || !breakEnd) {
      setError('Break start and end times are required');
      return;
    }

    if (breakStart >= breakEnd) {
      setError('Break start time must be before break end time');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        breakStart: `${breakStart}:00`,
        breakEnd: `${breakEnd}:00`,
      };
      await axiosClient.post(`/drivers/${driverId}/schedule/${scheduleId}/breaks`, payload);
      if (onBreakAdded) await onBreakAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add driver break');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Driver Break">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
            Break Start Time
          </label>
          <input
            type="time"
            value={breakStart}
            onChange={(e) => setBreakStart(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
            Break End Time
          </label>
          <input
            type="time"
            value={breakEnd}
            onChange={(e) => setBreakEnd(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Break...' : 'Save Break'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
