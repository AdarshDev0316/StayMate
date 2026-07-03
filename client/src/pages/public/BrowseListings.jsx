import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, SlidersHorizontal, Search, Heart, Sparkles, Home, Star, Filter, X, ChevronDown, Users } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Noida'];
const ROOM_TYPES = [{ value: 'single', label: 'Single' }, { value: 'double', label: 'Double' }, { value: 'shared', label: 'Shared' }, { value: 'entire', label: 'Entire Place' }];
const FURNISHING = [{ value: 'fully', label: 'Fully Furnished' }, { value: 'semi', label: 'Semi Furnished' }, { value: 'unfurnished', label: 'Unfurnished' }];
const AMENITIES_LIST = ['WiFi', 'AC', 'Geyser', 'Washing Machine', 'Parking', 'Security', 'Power Backup', 'Lift'];

const ScoreBadge = ({ score }) => {
  if (!score) return null;
  const cls = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'poor';
  return (
    <span className={`score-badge ${cls}`} style={{ fontSize: 11 }}>
      <Sparkles size={10} /> {score}% Match
    </span>
  );
};

const ListingCard = ({ listing, savedIds, onToggleSave }) => {
  const isSaved = savedIds.includes(listing._id);

  return (
    <div className="listing-card animate-fadeInUp">
      <div className="listing-card-image">
        <Link to={`/listings/${listing._id}`}>
          <img
            src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=300&fit=crop'}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Link>
        <button
          className={`listing-card-save${isSaved ? ' saved' : ''}`}
          onClick={() => onToggleSave(listing._id)}
          title={isSaved ? 'Unsave' : 'Save'}
        >
          <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
        </button>
        {listing.aiScore && (
          <div className="listing-card-ai-badge">
            <ScoreBadge score={listing.aiScore} />
          </div>
        )}
      </div>
      <Link to={`/listings/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="listing-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span className="listing-card-price">₹{listing.rent?.toLocaleString()}<span>/mo</span></span>
            <span className={`badge badge-${listing.status === 'active' ? 'success' : 'neutral'}`} style={{ fontSize: 10 }}>
              {listing.status === 'active' ? 'Available' : listing.status}
            </span>
          </div>
          <p className="listing-card-title">{listing.title}</p>
          <div className="listing-card-location">
            <MapPin size={13} />
            <span>{listing.location?.city}</span>
            {listing.location?.address && <span style={{ color: 'var(--text-faint)' }}>· {listing.location.address}</span>}
          </div>
          <div className="listing-card-meta">
            <span className="listing-meta-item"><Home size={12} /> {listing.roomType}</span>
            <span className="listing-meta-item"><Star size={12} /> {listing.furnishing}</span>
            {listing.availableFrom && (
              <span className="listing-meta-item"><Users size={12} />
                {new Date(listing.availableFrom) <= new Date() ? 'Now' : `From ${new Date(listing.availableFrom).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const BrowseListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    roomType: [],
    furnishing: [],
    amenities: [],
    sort: 'createdAt',
    page: 1,
  });

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.minRent) params.set('minRent', filters.minRent);
      if (filters.maxRent) params.set('maxRent', filters.maxRent);
      if (filters.roomType.length) params.set('roomType', filters.roomType[0]);
      if (filters.furnishing.length) params.set('furnishing', filters.furnishing[0]);
      params.set('sort', filters.sort);
      params.set('page', filters.page);
      params.set('limit', 12);

      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.data.listings);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Load saved listings for tenant
  useEffect(() => {
    if (isAuthenticated && user?.savedListings) {
      setSavedIds(user.savedListings.map(l => typeof l === 'string' ? l : l._id));
    }
  }, [isAuthenticated, user]);

  const toggleSave = async (listingId) => {
    if (!isAuthenticated) { toast.error('Please login to save listings'); return; }
    if (user?.role !== 'tenant') { toast.error('Only tenants can save listings'); return; }
    try {
      const res = await api.post(`/listings/${listingId}/save`);
      if (res.data.data.saved) {
        setSavedIds(p => [...p, listingId]);
        toast.success('Listing saved!');
      } else {
        setSavedIds(p => p.filter(id => id !== listingId));
        toast.success('Listing removed from saved');
      }
    } catch { toast.error('Failed to save listing'); }
  };

  const toggleFilter = (key, value) => {
    setFilters(p => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter(v => v !== value) : [...p[key], value],
      page: 1,
    }));
  };

  const clearFilters = () => setFilters({ city: '', minRent: '', maxRent: '', roomType: [], furnishing: [], amenities: [], sort: 'createdAt', page: 1 });

  const hasActiveFilters = filters.city || filters.minRent || filters.maxRent || filters.roomType.length || filters.furnishing.length || filters.amenities.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: 'var(--space-5) 0', position: 'sticky', top: 'var(--navbar-height)', zIndex: 10 }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input
                type="text"
                placeholder="Search by city, locality..."
                value={filters.city}
                onChange={e => setFilters(p => ({ ...p, city: e.target.value, page: 1 }))}
                className="input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <select
              value={filters.sort}
              onChange={e => setFilters(p => ({ ...p, sort: e.target.value, page: 1 }))}
              className="input select"
              style={{ width: 'auto', minWidth: 160 }}
            >
              <option value="createdAt">Sort: Newest</option>
              <option value="rent_asc">Rent: Low to High</option>
              <option value="rent_desc">Rent: High to Low</option>
              <option value="views">Most Viewed</option>
            </select>
            <button
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ gap: 'var(--space-2)' }}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && <span className="badge badge-danger" style={{ fontSize: 10, padding: '1px 6px' }}>!</span>}
            </button>
            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ gap: 4 }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* ── Filter Panel ────────────────────────────────────────────── */}
          {showFilters && (
            <div style={{
              marginTop: 'var(--space-4)', padding: 'var(--space-5)',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', animation: 'fadeInDown 0.2s ease',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Budget */}
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 'var(--space-3)' }}>Budget Range</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input type="number" placeholder="Min ₹" value={filters.minRent} onChange={e => setFilters(p => ({ ...p, minRent: e.target.value, page: 1 }))} className="input" style={{ flex: 1 }} />
                    <input type="number" placeholder="Max ₹" value={filters.maxRent} onChange={e => setFilters(p => ({ ...p, maxRent: e.target.value, page: 1 }))} className="input" style={{ flex: 1 }} />
                  </div>
                </div>

                {/* Room Type */}
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 'var(--space-3)' }}>Room Type</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {ROOM_TYPES.map(rt => (
                      <button key={rt.value} onClick={() => toggleFilter('roomType', rt.value)} className={`chip${filters.roomType.includes(rt.value) ? ' chip-active' : ''}`}>
                        {rt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing */}
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 'var(--space-3)' }}>Furnishing</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {FURNISHING.map(f => (
                      <button key={f.value} onClick={() => toggleFilter('furnishing', f.value)} className={`chip${filters.furnishing.includes(f.value) ? ' chip-active' : ''}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 'var(--space-3)' }}>Amenities</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {AMENITIES_LIST.map(a => (
                      <button key={a} onClick={() => toggleFilter('amenities', a)} className={`chip${filters.amenities.includes(a) ? ' chip-active' : ''}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {isLoading ? 'Loading...' : `${pagination.total} listings found`}
            {filters.city && ` in "${filters.city}"`}
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Home size={36} /></div>
            <h3>No listings found</h3>
            <p>Try adjusting your filters or search in a different location.</p>
            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {listings.map((listing, i) => (
              <ListingCard key={listing._id} listing={listing} savedIds={savedIds} onToggleSave={toggleSave} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-12)' }}>
            <button className="btn btn-outline btn-sm" disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}>Previous</button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(pg => (
              <button
                key={pg}
                onClick={() => setFilters(p => ({ ...p, page: pg }))}
                className={`btn btn-sm ${filters.page === pg ? 'btn-primary' : 'btn-ghost'}`}
                style={{ minWidth: 36 }}
              >
                {pg}
              </button>
            ))}
            <button className="btn btn-outline btn-sm" disabled={filters.page >= pagination.pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseListings;
