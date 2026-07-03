import React, { useState, useEffect } from 'react';
import { Users, Trash2, Edit, CheckCircle, Search, Shield, XCircle, Ban, Loader2 } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/users?search=${search}`);
      setUsers(res.data.data.users);
    } catch { toast.error('Failed to fetch users'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.patch(`/admin/users/${id}`, { action });
      toast.success(`User ${action}ed`);
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh' }}>
      <Sidebar role="admin" />
      <main className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, letterSpacing: '-0.03em' }}>User Management</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>View and manage all platform users</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div className="input-with-icon" style={{ flex: 1, maxWidth: 400 }}>
              <Search size={16} />
              <input type="text" className="input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {isLoading ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} /></div>
            ) : users.length === 0 ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <img src={u.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt="" className="avatar avatar-sm" />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{u.name}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'owner' ? 'primary' : 'secondary'}`}>{u.role}</span>
                      </td>
                      <td>
                        {u.isVerified ? <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: 4 }}/> Verified</span> : <span className="badge badge-warning">Unverified</span>}
                      </td>
                      <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          {u.role !== 'admin' && (
                            <button className="btn btn-outline btn-sm" onClick={() => handleAction(u._id, 'ban')} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}><Ban size={14} /> Ban</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
