import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Loader2, ArrowRight } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const MyMatches = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/ai/recommendations').then(res => {
      setRecommendations(res.data.data.recommendations);
    }).finally(() => setIsLoading(false));
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
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}><Sparkles color="var(--secondary)" /> AI Matches</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Rooms matching your lifestyle and preferences</p>
          </div>
          {(!user?.preferences?.city || !user?.preferences?.budgetMax) && (
            <Link to="/tenant/profile" className="btn btn-secondary">Update Preferences</Link>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--secondary)' }} />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Sparkles size={32} /></div>
            <h3>No matches found</h3>
            <p>{(!user?.preferences?.city || !user?.preferences?.budgetMax) ? 'Complete your profile to see AI matches.' : 'We could not find rooms matching your strict preferences. Try broadening them in your profile.'}</p>
            {(!user?.preferences?.city || !user?.preferences?.budgetMax) ? (
              <Link to="/tenant/profile" className="btn btn-secondary">Update Profile</Link>
            ) : (
              <Link to="/browse" className="btn btn-outline">Browse All Listings</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {recommendations.map(({ listing, score, explanation }) => {
              const s = getScoreColor(score);
              return (
                <div key={listing._id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'transform var(--transition-fast)' }} onClick={() => navigate(`/listings/${listing._id}`)}>
                  <div style={{ position: 'relative', height: 180 }}>
                    <img src={listing.images?.[0]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 12, right: 12, background: s.bg, color: s.text, padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, boxShadow: 'var(--shadow)' }}>
                      <Sparkles size={12} /> {score}% Match
                    </div>
                  </div>
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-1)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                      <MapPin size={14} /> {listing.location?.city} · {listing.roomType}
                    </div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--primary)', marginBottom: 'var(--space-4)' }}>
                      ₹{listing.rent?.toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                    </div>
                    
                    <div style={{ background: 'var(--surface-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius)', marginTop: 'auto' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Why it's a match:</p>
                      <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{explanation}</p>
                    </div>
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

export default MyMatches;
