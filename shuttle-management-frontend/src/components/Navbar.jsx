import React from 'react';
import { Bus, UserCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  // Retrieve user session from localStorage
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: '240px',
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '700', fontSize: '1.1rem' }}>
          <Bus size={24} />
          <span>MoveInSync</span>
        </div>
        <span style={{ color: '#cbd5e1' }}>|</span>
        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Campus Transit Portal</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCircle size={28} color="#2563eb" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                  {user.name || 'Campus User'}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: user.role === 'ADMIN' ? '#1e40af' : '#15803d',
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role || 'GUEST'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#fff1f2',
                color: '#be123c',
                border: '1px solid #fecdd3',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              fontSize: '0.8125rem',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
