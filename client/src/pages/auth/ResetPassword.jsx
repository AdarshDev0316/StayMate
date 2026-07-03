import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import api from '../../services/api';

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async ({ password }) => {
    const token = searchParams.get('token');
    if (!token) { toast.error('Invalid reset link'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg) 0%, var(--primary-light) 100%)', fontFamily: 'var(--font)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '2rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>StayMate</span>
        </div>

        {done ? (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={36} color="var(--success-dark)" />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Password Reset!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your password has been updated successfully. You can now log in with your new password.</p>
            <button onClick={() => navigate('/tenant/login')} className="btn btn-primary btn-full">Go to Login</button>
          </>
        ) : (
          <>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Lock size={28} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Reset Password</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: 'var(--text-sm)' }}>Enter your new password below.</p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <span className="input-icon"><Lock size={16} /></span>
                  <input
                    className={`input${errors.password ? ' error' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    style={{ paddingRight: '2.75rem' }}
                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', alignItems: 'center' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="input-error">{errors.password.message}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <span className="input-icon"><Lock size={16} /></span>
                  <input
                    className={`input${errors.confirmPassword ? ' error' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    style={{ paddingRight: '2.75rem' }}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (v) => v === watch('password') || 'Passwords do not match',
                    })}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', alignItems: 'center' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="input-error">{errors.confirmPassword.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset Password'}
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
