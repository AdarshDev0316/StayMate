import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Stores
import useAuthStore from './store/authStore';
import { useSocket } from './hooks/useSocket';

// Pages — Public
import LandingPage from './pages/public/LandingPage';
import BrowseListings from './pages/public/BrowseListings';
import ListingDetails from './pages/public/ListingDetails';

// Pages — Auth
import OwnerRegister from './pages/auth/OwnerRegister';
import OwnerLogin from './pages/auth/OwnerLogin';
import TenantRegister from './pages/auth/TenantRegister';
import TenantLogin from './pages/auth/TenantLogin';
import VerifyEmail from './pages/auth/VerifyEmail';
import AuthCallback from './pages/auth/AuthCallback';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Pages — Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';
import CreateListing from './pages/owner/CreateListing';
import MyListings from './pages/owner/MyListings';
import EditListing from './pages/owner/EditListing';
import InterestRequests from './pages/owner/InterestRequests';
import OwnerChat from './pages/owner/OwnerChat';
import OwnerProfile from './pages/owner/OwnerProfile';

// Pages — Tenant
import TenantDashboard from './pages/tenant/TenantDashboard';
import MyMatches from './pages/tenant/MyMatches';
import MyRequests from './pages/tenant/MyRequests';
import SavedListings from './pages/tenant/SavedListings';
import TenantChat from './pages/tenant/TenantChat';
import TenantProfile from './pages/tenant/TenantProfile';

// Pages — Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ListingManagement from './pages/admin/ListingManagement';

// Layout
import Navbar from './components/common/Navbar';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

// ─── Public-only Route (redirect if logged in) ────────────────────────────────
const GuestRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <Outlet />;
};

// ─── Socket Initializer ───────────────────────────────────────────────────────
const SocketInitializer = () => {
  useSocket();
  return null;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { isAuthenticated, fetchMe, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchMe();
    }
  }, []);

  return (
    <BrowserRouter>
      {isAuthenticated && <SocketInitializer />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#08B094', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/browse" element={<><Navbar /><BrowseListings /></>} />
        <Route path="/listings/:id" element={<><Navbar /><ListingDetails /></>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── Auth (guest only) ────────────────────────────────────────── */}
        <Route element={<GuestRoute />}>
          <Route path="/owner/register" element={<OwnerRegister />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/tenant/register" element={<TenantRegister />} />
          <Route path="/tenant/login" element={<TenantLogin />} />
          <Route path="/login" element={<TenantLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* ── Owner Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['owner']} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/listings/create" element={<CreateListing />} />
          <Route path="/owner/listings" element={<MyListings />} />
          <Route path="/owner/listings/:id/edit" element={<EditListing />} />
          <Route path="/owner/interests" element={<InterestRequests />} />
          <Route path="/owner/chat" element={<OwnerChat />} />
          <Route path="/owner/chat/:conversationId" element={<OwnerChat />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
        </Route>

        {/* ── Tenant Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['tenant']} />}>
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="/tenant/profile/create" element={<TenantProfile />} />
          <Route path="/tenant/matches" element={<MyMatches />} />
          <Route path="/tenant/requests" element={<MyRequests />} />
          <Route path="/tenant/saved" element={<SavedListings />} />
          <Route path="/tenant/chat" element={<TenantChat />} />
          <Route path="/tenant/chat/:conversationId" element={<TenantChat />} />
          <Route path="/tenant/profile" element={<TenantProfile />} />
        </Route>

        {/* ── Admin Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/listings" element={<ListingManagement />} />
        </Route>

        {/* ── Fallback ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
