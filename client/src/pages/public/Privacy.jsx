import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';

const Privacy = () => {
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
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--text)' }}>Privacy Policy</h1>
        </div>
        
        <div style={{ background: 'var(--surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', lineHeight: 1.7, color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: 'var(--space-4)' }}><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>2. How We Use Information</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>We may use the information we collect to: provide, maintain, and improve our services; perform internal operations; send you communications we think will be of interest to you; and personalize and improve the services.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>3. Sharing of Information</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>We may share the information we collect about you with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf; in response to a request for information by a competent authority if we believe disclosure is in accordance with any applicable law, regulation, or legal process.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>4. Security</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text)', fontWeight: 700, marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>5. Contact Us</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>If you have any questions about this Privacy Policy, please contact us at support@staymate.com.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
