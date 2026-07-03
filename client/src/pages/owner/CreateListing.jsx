import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, MapPin, DollarSign, Home, Star, Wifi, Car, Wind, Zap, Shield, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100),
  description: z.string().max(2000).optional(),
  'location.city': z.string().min(2, 'City is required'),
  'location.address': z.string().optional(),
  'location.state': z.string().optional(),
  'location.pincode': z.string().optional(),
  rent: z.string().min(1, 'Rent is required').refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Enter valid rent'),
  deposit: z.string().optional(),
  roomType: z.enum(['single', 'double', 'shared', 'entire'], { required_error: 'Select room type' }),
  furnishing: z.enum(['fully', 'semi', 'unfurnished'], { required_error: 'Select furnishing' }),
  availableFrom: z.string().min(1, 'Available from date is required'),
  'preferences.gender': z.enum(['any', 'male', 'female']).optional(),
  'preferences.occupation': z.enum(['any', 'student', 'professional']).optional(),
  'preferences.smoking': z.boolean().optional(),
  'preferences.pets': z.boolean().optional(),
  'preferences.vegetarian': z.boolean().optional(),
});

const AMENITIES = ['WiFi', 'AC', 'Geyser', 'Washing Machine', 'Parking', 'Security', 'Power Backup', 'Lift', 'CCTV', 'Gas Pipeline', 'Gym'];
const ROOM_TYPES = [{ value: 'single', label: 'Single Room' }, { value: 'double', label: 'Double Room' }, { value: 'shared', label: 'Shared Room' }, { value: 'entire', label: 'Entire Place' }];
const FURNISHING = [{ value: 'fully', label: 'Fully Furnished' }, { value: 'semi', label: 'Semi Furnished' }, { value: 'unfurnished', label: 'Unfurnished' }];

const CreateListing = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: zodResolver(schema) });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) { toast.error('Maximum 10 images allowed'); return; }
    setImages(p => [...p, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(p => [...p, ...previews]);
  };

  const removeImage = (i) => {
    setImages(p => p.filter((_, idx) => idx !== i));
    setImagePreviews(p => p.filter((_, idx) => idx !== i));
  };

  const toggleAmenity = (a) => setSelectedAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const onSubmit = async (data) => {
    if (images.length === 0) { toast.error('Please upload at least one image'); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      // Flatten nested form fields
      fd.append('title', data.title);
      fd.append('description', data.description || '');
      fd.append('location', JSON.stringify({
        city: data['location.city'],
        address: data['location.address'],
        state: data['location.state'],
        pincode: data['location.pincode'],
      }));
      fd.append('rent', data.rent);
      fd.append('deposit', data.deposit || 0);
      fd.append('roomType', data.roomType);
      fd.append('furnishing', data.furnishing);
      fd.append('availableFrom', data.availableFrom);
      fd.append('amenities', JSON.stringify(selectedAmenities));
      fd.append('preferences', JSON.stringify({
        gender: data['preferences.gender'] || 'any',
        occupation: data['preferences.occupation'] || 'any',
        smoking: data['preferences.smoking'] || false,
        pets: data['preferences.pets'] || false,
        vegetarian: data['preferences.vegetarian'] || false,
      }));
      images.forEach(img => fd.append('images', img));

      await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing created successfully!');
      navigate('/owner/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally { setIsSubmitting(false); }
  };

  const inputStyle = { width: '100%', padding: '0.7rem 1rem', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font)', color: 'var(--text)', outline: 'none' };
  const labelStyle = { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 };
  const errStyle = { fontSize: 12, color: 'var(--danger)', marginTop: 4 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="owner" />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Add New Listing</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Fill in the details to publish your room</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

              {/* Basic Info */}
              <div className="card card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Basic Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={labelStyle}>Listing Title *</label>
                    <input {...register('title')} placeholder="e.g. Premium Single Room in 2BHK with AC & WiFi" style={inputStyle} />
                    {errors.title && <p style={errStyle}>{errors.title.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea {...register('description')} placeholder="Describe the room, amenities, neighbourhood, house rules..." style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Location</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={labelStyle}>City *</label>
                    <input {...register('location.city')} placeholder="e.g. Bangalore" style={inputStyle} />
                    {errors['location.city'] && <p style={errStyle}>{errors['location.city'].message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>State</label>
                    <input {...register('location.state')} placeholder="e.g. Karnataka" style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Full Address</label>
                    <input {...register('location.address')} placeholder="e.g. 45, 12th Main, Koramangala" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Pincode</label>
                    <input {...register('location.pincode')} placeholder="560034" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="card card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Pricing</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={labelStyle}>Monthly Rent (₹) *</label>
                    <input {...register('rent')} type="number" placeholder="15000" style={inputStyle} />
                    {errors.rent && <p style={errStyle}>{errors.rent.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Security Deposit (₹)</label>
                    <input {...register('deposit')} type="number" placeholder="30000" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="card card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Room Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={labelStyle}>Room Type *</label>
                    <select {...register('roomType')} style={{ ...inputStyle, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: 16, paddingRight: '2.5rem', appearance: 'none' }}>
                      <option value="">Select type</option>
                      {ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    {errors.roomType && <p style={errStyle}>{errors.roomType.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Furnishing *</label>
                    <select {...register('furnishing')} style={{ ...inputStyle, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: 16, paddingRight: '2.5rem', appearance: 'none' }}>
                      <option value="">Select furnishing</option>
                      {FURNISHING.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    {errors.furnishing && <p style={errStyle}>{errors.furnishing.message}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Available From *</label>
                    <input {...register('availableFrom')} type="date" style={inputStyle} min={new Date().toISOString().split('T')[0]} />
                    {errors.availableFrom && <p style={errStyle}>{errors.availableFrom.message}</p>}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="card card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Amenities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {AMENITIES.map(a => (
                    <button type="button" key={a} onClick={() => toggleAmenity(a)}
                      className={`chip${selectedAmenities.includes(a) ? ' chip-active' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenant Preferences */}
              <div className="card card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>Tenant Preferences</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={labelStyle}>Preferred Gender</label>
                    <select {...register('preferences.gender')} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="any">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Preferred Occupation</label>
                    <select {...register('preferences.occupation')} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="any">Any</option>
                      <option value="student">Student</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {[['preferences.smoking', 'Smoking Allowed'], ['preferences.pets', 'Pets Allowed'], ['preferences.vegetarian', 'Vegetarian Only']].map(([name, label]) => (
                      <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                        <input {...register(name)} type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Image Upload + Submit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-4))' }}>
              {/* Image Upload */}
              <div className="card card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Photos</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>Upload up to 10 photos. First photo will be the cover image.</p>

                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', cursor: 'pointer', transition: 'border-color var(--transition-fast)', background: 'var(--bg)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Upload size={28} color="var(--text-faint)" />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>Click to upload photos</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>JPG, PNG, WebP · Max 5MB each</p>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>

                {imagePreviews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && (
                          <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>Cover</span>
                        )}
                        <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <><Plus size={18} /> Publish Listing</>}
              </button>
              <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateListing;
