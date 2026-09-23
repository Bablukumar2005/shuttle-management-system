import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import axiosClient from '../api/axiosClient';

export default function AddScheduleModal({ isOpen, onClose, driverId, selectedDate, onScheduleAdded }) {
  const [dutyStart, setDutyStart] = useState('06:00');
  const [dutyEnd, setDutyEnd] = useState('18:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!dutyStart || !dutyEnd) {
      setError('Duty start and end times are required');
      return;
    }

    if (dutyStart >= dutyEnd) {
      setError('Duty start time must be before duty end time');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        scheduleDate: selectedDate || '2026-09-22',
        dutyStart: `${dutyStart}:00`,
        dutyEnd: `${dutyEnd}:00`,
      };
      await axiosClient.post(`/drivers/${driverId}/schedule`, payload);
      if (onScheduleAdded) await onScheduleAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add duty schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Driver Duty Shift (Start Duty)">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
            Duty Start Time
          </label>
          <input
            type="time"
            value={dutyStart}
            onChange={(e) => setDutyStart(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
            Duty End Time
          </label>
          <input
            type="time"
            value={dutyEnd}
            onChange={(e) => setDutyEnd(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Starting Duty...' : 'Start Duty Shift'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
