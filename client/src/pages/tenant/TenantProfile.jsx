import React, { useState } from 'react';
import { Camera, Save, User, Shield } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const TenantProfile = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.preferences?.gender || 'any',
    occupation: user?.preferences?.occupation || 'any',
    smoking: user?.preferences?.smoking || false,
    pets: user?.preferences?.pets || false,
    vegetarian: user?.preferences?.vegetarian || false,
    budgetMax: user?.preferences?.budgetMax || '',
    city: user?.preferences?.city || '',
    roomType: user?.preferences?.roomType || 'any'
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('phone', formData.phone);
    if (avatarFile) fd.append('avatar', avatarFile);
    
    // Stringify preferences for backend
    const prefs = {
      gender: formData.gender, occupation: formData.occupation,
      smoking: formData.smoking, pets: formData.pets, vegetarian: formData.vegetarian,
      budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
      city: formData.city, roomType: formData.roomType
    };
    fd.append('preferences', JSON.stringify(prefs));

    const res = await updateProfile(fd);
    if (res.success) toast.success('Profile updated successfully! AI matches will improve.');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="tenant" />
      <main className="main-content">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Profile & Preferences</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Complete your profile to get better AI matches</p>
        </div>

        <div className="card card-body" style={{ maxWidth: 800 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Avatar & Basic Info */}
            <div style={{ display: 'flex', gap: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <img src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=08B094&color=fff&size=128`} alt="" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg)' }} />
                <label style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--surface)' }}>
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div><label className="input-label">Full Name</label><input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div><label className="input-label">Phone</label><input type="tel" className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
              </div>
            </div>

            {/* AI Preferences */}
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>AI Match Preferences</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>These details are used by our AI to find your perfect room and flatmates.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label className="input-label">Target City</label>
                  <input type="text" className="input" placeholder="e.g. Bangalore" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Max Budget (₹/mo)</label>
                  <input type="number" className="input" placeholder="20000" value={formData.budgetMax} onChange={e => setFormData({ ...formData, budgetMax: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">Preferred Room Type</label>
                  <select className="input select" value={formData.roomType} onChange={e => setFormData({ ...formData, roomType: e.target.value })}>
                    <option value="any">Any</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="entire">Entire Place</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div>
                  <label className="input-label">Your Gender</label>
                  <select className="input select" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="any">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Your Occupation</label>
                  <select className="input select" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })}>
                    <option value="any">Other</option>
                    <option value="student">Student</option>
                    <option value="professional">Working Professional</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', padding: 'var(--space-4)', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  <input type="checkbox" checked={formData.smoking} onChange={e => setFormData({ ...formData, smoking: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--secondary)' }} />
                  I Smoke
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  <input type="checkbox" checked={formData.pets} onChange={e => setFormData({ ...formData, pets: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--secondary)' }} />
                  I have Pets
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  <input type="checkbox" checked={formData.vegetarian} onChange={e => setFormData({ ...formData, vegetarian: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--secondary)' }} />
                  I am strictly Vegetarian
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
              <button type="submit" disabled={isLoading} className="btn btn-secondary">
                {isLoading ? 'Saving...' : <><Save size={16} /> Save Profile & Preferences</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TenantProfile;
