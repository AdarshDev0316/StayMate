import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, Archive, CheckCircle, Home, Loader2, MoreVertical } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = { active: ['badge-success', 'Active'], filled: ['badge-neutral', 'Filled'], archived: ['badge-warning', 'Archived'] };
  const [cls, label] = map[status] || ['badge-neutral', status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter) params.set('status', filter);
      const res = await api.get(`/listings/owner/my-listings?${params}`);
      setListings(res.data.data.listings);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load listings'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchListings(); }, [page, filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/listings/${id}/status`, { status });
      toast.success(`Listing marked as ${status}`);
      setOpenMenu(null);
      fetchListings();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
      fetchListings();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="owner" />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>My Listings</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{pagination.total} total listings</p>
          </div>
          <Link to="/owner/listings/create" className="btn btn-primary" style={{ gap: 8 }}>
            <PlusCircle size={18} /> Add New Listing
          </Link>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content' }}>
          {[['', 'All'], ['active', 'Active'], ['filled', 'Filled'], ['archived', 'Archived']].map(([val, label]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1); }}
              style={{ padding: '0.4rem 1rem', borderRadius: 6, border: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', background: filter === val ? 'var(--primary)' : 'transparent', color: filter === val ? '#fff' : 'var(--text-muted)', transition: 'all var(--transition-fast)' }}>
              {label}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {isLoading ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <Loader2 size={28} style={{ color: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Home size={32} /></div>
                <h3>No listings yet</h3>
                <p>{filter ? `No ${filter} listings.` : 'Create your first listing to get started.'}</p>
                <Link to="/owner/listings/create" className="btn btn-primary">Add Listing</Link>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Property</th><th>Rent</th><th>Available</th><th>Views</th><th>Interests</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <img src={l.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=60&fit=crop'} alt="" style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{l.location?.city} · {l.roomType}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{l.rent?.toLocaleString()}</td>
                      <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{new Date(l.availableFrom) <= new Date() ? 'Now' : new Date(l.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>{l.views || 0}</td>
                      <td>
                        {l.interestedCount || 0}
                        {l.pendingInterests > 0 && <span className="badge badge-warning" style={{ marginLeft: 6, fontSize: 10 }}>{l.pendingInterests} new</span>}
                      </td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => navigate(`/listings/${l._id}`)} title="View"><Eye size={15} /></button>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => navigate(`/owner/listings/${l._id}/edit`)} title="Edit"><Edit size={15} /></button>
                          <div style={{ position: 'relative' }}>
                            <button className="btn btn-ghost btn-icon-sm" onClick={() => setOpenMenu(openMenu === l._id ? null : l._id)} title="More"><MoreVertical size={15} /></button>
                            {openMenu === l._id && (
                              <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 50, minWidth: 160, overflow: 'hidden' }}>
                                {l.status !== 'active' && <button onClick={() => handleStatusChange(l._id, 'active')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1rem', width: '100%', background: 'none', border: 'none', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--success-dark)' }}><CheckCircle size={14} /> Mark Active</button>}
                                {l.status !== 'filled' && <button onClick={() => handleStatusChange(l._id, 'filled')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1rem', width: '100%', background: 'none', border: 'none', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--text-muted)' }}><CheckCircle size={14} /> Mark Filled</button>}
                                {l.status !== 'archived' && <button onClick={() => handleStatusChange(l._id, 'archived')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1rem', width: '100%', background: 'none', border: 'none', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--warning-dark)' }}><Archive size={14} /> Archive</button>}
                                <button onClick={() => handleDelete(l._id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1rem', width: '100%', background: 'none', border: 'none', fontSize: 'var(--text-sm)', cursor: 'pointer', color: 'var(--danger)', borderTop: '1px solid var(--border)' }}><Trash2 size={14} /> Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {!isLoading && pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 'var(--space-6)' }}>
            <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setPage(pg)} className={`btn btn-sm ${page === pg ? 'btn-primary' : 'btn-ghost'}`} style={{ minWidth: 36 }}>{pg}</button>
            ))}
            <button className="btn btn-outline btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyListings;
