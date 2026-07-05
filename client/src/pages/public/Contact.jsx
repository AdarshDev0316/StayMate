import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={{ paddingTop: 'var(--navbar-height)', background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: 1000 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--text)', marginBottom: 'var(--space-4)' }}>Contact Us</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', maxWidth: 600, margin: '0 auto' }}>Have a question, feedback, or need support? Our team is here to help you out.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)' }}>
          
          {/* Left Column: Info */}
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-6)', color: 'var(--text)' }}>Get in Touch</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--space-1)' }}>Email Support</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>support@staymate.com<br />Expected response time: 24 hours</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} color="var(--secondary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--space-1)' }}>Phone Inquiry</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>+91 (800) 123-4567<br />Mon-Fri, 9am - 6pm IST</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'rgba(8, 176, 148, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} color="#0EA5A4" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text)', marginBottom: 'var(--space-1)' }}>Office Location</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Tech Park, Koramangala<br />Bangalore, KA 560034</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Form */}
          <div style={{ background: 'var(--surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-6)', color: 'var(--text)' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="label">Your Name</label>
                <input type="text" className="input" placeholder="John Doe" required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="john@example.com" required />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input" rows="4" placeholder="How can we help you?" required style={{ resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-2)', gap: 'var(--space-2)' }}>
                {sent ? 'Message Sent!' : <>Send Message <Send size={16} /></>}
              </button>
            </form>
          </div>

        </div>
      </div>
      
      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 768px) {
          .container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;
