import React from 'react';

const statusStyles = {
  REQUESTED: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', label: 'Requested' },
  ACCEPTED: { bg: '#dcfce7', color: '#15803d', border: '#86efac', label: 'Accepted' },
  ON_GOING: { bg: '#fef3c7', color: '#b45309', border: '#fde68a', label: 'On Going' },
  COMPLETED: { bg: '#d1fae5', color: '#047857', border: '#6ee7b7', label: 'Completed' },
  CANCELLED: { bg: '#ffe4e6', color: '#be123c', border: '#fecdd3', label: 'Cancelled' },
  NO_SHOW: { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff', label: 'No Show' },
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: status };

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      {style.label}
    </span>
  );
}
