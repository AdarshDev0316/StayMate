import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, Home, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg) 0%, var(--primary-light) 100%)', fontFamily: 'var(--font)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none', color: 'var(--text)' }}>
            <img src="/logo.jpg" alt="StayMate" style={{ height: '48px', objectFit: 'contain', borderRadius: '4px' }} />
          </Link>
        </div>

        {sent ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={36} color="var(--success-dark)" />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Check your inbox</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We've sent a password reset link to your email address. Check your spam folder if you don't see it.</p>
            <Link to="/tenant/login" className="btn btn-primary btn-full">Back to Login</Link>
          </>
        ) : (
          <>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Mail size={28} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Forgot your password?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: 'var(--text-sm)' }}>Enter your email address and we'll send you a link to reset your password.</p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon"><Mail size={16} /></span>
                  <input
                    className={`input${errors.email ? ' error' : ''}`}
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  />
                </div>
                {errors.email && <span className="input-error">{errors.email.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Sending…' : (<>Send Reset Link <ArrowRight size={16} /></>)}
              </button>
            </form>

            <Link to="/tenant/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
