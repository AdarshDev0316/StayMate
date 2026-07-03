import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, MapPin, Loader2, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/interests/tenant').then(res => {
      setRequests(res.data.data.interests);
    }).finally(() => setIsLoading(false));
  }, []);

  const getStatusInfo = (status) => {
    if (status === 'pending') return { icon: <Clock size={16} />, color: 'var(--warning-dark)', bg: 'var(--warning-light)', label: 'Pending Response' };
    if (status === 'accepted') return { icon: <CheckCircle size={16} />, color: 'var(--success-dark)', bg: 'var(--success-light)', label: 'Accepted' };
    if (status === 'declined') return { icon: <XCircle size={16} />, color: 'var(--danger-dark)', bg: 'var(--danger-light)', label: 'Declined' };
    return { icon: null, color: 'gray', bg: '#f1f5f9', label: status };
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="tenant" />
      <main className="main-content">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>My Requests</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Track properties you've sent interest to</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content' }}>
          {['all', 'pending', 'accepted', 'declined'].map(val => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '0.4rem 1rem', borderRadius: 6, border: 'none', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', background: filter === val ? 'var(--primary)' : 'transparent', color: filter === val ? '#fff' : 'var(--text-muted)', transition: 'all var(--transition-fast)' }}>
              {val}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}><Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Send size={32} /></div>
            <h3>No requests found</h3>
            <p>{filter === 'all' ? 'You haven\'t sent interest to any properties yet.' : `No ${filter} requests.`}</p>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Rooms</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-5)' }}>
            {filtered.map(req => {
              const status = getStatusInfo(req.status);
              return (
                <div key={req._id} className="card card-body" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <img src={req.listing?.images?.[0]?.url || 'https://via.placeholder.com/100'} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/listings/${req.listing?._id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                        <h4 style={{ fontWeight: 700, fontSize: 'var(--text-base)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.listing?.title}</h4>
                      </Link>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{req.listing?.location?.city}</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>₹{req.listing?.rent?.toLocaleString()}/mo</p>
                    </div>
                  </div>

                  <div style={{ padding: 'var(--space-3)', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 'var(--space-4)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 2 }}>Your Message:</span>
                    <span style={{ fontStyle: 'italic' }}>"{req.message || 'I am interested in this property.'}"</span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: status.color, background: status.bg, padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 700 }}>
                      {status.icon} {status.label}
                    </div>
                    
                    {req.status === 'accepted' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tenant/chat')}>
                        <MessageCircle size={14} /> Chat with Owner
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRequests;
