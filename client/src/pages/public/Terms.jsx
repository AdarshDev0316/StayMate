import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: 'var(--navbar-height)', background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--text)' }}>Terms of Service</h1>
        </div>
        
        <div style={{ background: 'var(--surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: 'var(--space-4)' }}><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>By accessing and using StayMate, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>2. User Responsibilities</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information when registering for an account. You must not use our platform for any unlawful or prohibited activities.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>3. Listings and Transactions</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>StayMate acts as a platform to connect property owners and tenants. We do not own, manage, or endorse any properties listed on our site. Any agreements or transactions made between users are solely the responsibility of the parties involved.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>4. Termination</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>We reserve the right to suspend or terminate your access to our services at any time, with or without cause, and without prior notice.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>5. Changes to Terms</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>We may update these Terms of Service from time to time. We will notify you of any significant changes by posting the new terms on our website. Your continued use of the platform after such modifications constitutes your acceptance of the revised terms.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
