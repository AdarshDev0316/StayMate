import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Home, Star, Users, Calendar, Shield, Wifi, Car, Wind, Zap, Dumbbell, ArrowLeft, Heart, Share2, Sparkles, CheckCircle, X, ChevronLeft, ChevronRight, Send, Phone } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const AMENITY_ICONS = {
  'WiFi': <Wifi size={16} />, 'Parking': <Car size={16} />, 'AC': <Wind size={16} />,
  'Power Backup': <Zap size={16} />, 'Gym': <Dumbbell size={16} />, 'Security': <Shield size={16} />,
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiScore, setAiScore] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [isComputingAI, setIsComputingAI] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [interestStatus, setInterestStatus] = useState(null); // 'pending' | 'accepted' | 'declined' | null
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Fetch listing
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data.data.listing);
      } catch {
        toast.error('Listing not found');
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // Check if already interested
  useEffect(() => {
    if (isAuthenticated && user?.role === 'tenant') {
      api.get('/interests/tenant').then(res => {
        const interest = res.data.data.interests.find(i => i.listing?._id === id || i.listing === id);
        if (interest) setInterestStatus(interest.status);
      }).catch(() => {});
    }
  }, [isAuthenticated, user, id]);

  // Check if saved
  useEffect(() => {
    if (user?.savedListings) {
      setIsSaved(user.savedListings.some(l => (typeof l === 'string' ? l : l._id) === id));
    }
  }, [user, id]);

  // Compute AI score
  const computeAI = async () => {
    if (!isAuthenticated || user?.role !== 'tenant') {
      toast.error('Please login as a tenant to see AI match score');
      return;
    }
    setIsComputingAI(true);
    try {
      const res = await api.post('/ai/match', { listingId: id });
      setAiScore(res.data.data.score);
      setAiData(res.data.data);
      toast.success('AI score computed!');
    } catch {
      toast.error('Failed to compute AI score');
    } finally {
      setIsComputingAI(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    if (user?.role !== 'tenant') { toast.error('Only tenants can save listings'); return; }
    try {
      const res = await api.post(`/listings/${id}/save`);
      setIsSaved(res.data.data.saved);
      toast.success(res.data.data.saved ? 'Saved!' : 'Removed from saved');
    } catch { toast.error('Failed'); }
  };

  const handleSendInterest = async () => {
    setIsSending(true);
    try {
      await api.post('/interests', { listingId: id, message: interestMessage });
      setInterestStatus('pending');
      setShowInterestModal(false);
      toast.success('Interest sent! Owner will be notified.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setIsSending(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'var(--success-light)', text: 'var(--success-dark)', label: 'Excellent Match' };
    if (score >= 60) return { bg: '#FEF9C3', text: '#D97706', label: 'Good Match' };
    if (score >= 40) return { bg: 'var(--info-light)', text: '#0E7490', label: 'Average Match' };
    return { bg: 'var(--danger-light)', text: 'var(--danger-dark)', label: 'Poor Match' };
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-8)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-8)' }}>
            <div>
              <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-4)' }} />
              <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: 8 }} />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
            <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images?.length ? listing.images : [{ url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=500&fit=crop' }];
  const scoreStyle = aiScore ? getScoreColor(aiScore) : null;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
      {/* Back Button */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: 'var(--space-4) 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ gap: 6 }}>
            <ArrowLeft size={16} /> Back to listings
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-ghost btn-icon" onClick={handleSave} title={isSaved ? 'Unsave' : 'Save'}>
              <Heart size={18} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : 'var(--text-muted)'} />
            </button>
            <button className="btn btn-ghost btn-icon" title="Share">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-8)', alignItems: 'start' }}>

          {/* ── LEFT: Images + Details ───────────────────────────────────── */}
          <div>
            {/* Image Gallery */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 'var(--space-6)', boxShadow: 'var(--shadow-md)' }}>
              <img
                src={images[activeImage]?.url}
                alt={listing.title}
                style={{ width: '100%', height: 420, objectFit: 'cover' }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(p => (p - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setActiveImage(p => (p + 1) % images.length)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
                    <ChevronRight size={20} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setActiveImage(i)}
                        style={{ width: i === activeImage ? 24 : 8, height: 8, borderRadius: 4, background: i === activeImage ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
                    ))}
                  </div>
                </>
              )}
              {images.length > 1 && (
                <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600 }}>
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <img key={i} src={img.url} alt="" onClick={() => setActiveImage(i)}
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius)', cursor: 'pointer', border: `2px solid ${i === activeImage ? 'var(--primary)' : 'transparent'}`, flexShrink: 0, transition: 'border var(--transition-fast)' }} />
                ))}
              </div>
            )}

            {/* Title & Meta */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--border)', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>{listing.title}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                    <MapPin size={15} />
                    <span>{listing.location?.address}{listing.location?.address && ', '}{listing.location?.city}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--primary)' }}>₹{listing.rent?.toLocaleString()}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>/month</div>
                  {listing.deposit > 0 && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>₹{listing.deposit?.toLocaleString()} deposit</div>
                  )}
                </div>
              </div>

              {/* Key specs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)' }}>
                {[
                  { label: 'Room Type', value: listing.roomType, icon: <Home size={16} /> },
                  { label: 'Furnishing', value: listing.furnishing, icon: <Star size={16} /> },
                  { label: 'Available', value: new Date(listing.availableFrom) <= new Date() ? 'Immediately' : new Date(listing.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: <Calendar size={16} /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--primary)', marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'capitalize' }}>{value}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {listing.description && (
                <>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>About the Property</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 'var(--space-5)' }}>{listing.description}</p>
                </>
              )}

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Amenities</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {listing.amenities.map(a => (
                      <span key={a} className="chip" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(76,92,231,0.2)' }}>
                        {AMENITY_ICONS[a] || <CheckCircle size={14} />} {a}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Owner Preferences */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Owner Preferences</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                {[
                  { label: 'Gender', value: listing.preferences?.gender || 'Any' },
                  { label: 'Occupation', value: listing.preferences?.occupation || 'Any' },
                  { label: 'Smoking', value: listing.preferences?.smoking ? 'Allowed' : 'Not Allowed' },
                  { label: 'Pets', value: listing.preferences?.pets ? 'Allowed' : 'Not Allowed' },
                  { label: 'Vegetarian', value: listing.preferences?.vegetarian ? 'Preferred' : 'Not Required' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-sm)' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Action Panel ──────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-8))' }}>

            {/* Owner Card */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--border)', marginBottom: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>Posted by</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <img
                  src={listing.owner?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.owner?.name || 'Owner')}&background=4C5CE7&color=fff`}
                  alt={listing.owner?.name}
                  className="avatar avatar-lg"
                />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{listing.owner?.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                    Member since {new Date(listing.owner?.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active recently</span>
                  </div>
                </div>
              </div>

              {/* AI Score Section */}
              {aiData ? (
                <div style={{ background: aiData.score >= 80 ? 'var(--success-light)' : aiData.score >= 60 ? '#FEF9C3' : 'var(--bg-2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <Sparkles size={20} color={getScoreColor(aiData.score).text} />
                    <div>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: getScoreColor(aiData.score).text, lineHeight: 1 }}>{aiData.score}%</div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: getScoreColor(aiData.score).text }}>{getScoreColor(aiData.score).label}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{aiData.explanation}</p>
                  {aiData.pros?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--success-dark)', marginBottom: 4 }}>Why it's a great match:</p>
                      {aiData.pros.slice(0, 3).map((pro, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                          <CheckCircle size={12} color="var(--success-dark)" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{pro}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : isAuthenticated && user?.role === 'tenant' ? (
                <button
                  onClick={computeAI}
                  disabled={isComputingAI}
                  className="btn btn-outline"
                  style={{ width: '100%', marginBottom: 'var(--space-4)', gap: 'var(--space-2)' }}
                >
                  {isComputingAI ? (
                    <>
                      <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      Computing AI Score...
                    </>
                  ) : (
                    <><Sparkles size={16} /> Get AI Match Score</>
                  )}
                </button>
              ) : null}

              {/* Action Buttons */}
              {isAuthenticated && user?.role === 'tenant' ? (
                <>
                  {interestStatus === null && listing.status === 'active' ? (
                    <button
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                      onClick={() => setShowInterestModal(true)}
                    >
                      <Send size={16} /> Send Interest
                    </button>
                  ) : interestStatus === 'pending' ? (
                    <div className="badge badge-warning" style={{ width: '100%', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', justifyContent: 'center' }}>
                      ⏳ Interest Sent — Awaiting Response
                    </div>
                  ) : interestStatus === 'accepted' ? (
                    <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/tenant/chat')}>
                      <MessageCircle size={16} /> Open Chat
                    </button>
                  ) : interestStatus === 'declined' ? (
                    <div className="badge badge-danger" style={{ width: '100%', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', justifyContent: 'center' }}>
                      ✗ Interest was declined
                    </div>
                  ) : (
                    <div className="badge badge-neutral" style={{ width: '100%', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', justifyContent: 'center' }}>
                      Listing no longer available
                    </div>
                  )}
                </>
              ) : !isAuthenticated ? (
                <Link to="/tenant/register" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  Sign Up to Send Interest
                </Link>
              ) : null}
            </div>

            {/* Safety Card */}
            <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid rgba(76,92,231,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <Shield size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Stay Safe</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Never share financial details online. Visit the property in person before paying any deposit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="modal-backdrop" onClick={() => setShowInterestModal(false)}>
          <div className="modal animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Send Interest</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>{listing.title}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowInterestModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Intro Message (Optional)</label>
                <textarea
                  className="input textarea"
                  placeholder="Tell the owner a bit about yourself, your lifestyle, and why you're interested..."
                  value={interestMessage}
                  onChange={e => setInterestMessage(e.target.value)}
                  maxLength={500}
                />
                <p className="input-hint">{interestMessage.length}/500 characters</p>
              </div>
              {aiData && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--success-light)', borderRadius: 'var(--radius)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--success-dark)', fontWeight: 600 }}>
                    <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Your AI compatibility score ({aiData.score}%) will be shared with the owner.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowInterestModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendInterest} disabled={isSending}>
                {isSending ? 'Sending...' : <><Send size={15} /> Send Interest</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;
