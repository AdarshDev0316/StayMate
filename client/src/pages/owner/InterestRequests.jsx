import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, CheckCircle, XCircle, MessageCircle, Home, Sparkles, Loader2 } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ScoreBadge = ({ score }) => {
  if (!score) return <span className="badge badge-neutral">No Score</span>;
  const cls = score >= 80 ? 'success' : score >= 60 ? 'warning' : score >= 40 ? 'info' : 'danger';
  return (
    <span className={`badge badge-${cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Sparkles size={12} /> {score}% Match
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = { pending: 'warning', accepted: 'success', declined: 'danger' };
  return <span className={`badge badge-${map[status] || 'neutral'}`} style={{ textTransform: 'capitalize' }}>{status}</span>;
};

const InterestRequests = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'accepted' | 'declined'

  const fetchInterests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/interests/owner');
      setInterests(res.data.data.interests);
    } catch {
      toast.error('Failed to load interests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInterests(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/interests/${id}/${action}`);
      toast.success(`Interest ${action}ed successfully`);
      fetchInterests();
    } catch (err) {
      toast.error(`Failed to ${action} interest`);
    }
  };

  const filtered = interests.filter(i => i.status === filter);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="owner" />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Interest Requests</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Review tenants who want to rent your property</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content' }}>
          {['pending', 'accepted', 'declined'].map(val => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '0.4rem 1rem', borderRadius: 6, border: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', background: filter === val ? 'var(--primary)' : 'transparent', color: filter === val ? '#fff' : 'var(--text-muted)', transition: 'all var(--transition-fast)' }}>
              {val}
              {val === 'pending' && interests.filter(i => i.status === 'pending').length > 0 && (
                <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: 10, padding: '2px 6px' }}>{interests.filter(i => i.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {isLoading ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Users size={32} /></div>
                <h3>No {filter} requests</h3>
                <p>You have no {filter} interest requests at the moment.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Tenant</th><th>Listing</th><th>AI Match</th><th>Message</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(i => (
                    <tr key={i._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <img src={i.tenant?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(i.tenant?.name || 'U')}&background=E2E8F0`} alt="" className="avatar avatar-sm" />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{i.tenant?.name}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{i.tenant?.preferences?.gender || 'Any'}, {i.tenant?.preferences?.occupation || 'Any'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link to={`/listings/${i.listing?._id}`} style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                          <span style={{ display: 'block', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.listing?.title}</span>
                        </Link>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{i.listing?.location?.city}</span>
                      </td>
                      <td><ScoreBadge score={i.aiScore} /></td>
                      <td>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', maxWidth: 200, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {i.message || <i style={{ color: 'var(--text-faint)' }}>No message provided</i>}
                        </p>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{new Date(i.createdAt).toLocaleDateString()}</td>
                      <td>
                        {i.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleAction(i._id, 'accept')} title="Accept"><CheckCircle size={14} /> Accept</button>
                            <button className="btn btn-outline btn-sm" onClick={() => handleAction(i._id, 'decline')} title="Decline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}><XCircle size={14} /> Decline</button>
                          </div>
                        ) : i.status === 'accepted' ? (
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/owner/chat')}><MessageCircle size={14} /> Chat</button>
                        ) : (
                          <StatusBadge status={i.status} />
                        )}
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

export default InterestRequests;
