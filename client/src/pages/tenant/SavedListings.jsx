import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Loader2 } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SavedListings = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await api.get('/listings/tenant/saved');
      setSaved(res.data.data.savedListings);
    } catch {
      toast.error('Failed to load saved listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleUnsave = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post(`/listings/${id}/save`);
      toast.success('Removed from saved');
      setSaved(p => p.filter(l => l._id !== id));
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="tenant" />
      <main className="main-content">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}><Heart color="var(--primary)" fill="var(--primary)" /> Saved Rooms</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Properties you've bookmarked for later</p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}><Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
        ) : saved.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Heart size={32} color="var(--text-faint)" /></div>
            <h3>No saved rooms</h3>
            <p>You haven't saved any properties yet.</p>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Rooms</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {saved.map(listing => (
              <div key={listing._id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'transform var(--transition-fast)' }} onClick={() => navigate(`/listings/${listing._id}`)}>
                <div style={{ position: 'relative', height: 180 }}>
                  <img src={listing.images?.[0]?.url || 'https://via.placeholder.com/300'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={(e) => handleUnsave(e, listing._id)}
                    style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow)' }}
                  >
                    <Heart size={16} color="var(--primary)" fill="var(--primary)" />
                  </button>
                </div>
                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{listing.rent?.toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-1)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{listing.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    <MapPin size={14} /> {listing.location?.city} · {listing.roomType}
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                    <div className="badge badge-neutral">{listing.furnishing}</div>
                    <div className="badge badge-neutral">{listing.preferences?.gender || 'Any Gender'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedListings;
