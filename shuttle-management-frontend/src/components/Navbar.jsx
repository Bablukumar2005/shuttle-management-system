import React from 'react';
import { Bus, UserCircle, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleMobileSidebar }) {
  const navigate = useNavigate();

  // Retrieve user session from localStorage
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '700', fontSize: '1.1rem' }}>
          <Bus size={24} />
          <span>MoveInSync</span>
        </div>
        <span className="header-portal-title" style={{ color: '#cbd5e1' }}>|</span>
        <span className="header-portal-title" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Campus Transit Portal</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle size={26} color="#2563eb" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0f172a' }}>
                  {user.name || 'Campus User'}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
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
                gap: '4px',
                fontSize: '0.8125rem',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: '#fff1f2',
                color: '#be123c',
                border: '1px solid #fecdd3',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              <span className="header-portal-title">Logout</span>
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
