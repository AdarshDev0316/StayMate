import React, { useState, useEffect } from 'react';
import { Users, Building2, TrendingUp, BarChart3, Shield, Loader2, ArrowRight } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';

const StatCard = ({ title, value, icon, bg, color }) => (
  <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{title}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Admin stats would normally come from an admin analytics endpoint
    // For now we simulate with promises
    const fetchStats = async () => {
      try {
        const [usersRes, listingsRes] = await Promise.all([
          api.get('/admin/users'), // Assume implemented
          api.get('/admin/listings') // Assume implemented
        ]);
        setStats({
          users: usersRes.data?.data?.pagination?.total || 42,
          listings: listingsRes.data?.data?.pagination?.total || 18,
          matches: 156, // Mock metric
          successRate: 85 // Mock metric
        });
      } catch {
        // Fallback mock if API not fully implemented
        setStats({ users: 124, listings: 45, matches: 312, successRate: 78 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="admin" />
      <main className="main-content">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}><Shield color="var(--primary)" /> Admin Control Panel</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Platform overview and management</p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}><Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
              <StatCard title="Total Users" value={stats.users} icon={<Users size={24} />} bg="var(--primary-light)" color="var(--primary)" />
              <StatCard title="Active Listings" value={stats.listings} icon={<Building2 size={24} />} bg="var(--secondary-light)" color="var(--secondary)" />
              <StatCard title="AI Matches Made" value={stats.matches} icon={<Sparkles size={24} />} bg="var(--warning-light)" color="var(--warning-dark)" />
              <StatCard title="Success Rate" value={`${stats.successRate}%`} icon={<TrendingUp size={24} />} bg="var(--success-light)" color="var(--success-dark)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
              <div className="card">
                <div className="card-header"><h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Recent Users</h3></div>
                <div className="card-body" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <BarChart3 size={48} style={{ opacity: 0.2, margin: '0 auto var(--space-4)' }} />
                  <p>User registration chart goes here</p>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Platform Activity</h3></div>
                <div className="card-body" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <BarChart3 size={48} style={{ opacity: 0.2, margin: '0 auto var(--space-4)' }} />
                  <p>Listings & Interests activity chart goes here</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
