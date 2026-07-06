import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Home, Users, Star, ArrowRight, ChevronDown, CheckCircle, Zap, Shield, MessageCircle, Sparkles, Building2, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

// ─── Stats Counter ────────────────────────────────────────────────────────────
const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Listing Preview Card ─────────────────────────────────────────────────────
const PreviewCard = ({ listing, delay = 0 }) => (
  <div className="listing-card animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
    <div className="listing-card-image">
      <img
        src={listing.images?.[0]?.url || `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=300&fit=crop&auto=format`}
        alt={listing.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div className="listing-card-ai-badge">
        <span className="score-badge excellent" style={{ fontSize: 11 }}>
          <Sparkles size={10} /> {listing.aiScore || '95'}% Match
        </span>
      </div>
    </div>
    <div className="listing-card-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="listing-card-price">₹{(listing.rent || 15000).toLocaleString()}<span>/mo</span></span>
        <span className="badge badge-success" style={{ fontSize: 11 }}>Available</span>
      </div>
      <p className="listing-card-title">{listing.title || 'Premium Single Room in 2BHK'}</p>
      <div className="listing-card-location">
        <MapPin size={13} />
        <span>{listing.location?.city || 'Koramangala, Bangalore'}</span>
      </div>
      <div className="listing-card-meta">
        <span className="listing-meta-item"><Home size={12} /> {listing.roomType || 'Single'}</span>
        <span className="listing-meta-item"><Star size={12} /> {listing.furnishing || 'Furnished'}</span>
        <span className="listing-meta-item"><Users size={12} /> Any</span>
      </div>
    </div>
  </div>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, description, delay }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-8)',
    display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
    transition: 'all var(--transition)',
    animation: `fadeInUp 0.6s ease ${delay}ms both`,
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{description}</p>
    </div>
  </div>
);

// ─── Step Card ────────────────────────────────────────────────────────────────
const StepCard = ({ number, title, description, isOwner }) => (
  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
    <div style={{
      width: 40, height: 40, borderRadius: 'var(--radius-full)', flexShrink: 0,
      background: isOwner ? 'var(--primary)' : 'var(--secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: 'var(--text-sm)',
    }}>
      {number}
    </div>
    <div>
      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 4 }}>{title}</h4>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</p>
    </div>
  </div>
);

// ─── Landing Page ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [searchForm, setSearchForm] = useState({ city: '', minRent: '', maxRent: '' });

  useEffect(() => {
    // Fetch a few featured listings
    api.get('/listings?limit=3&sort=views').then(res => {
      setFeaturedListings(res.data.data.listings || []);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.city) params.set('city', searchForm.city);
    if (searchForm.minRent) params.set('minRent', searchForm.minRent);
    if (searchForm.maxRent) params.set('maxRent', searchForm.maxRent);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: 'calc(100vh - var(--navbar-height))',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        marginTop: 'calc(-1 * var(--navbar-height))',
        paddingTop: 'var(--navbar-height)',
      }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,92,231,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,176,148,0.1) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '30%', left: '50%', width: 1, height: '40%', background: 'linear-gradient(to bottom, transparent, rgba(76,92,231,0.3), transparent)' }} />
        </div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', alignItems: 'center', padding: 'var(--space-16) var(--space-6)' }}>

          {/* ─── Left: Hero Text ────────────────────────────────────────── */}
          <div style={{ animation: 'fadeInUp 0.6s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '0.4rem 1rem', background: 'rgba(76,92,231,0.15)', border: '1px solid rgba(76,92,231,0.3)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-6)' }}>
              <Sparkles size={14} color="var(--accent)" />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI-Powered Matching</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              fontWeight: 900,
              color: 'var(--text)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-6)',
              letterSpacing: '-0.03em',
            }}>
              Find Your Perfect<br />
              <span style={{ color: 'var(--primary)' }}>
                Room or Flatmate
              </span>
            </h1>

            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 'var(--space-8)', maxWidth: 480 }}>
              AI matches you to the right rooms and flatmates based on your preferences, lifestyle, and budget.
            </p>

            {/* ─── Search Box ──────────────────────────────────────────── */}
            <form onSubmit={handleSearch} style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                  <input
                    type="text"
                    placeholder="Location"
                    value={searchForm.city}
                    onChange={e => setSearchForm(p => ({ ...p, city: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 'var(--radius)', color: '#fff', fontSize: 'var(--text-sm)',
                      outline: 'none', fontFamily: 'var(--font)',
                    }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={searchForm.minRent}
                    onChange={e => setSearchForm(p => ({ ...p, minRent: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 'var(--radius)', color: '#fff', fontSize: 'var(--text-sm)',
                      outline: 'none', fontFamily: 'var(--font)',
                    }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={searchForm.maxRent}
                    onChange={e => setSearchForm(p => ({ ...p, maxRent: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 'var(--radius)', color: '#fff', fontSize: 'var(--text-sm)',
                      outline: 'none', fontFamily: 'var(--font)',
                    }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary btn-lg" style={{ width: '100%', gap: 'var(--space-2)' }}>
                <Search size={18} /> Find Rooms
              </button>
            </form>

            {/* ─── Trust Indicators ────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
              {[
                { icon: <CheckCircle size={14} />, text: 'Verified Listings' },
                { icon: <Shield size={14} />, text: 'Secure Platform' },
                { icon: <Zap size={14} />, text: 'Instant Match' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--secondary)' }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Right: Stats + Floating Cards ──────────────────────────── */}
          <div style={{ animation: 'fadeInUp 0.6s ease 200ms both', position: 'relative' }}>
            {/* Main image */}
            <div style={{
              borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
              aspectRatio: '4/3',
            }}>
              <img
                src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&h=525&fit=crop&auto=format"
                alt="Beautiful Room"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />
            </div>

            {/* Floating stats */}
            <div style={{
              position: 'absolute', bottom: -20, left: -20,
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
              animation: 'float 4s ease-in-out infinite',
              minWidth: 160,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                {[
                  { value: 10000, suffix: '+', label: 'Rooms' },
                  { value: 5000, suffix: '+', label: 'Tenants' },
                  { value: 95, suffix: '%', label: 'Match Rate' },
                  { value: 24, suffix: '/7', label: 'Support' },
                ].map(({ value, suffix, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                      <CountUp end={value} suffix={suffix} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Match floating card */}
            <div style={{
              position: 'absolute', top: -16, right: -16,
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
              animation: 'float 4s ease-in-out 2s infinite',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="var(--success-dark)" />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--success-dark)' }}>95% Match</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI Compatibility</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', animation: 'bounce 2s ease infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={20} color="rgba(255,255,255,0.4)" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section id="about" style={{ padding: 'var(--space-24) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)' }}>Key Features</span>
            <h2 style={{ fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 'var(--space-4)' }}>
              Everything you need<br />
              <span className="gradient-text">to find the perfect room</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', fontSize: 'var(--text-lg)' }}>
              StayMate combines AI intelligence with a premium experience to make room hunting effortless.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
            <FeatureCard
              icon={<Sparkles size={24} />}
              title="AI Compatibility Engine"
              description="Our Gemini-powered AI calculates a precise 0-100 compatibility score based on budget, location, lifestyle, and preferences."
              delay={0}
            />
            <FeatureCard
              icon={<MessageCircle size={24} />}
              title="Real-time Chat"
              description="Chat instantly with owners or tenants via WebSocket. Seen receipts, typing indicators, and message history included."
              delay={100}
            />
            <FeatureCard
              icon={<Bell size={24} />}
              title="Smart Notifications"
              description="Get email alerts for new interests, acceptance, and messages. Never miss an important update."
              delay={200}
            />
            <FeatureCard
              icon={<Shield size={24} />}
              title="Verified Listings"
              description="All listings are reviewed. Owners verify their identity. You can browse with confidence."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED LISTINGS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-24) 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-12)' }}>
            <div>
              <span className="badge badge-secondary" style={{ marginBottom: 'var(--space-3)' }}>Featured Rooms</span>
              <h2 style={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                Popular Listings
              </h2>
            </div>
            <Link to="/browse" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {(featuredListings.length > 0 ? featuredListings : [1, 2, 3]).map((listing, i) => (
              <PreviewCard
                key={typeof listing === 'object' ? listing._id : i}
                listing={typeof listing === 'object' ? listing : {}}
                delay={i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: 'var(--space-24) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-4)' }}>Simple Process</span>
            <h2 style={{ fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 'var(--space-4)' }}>
              How <span className="gradient-text">StayMate</span> Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', alignItems: 'start' }}>
            {/* Owner Flow */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--primary)' }}>For Owners</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>List & find tenants</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <StepCard number="1" title="Register & Create Account" description="Sign up as an owner and verify your email to get started." isOwner />
                <StepCard number="2" title="Add Room Listing" description="Add details: location, rent, room type, furnishing, photos." isOwner />
                <StepCard number="3" title="Receive Interest Requests" description="Get notified when tenants express interest with AI match scores." isOwner />
                <StepCard number="4" title="Accept & Chat" description="Review requests, accept high matches, and chat directly." isOwner />
                <StepCard number="5" title="Mark as Filled" description="Once rented, mark the listing filled. It's removed from search." isOwner />
              </div>
              <Link to="/owner/register" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-8)', justifyContent: 'center' }}>
                List Your Room <ArrowRight size={16} />
              </Link>
            </div>

            {/* Tenant Flow */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={22} color="var(--secondary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--secondary)' }}>For Tenants</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Find & move in</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <StepCard number="1" title="Register & Create Profile" description="Sign up as a tenant and add your preferences and lifestyle." />
                <StepCard number="2" title="Browse & Filter Listings" description="Filter by location, budget, room type, furnishing, and amenities." />
                <StepCard number="3" title="Get AI Match Score" description="Our AI computes a 0-100 compatibility score for each listing." />
                <StepCard number="4" title="Send Interest" description="Express interest to owners with an optional intro message." />
                <StepCard number="5" title="Chat & Move In" description="Once accepted, chat with the owner and finalize your move!" />
              </div>
              <Link to="/tenant/register" className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--space-8)', justifyContent: 'center' }}>
                Find Your Room <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'var(--space-24) 0',
        background: 'var(--surface)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,92,231,0.15) 0%, transparent 70%)' }} />
        </div>
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <span className="badge" style={{ background: 'rgba(247,248,111,0.15)', color: 'var(--accent)', border: '1px solid rgba(247,248,111,0.3)', marginBottom: 'var(--space-6)' }}>
            Ready to Start?
          </span>
          <h2 style={{ color: 'var(--text)', fontWeight: 900, fontSize: 'var(--text-5xl)', letterSpacing: '-0.03em', marginBottom: 'var(--space-6)' }}>
            Your perfect room is<br />
            <span style={{ color: 'var(--primary)' }}>
              one match away
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-10)', maxWidth: 480, margin: '0 auto var(--space-10)' }}>
            Join thousands of tenants and owners on StayMate. Get matched with your ideal room in minutes.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tenant/register" className="btn btn-xl btn-primary">
              Find a Room — Free <ArrowRight size={18} />
            </Link>
            <Link to="/owner/register" className="btn btn-xl btn-secondary">
              List Your Room <Building2 size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--surface-2)', padding: 'var(--space-8) 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <img src="/logo.jpg" alt="StayMate" style={{ height: '32px', objectFit: 'contain', borderRadius: '4px' }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            © {new Date().getFullYear()} StayMate. Built with ❤️ for renters.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            {[
              { name: 'Privacy', path: '/privacy' },
              { name: 'Terms', path: '/terms' },
              { name: 'Contact', path: '/contact' }
            ].map(item => (
              <Link key={item.name} to={item.path} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'var(--text-sm)', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          section > .container > div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          section > .container > div[style*="gridTemplateColumns: 1fr 1fr"]:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
