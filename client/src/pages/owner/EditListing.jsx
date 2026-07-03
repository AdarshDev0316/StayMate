import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AMENITIES = ['WiFi', 'AC', 'Geyser', 'Washing Machine', 'Parking', 'Security', 'Power Backup', 'Lift', 'CCTV', 'Gas Pipeline', 'Gym'];
const ROOM_TYPES = [{ value: 'single', label: 'Single Room' }, { value: 'double', label: 'Double Room' }, { value: 'shared', label: 'Shared Room' }, { value: 'entire', label: 'Entire Place' }];
const FURNISHING = [{ value: 'fully', label: 'Fully Furnished' }, { value: 'semi', label: 'Semi Furnished' }, { value: 'unfurnished', label: 'Unfurnished' }];

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`).then(res => {
      const l = res.data.data.listing;
      setListing(l);
      setSelectedAmenities(l.amenities || []);
      setFormData({
        title: l.title, description: l.description || '',
        city: l.location?.city || '', address: l.location?.address || '',
        state: l.location?.state || '', pincode: l.location?.pincode || '',
        rent: l.rent, deposit: l.deposit || '',
        roomType: l.roomType, furnishing: l.furnishing,
        availableFrom: l.availableFrom ? l.availableFrom.split('T')[0] : '',
        gender: l.preferences?.gender || 'any',
        occupation: l.preferences?.occupation || 'any',
        smoking: l.preferences?.smoking || false,
        pets: l.preferences?.pets || false,
        vegetarian: l.preferences?.vegetarian || false,
      });
    }).catch(() => { toast.error('Listing not found'); navigate('/owner/listings'); })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleChange = (key, value) => setFormData(p => ({ ...p, [key]: value }));
  const toggleAmenity = (a) => setSelectedAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/listings/${id}`, {
        title: formData.title, description: formData.description,
        location: { city: formData.city, address: formData.address, state: formData.state, pincode: formData.pincode },
        rent: Number(formData.rent), deposit: Number(formData.deposit || 0),
        roomType: formData.roomType, furnishing: formData.furnishing,
        availableFrom: formData.availableFrom,
        amenities: selectedAmenities,
        preferences: { gender: formData.gender, occupation: formData.occupation, smoking: formData.smoking, pets: formData.pets, vegetarian: formData.vegetarian },
      });
      toast.success('Listing updated!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setIsSubmitting(false); }
  };

  const inputStyle = { width: '100%', padding: '0.7rem 1rem', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font)', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 };

  if (isLoading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="owner" />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      </main>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="owner" />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Edit Listing</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{listing?.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Basic Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={labelStyle}>Listing Title</label>
                  <input value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} />
                </div>
              </div>
            </div>

            <div className="card card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div><label style={labelStyle}>City</label><input value={formData.city || ''} onChange={e => handleChange('city', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>State</label><input value={formData.state || ''} onChange={e => handleChange('state', e.target.value)} style={inputStyle} /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Address</label><input value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} style={inputStyle} /></div>
              </div>
            </div>

            <div className="card card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Pricing & Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <div><label style={labelStyle}>Rent (₹)</label><input type="number" value={formData.rent || ''} onChange={e => handleChange('rent', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Deposit (₹)</label><input type="number" value={formData.deposit || ''} onChange={e => handleChange('deposit', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Available From</label><input type="date" value={formData.availableFrom || ''} onChange={e => handleChange('availableFrom', e.target.value)} style={inputStyle} /></div>
                <div>
                  <label style={labelStyle}>Room Type</label>
                  <select value={formData.roomType || ''} onChange={e => handleChange('roomType', e.target.value)} style={inputStyle}>
                    {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Furnishing</label>
                  <select value={formData.furnishing || ''} onChange={e => handleChange('furnishing', e.target.value)} style={inputStyle}>
                    {FURNISHING.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card card-body">
              <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Amenities</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {AMENITIES.map(a => (
                  <button type="button" key={a} onClick={() => toggleAmenity(a)} className={`chip${selectedAmenities.includes(a) ? ' chip-active' : ''}`} style={{ cursor: 'pointer' }}>{a}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
