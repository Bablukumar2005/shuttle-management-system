import React from 'react';

export default function Button({ children, onClick, variant = 'primary', size = 'medium', disabled = false, type = 'button', style = {} }) {
  const baseStyle = {
    fontFamily: 'inherit',
    fontWeight: '500',
    borderRadius: '6px',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
  };

  const sizes = {
    small: { padding: '4px 10px', fontSize: '0.8125rem' },
    medium: { padding: '8px 16px', fontSize: '0.875rem' },
    large: { padding: '10px 20px', fontSize: '1rem' },
  };

  const variants = {
    primary: { background: '#2563eb', color: '#ffffff', border: '#2563eb' },
    secondary: { background: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
    danger: { background: '#ef4444', color: '#ffffff', border: '#ef4444' },
    outline: { background: 'transparent', color: '#2563eb', border: '#2563eb' },
    warning: { background: '#f59e0b', color: '#ffffff', border: '#f59e0b' },
  };

  const currentSize = sizes[size] || sizes.medium;
  const currentVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
