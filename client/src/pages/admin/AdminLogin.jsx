import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const res = await login({ ...data, role: 'admin' });
    if (res.success) {
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } else {
      toast.error(res.message || 'Invalid admin credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 'var(--space-6)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--danger), #BE123C)', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
            <Shield size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>Admin Portal</h1>
          <p style={{ opacity: 0.9, fontSize: 'var(--text-sm)' }}>Sign in to manage the StayMate platform</p>
        </div>

        <div className="card-body" style={{ padding: 'var(--space-8)' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            
            <div className="input-group">
              <label className="input-label">Admin Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="admin@staymate.com" {...register('email')} />
              </div>
              {errors.email && <p className="input-error-text">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input type="password" className={`input ${errors.password ? 'input-error' : ''}`} placeholder="••••••••" {...register('password')} />
              </div>
              {errors.password && <p className="input-error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-danger btn-lg" style={{ marginTop: 'var(--space-2)', width: '100%', justifyContent: 'center' }}>
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
