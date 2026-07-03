import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Heart, MessageCircle, Home, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState([]);
  const [interests, setInterests] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [isLoadingInts, setIsLoadingInts] = useState(true);

  useEffect(() => {
    // Fetch AI Recommendations
    api.get('/ai/recommendations?limit=3').then(res => {
      setRecommendations(res.data.data.recommendations);
    }).finally(() => setIsLoadingRecs(false));

    // Fetch Recent Interests
    api.get('/interests/tenant').then(res => {
      setInterests(res.data.data.interests.slice(0, 3));
    }).finally(() => setIsLoadingInts(false));
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'var(--success-light)', text: 'var(--success-dark)' };
    if (score >= 60) return { bg: '#FEF9C3', text: '#D97706' };
    if (score >= 40) return { bg: 'var(--info-light)', text: '#0E7490' };
    return { bg: 'var(--danger-light)', text: 'var(--danger-dark)' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="tenant" />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Tenant Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Welcome back, {user?.name.split(' ')[0]}!</p>
          </div>
          <Link to="/browse" className="btn btn-secondary" style={{ gap: 8 }}>
            <Search size={18} /> Find Rooms
          </Link>
        </div>

        {/* AI Action Banner */}
        {(!user?.preferences?.city || !user?.preferences?.budgetMax) && (
          <div style={{ background: 'linear-gradient(135deg, rgba(8,176,148,0.1), rgba(76,92,231,0.1))', border: '1px solid var(--secondary)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={18} color="var(--secondary)" /> Complete Your Profile</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginTop: 4 }}>Add your city, budget, and lifestyle preferences to unlock personalized AI matches.</p>
            </div>
            <Link to="/tenant/profile" className="btn btn-secondary">Update Preferences</Link>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Top Recommendations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={20} color="var(--primary)" /> Top AI Matches for You</h2>
              <Link to="/tenant/matches" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
            </div>
            
            {isLoadingRecs ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="empty-state card card-body">
                <Sparkles size={32} color="var(--text-faint)" />
                <h3 style={{ marginTop: 16 }}>No perfect matches right now</h3>
                <p>Try broadening your preferences or check back later.</p>
                <Link to="/browse" className="btn btn-outline" style={{ marginTop: 16 }}>Browse All Rooms</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {recommendations.map(({ listing, score, explanation }) => {
                  const s = getScoreColor(score);
                  return (
                    <div key={listing._id} className="card" style={{ display: 'flex', padding: 'var(--space-3)', gap: 'var(--space-4)', transition: 'transform var(--transition-fast)', cursor: 'pointer' }} onClick={() => navigate(`/listings/${listing._id}`)}>
                      <img src={listing.images?.[0]?.url} alt="" style={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 4 }}>{listing.title}</h4>
                          <span className="badge" style={{ background: s.bg, color: s.text, fontWeight: 700, fontSize: 12 }}><Sparkles size={10} style={{ marginRight: 4 }} /> {score}%</span>
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 700, marginBottom: 4 }}>₹{listing.rent?.toLocaleString()}/mo</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{listing.location?.city} · {listing.roomType}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Activity & Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Recent Requests */}
            <div className="card">
              <div className="card-header" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Recent Activity</h3>
              </div>
              <div className="card-body" style={{ padding: 'var(--space-2) 0' }}>
                {isLoadingInts ? (
                  <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} /></div>
                ) : interests.length === 0 ? (
                  <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No recent activity.</div>
                ) : (
                  interests.map(i => (
                    <div key={i._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.listing?.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(i.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge badge-${i.status === 'accepted' ? 'success' : i.status === 'declined' ? 'danger' : 'warning'}`} style={{ fontSize: 10, textTransform: 'capitalize' }}>{i.status}</span>
                    </div>
                  ))
                )}
                {interests.length > 0 && (
                  <Link to="/tenant/requests" style={{ display: 'block', textAlign: 'center', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All Requests</Link>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
              <Link to="/tenant/saved" className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', textDecoration: 'none', color: 'var(--text)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={18} /></div>
                <div style={{ fontWeight: 600 }}>Saved Rooms</div>
              </Link>
              <Link to="/tenant/chat" className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', textDecoration: 'none', color: 'var(--text)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={18} /></div>
                <div style={{ fontWeight: 600 }}>Messages</div>
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;
