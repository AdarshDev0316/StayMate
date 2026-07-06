import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bell, Menu, X, ChevronDown, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount, notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  const getAvatar = () => {
    if (user?.avatar?.url) return user.avatar.url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4C5CE7&color=fff&size=128`;
  };

  return (
    <nav className={`navbar${isScrolled || !isLanding ? ' scrolled' : ''}`} style={{ position: isLanding ? 'fixed' : 'sticky', top: 0, left: 0, right: 0, zIndex: 'var(--z-navbar)', transition: 'all var(--transition)', background: isScrolled || !isLanding ? 'var(--surface)' : 'transparent', borderBottom: isScrolled || !isLanding ? '1px solid var(--border)' : 'none', boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--navbar-height)', gap: 'var(--space-6)' }}>

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
          <img src="/logo.jpg" alt="StayMate" style={{ height: '36px', objectFit: 'contain', borderRadius: '4px' }} />
        </Link>

        {/* ── Desktop Nav Links ─────────────────────────────────────────────── */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          {[
            { to: '/browse', label: 'Browse' },
            { to: '/#how-it-works', label: 'How It Works' },
            { to: '/#about', label: 'About' },
          ].map(({ to, label }) => (
            <Link key={label} to={to} style={{
              padding: '0.4rem 0.875rem',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: isScrolled || !isLanding ? 'var(--text-muted)' : 'rgba(255,255,255,0.85)',
              transition: 'all var(--transition-fast)',
              textDecoration: 'none',
            }}
              onMouseEnter={e => { e.target.style.background = isScrolled || !isLanding ? 'var(--bg-2)' : 'rgba(255,255,255,0.1)'; e.target.style.color = isScrolled || !isLanding ? 'var(--text)' : '#fff'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = isScrolled || !isLanding ? 'var(--text-muted)' : 'rgba(255,255,255,0.85)'; }}
              onClick={(e) => {
                if (to.includes('#')) {
                  const id = to.split('#')[1];
                  const element = document.getElementById(id);
                  if (element) {
                    e.preventDefault();
                    element.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', to);
                  }
                }
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Right Side ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginLeft: 'auto' }}>
          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  id="notif-bell"
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                  style={{
                    width: 40, height: 40, borderRadius: 'var(--radius)', border: `1px solid ${isScrolled || !isLanding ? 'var(--border)' : 'rgba(255,255,255,0.2)'}`,
                    background: isScrolled || !isLanding ? 'var(--surface)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', transition: 'all var(--transition-fast)',
                    color: isScrolled || !isLanding ? 'var(--text-muted)' : '#fff',
                  }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--danger)', color: '#fff',
                      borderRadius: 'var(--radius-full)', fontSize: 10,
                      fontWeight: 700, minWidth: 18, height: 18,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid var(--surface)',
                      animation: 'notificationPop 0.3s var(--transition-spring)',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    width: 340, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)', zIndex: 'var(--z-dropdown)',
                    overflow: 'hidden', animation: 'fadeInDown 0.2s ease',
                  }}>
                    <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={() => useNotificationStore.getState().markAllAsRead()} style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 8).map(notif => (
                          <div
                            key={notif._id}
                            onClick={() => markAsRead(notif._id)}
                            style={{
                              padding: 'var(--space-3) var(--space-5)',
                              borderBottom: '1px solid var(--border)',
                              background: notif.isRead ? 'transparent' : 'var(--primary-light)',
                              cursor: 'pointer', transition: 'background var(--transition-fast)',
                            }}
                          >
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: notif.isRead ? 'transparent' : 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
                              <div>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{notif.title}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.4 }}>{notif.body}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  id="profile-btn"
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: '0.375rem 0.625rem', borderRadius: 'var(--radius)',
                    border: `1px solid ${isScrolled || !isLanding ? 'var(--border)' : 'rgba(255,255,255,0.2)'}`,
                    background: isScrolled || !isLanding ? 'var(--surface)' : 'rgba(255,255,255,0.1)',
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                  }}
                >
                  <img src={getAvatar()} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: isScrolled || !isLanding ? 'var(--text)' : '#fff', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color={isScrolled || !isLanding ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)'} style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform var(--transition-fast)' }} />
                </button>

                {isProfileOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    width: 220, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)', zIndex: 'var(--z-dropdown)',
                    overflow: 'hidden', animation: 'fadeInDown 0.2s ease',
                  }}>
                    <div style={{ padding: 'var(--space-4) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)' }}>{user.name}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</p>
                      <span className="badge badge-primary" style={{ marginTop: 'var(--space-2)', textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                    {[
                      { icon: <LayoutDashboard size={15} />, label: 'Dashboard', to: getDashboardLink() },
                      { icon: <User size={15} />, label: 'Profile', to: `/${user.role}/profile` },
                    ].map(({ icon, label, to }) => (
                      <Link key={label} to={to} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-2)', textDecoration: 'none', transition: 'background var(--transition-fast)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {icon} {label}
                      </Link>
                    ))}
                    <button
                      onClick={logout}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--danger)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--border)', transition: 'background var(--transition-fast)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/owner/login" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: isScrolled || !isLanding ? 'var(--text-muted)' : 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '0.5rem 1rem', transition: 'color var(--transition-fast)' }}>
                Login
              </Link>
              <Link to="/tenant/register" className="btn btn-primary btn-sm">
                Sign Up Free
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{ display: 'none', padding: 'var(--space-2)', borderRadius: 'var(--radius)', background: 'transparent', border: 'none', cursor: 'pointer', color: isScrolled || !isLanding ? 'var(--text)' : '#fff' }}
            className="mobile-menu-btn"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Link to="/browse" style={{ padding: 'var(--space-3)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Browse Listings</Link>
          <Link to="/#how-it-works" style={{ padding: 'var(--space-3)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>How It Works</Link>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-3)' }}>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>Dashboard</Link>
                <button onClick={logout} className="btn btn-danger btn-sm" style={{ flex: 1 }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/owner/login" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>Login</Link>
                <Link to="/tenant/register" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
