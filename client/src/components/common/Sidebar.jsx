import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Building2, Users, MessageCircle, Heart, Bell, Settings, LogOut, CheckCircle, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ role }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const links = {
    owner: [
      { to: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/owner/listings', label: 'My Listings', icon: <Building2 size={18} /> },
      { to: '/owner/interests', label: 'Interest Requests', icon: <Users size={18} /> },
      { to: '/owner/chat', label: 'Messages', icon: <MessageCircle size={18} /> },
      { to: '/owner/profile', label: 'Profile Settings', icon: <Settings size={18} /> },
    ],
    tenant: [
      { to: '/tenant/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/tenant/matches', label: 'My Matches', icon: <CheckCircle size={18} /> },
      { to: '/tenant/requests', label: 'My Requests', icon: <Users size={18} /> },
      { to: '/tenant/saved', label: 'Saved Rooms', icon: <Heart size={18} /> },
      { to: '/tenant/chat', label: 'Messages', icon: <MessageCircle size={18} /> },
      { to: '/tenant/profile', label: 'Profile Settings', icon: <Settings size={18} /> },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
      { to: '/admin/listings', label: 'Listings', icon: <Building2 size={18} /> },
    ],
  };

  const navLinks = links[role] || [];

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--navbar-height))' }}>
      <div style={{ padding: '0 var(--space-6) var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <img
            src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1F7A4D&color=fff`}
            alt=""
            className="avatar avatar-md"
          />
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-4)' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {navLinks.map(({ to, label, icon }) => {
            const isActive = location.pathname.startsWith(to) && (to !== `/${role}/dashboard` || location.pathname === to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: '0.625rem 1rem', borderRadius: 'var(--radius)',
                    color: isActive ? 'var(--primary)' : 'var(--text-2)',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    fontWeight: isActive ? 600 : 500, fontSize: 'var(--text-sm)',
                    textDecoration: 'none', transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                >
                  {icon} {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: 'var(--space-6)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            width: '100%', padding: '0.625rem 1rem', borderRadius: 'var(--radius)',
            color: 'var(--danger)', background: 'transparent', border: 'none',
            fontWeight: 500, fontSize: 'var(--text-sm)', cursor: 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-light)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
