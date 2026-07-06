import React, { useState } from 'react';
import { Camera, Save, Shield } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const OwnerProfile = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' });
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

    const res = await updateProfile(fd);
    if (res.success) toast.success('Profile updated successfully');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="owner" />
      <main className="main-content">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>Profile Settings</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Manage your account details and verification</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          <div className="card card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ position: 'relative' }}>
                  <img src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4C5CE7&color=fff&size=128`} alt="" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg)' }} />
                  <label style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--surface)' }}>
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  </label>
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Profile Photo</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Upload a professional photo to build trust with tenants. (Max 5MB)</p>
                </div>
              </div>

              {/* Personal Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input type="tel" className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Email Address (Cannot be changed)</label>
                  <input type="email" className="input" value={user?.email} disabled />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
                <button type="submit" disabled={isLoading} className="btn btn-primary">
                  {isLoading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>

          <div className="card card-body" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-dark)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--success-light)', color: 'var(--success-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700 }}>Verification Status</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--success-dark)', fontWeight: 600 }}>Verified Owner</p>
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>Your email is verified. To increase your listing visibility, ensure your profile photo is clear and your contact details are up to date.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerProfile;
