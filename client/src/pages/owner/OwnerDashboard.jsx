import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Home, Eye, Users, TrendingUp, MoreVertical, Edit, Archive, MessageCircle, Loader2 } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color = 'var(--primary)', bg = 'var(--primary-light)', trend }) => (
  <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div className="stat-value" style={{ fontSize: 'var(--text-2xl)' }}>{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {trend !== undefined && (
        <div style={{ fontSize: 11, color: trend >= 0 ? 'var(--success-dark)' : 'var(--danger)', marginTop: 2, fontWeight: 600 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} this week
        </div>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = { active: 'badge-success', filled: 'badge-neutral', archived: 'badge-warning' };
  return <span className={`badge ${map[status] || 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>{status}</span>;
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [listRes] = await Promise.all([
          api.get('/listings/owner/my-listings?limit=5'),
        ]);
        const ls = listRes.data.data.listings;
        setListings(ls);
        const active = ls.filter(l => l.status === 'active').length;
        const totalViews = ls.reduce((s, l) => s + (l.views || 0), 0);
        const totalInterests = ls.reduce((s, l) => s + (l.interestedCount || 0), 0);
        const pendingInterests = ls.reduce((s, l) => s + (l.pendingInterests || 0), 0);
        setStats({ total: listRes.data.data.pagination?.total || ls.length, active, totalViews, pendingInterests });
      } catch { toast.error('Failed to load dashboard data'); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="owner" />
      <main className="main-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Welcome back! Here's what's happening with your listings.</p>
          </div>
          <Link to="/owner/listings/create" className="btn btn-primary" style={{ gap: 8 }}>
            <PlusCircle size={18} /> Add New Listing
          </Link>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
            <StatCard label="Total Rooms" value={stats?.total} icon={<Home size={24} />} />
            <StatCard label="Active Listings" value={stats?.active} icon={<TrendingUp size={24} />} color="var(--secondary)" bg="var(--secondary-light)" />
            <StatCard label="Total Views" value={stats?.totalViews} icon={<Eye size={24} />} color="var(--warning)" bg="var(--warning-light)" />
            <StatCard label="Pending Interests" value={stats?.pendingInterests} icon={<Users size={24} />} color="var(--danger)" bg="var(--danger-light)" />
          </div>
        )}

        {/* Recent Listings */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>My Listings</h2>
            <Link to="/owner/listings" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            {isLoading ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                <div className="empty-state-icon"><Home size={32} /></div>
                <h3>No listings yet</h3>
                <p>Create your first listing to start finding tenants.</p>
                <Link to="/owner/listings/create" className="btn btn-primary">Add Listing</Link>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Rent</th>
                    <th>Views</th>
                    <th>Interests</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(listing => (
                    <tr key={listing._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <img
                            src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=60&fit=crop'}
                            alt=""
                            style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 'var(--radius)' }}
                          />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{listing.title}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{listing.location?.city} · {listing.roomType}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{listing.rent?.toLocaleString()}</td>
                      <td>{listing.views || 0}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{listing.interestedCount || 0}</span>
                        {listing.pendingInterests > 0 && (
                          <span className="badge badge-warning" style={{ marginLeft: 6, fontSize: 10 }}>{listing.pendingInterests} new</span>
                        )}
                      </td>
                      <td><StatusBadge status={listing.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => navigate(`/owner/listings/${listing._id}/edit`)} title="Edit">
                            <Edit size={15} />
                          </button>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => navigate('/owner/interests')} title="Interests">
                            <MessageCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
          <Link to="/owner/interests" style={{ textDecoration: 'none' }}>
            <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="var(--warning-dark)" />
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>Interest Requests</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>View & respond to tenant interests</p>
              </div>
            </div>
          </Link>
          <Link to="/owner/chat" style={{ textDecoration: 'none' }}>
            <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={20} color="var(--secondary)" />
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>Messages</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Chat with your tenants</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
