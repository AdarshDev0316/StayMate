import React, { useState, useEffect } from 'react';
import { Building2, Search, Trash2, Eye, Shield, Loader2, Ban } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ListingManagement = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/listings?search=${search}`);
      setListings(res.data.data.listings);
    } catch { toast.error('Failed to fetch listings'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchListings(); }, [search]);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this listing?`)) return;
    try {
      await api.patch(`/admin/listings/${id}`, { action });
      toast.success(`Listing ${action}ed`);
      fetchListings();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="admin" />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Listing Management</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Monitor and moderate property listings</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div className="input-with-icon" style={{ flex: 1, maxWidth: 400 }}>
              <Search size={16} />
              <input type="text" className="input" placeholder="Search by title or city..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {isLoading ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} /></div>
            ) : listings.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>No listings found</div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Property</th><th>Owner</th><th>Rent</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <img src={l.images?.[0]?.url || 'https://via.placeholder.com/80'} alt="" style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{l.location?.city}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <img src={l.owner?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.owner?.name || 'U')}`} alt="" className="avatar avatar-sm" />
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{l.owner?.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{l.rent?.toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${l.status === 'active' ? 'success' : l.status === 'archived' ? 'warning' : 'neutral'}`}>{l.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Link to={`/listings/${l._id}`} className="btn btn-ghost btn-icon-sm" target="_blank" title="View"><Eye size={15} /></Link>
                          {l.status !== 'archived' && (
                            <button className="btn btn-outline btn-sm" onClick={() => handleAction(l._id, 'archive')} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}><Ban size={14} /> Takedown</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListingManagement;
