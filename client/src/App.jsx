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
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Contact from './pages/public/Contact';

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

// ─── Document Title Manager ──────────────────────────────────────────────────
const PageTitle = ({ title, children }) => {
  useEffect(() => {
    document.title = title ? `${title} | StayMate` : 'StayMate | Rent & Flatmate Finder';
  }, [title]);
  return children ? children : <Outlet />;
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
            iconTheme: { primary: '#1F7A4D', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/" element={<PageTitle title="Home"><Navbar /><LandingPage /></PageTitle>} />
        <Route path="/browse" element={<PageTitle title="Browse Rooms"><Navbar /><BrowseListings /></PageTitle>} />
        <Route path="/listings/:id" element={<PageTitle title="Room Details"><Navbar /><ListingDetails /></PageTitle>} />
        <Route path="/verify-email" element={<PageTitle title="Verify Email"><VerifyEmail /></PageTitle>} />
        <Route path="/auth/callback" element={<PageTitle title="Authenticating..."><AuthCallback /></PageTitle>} />
        <Route path="/forgot-password" element={<PageTitle title="Forgot Password"><ForgotPassword /></PageTitle>} />
        <Route path="/reset-password" element={<PageTitle title="Reset Password"><ResetPassword /></PageTitle>} />
        <Route path="/privacy" element={<PageTitle title="Privacy Policy"><Navbar /><Privacy /></PageTitle>} />
        <Route path="/terms" element={<PageTitle title="Terms of Service"><Navbar /><Terms /></PageTitle>} />
        <Route path="/contact" element={<PageTitle title="Contact Us"><Navbar /><Contact /></PageTitle>} />

        {/* ── Auth (guest only) ────────────────────────────────────────── */}
        <Route element={<GuestRoute />}>
          <Route path="/owner/register" element={<PageTitle title="Owner Registration"><OwnerRegister /></PageTitle>} />
          <Route path="/owner/login" element={<PageTitle title="Owner Login"><OwnerLogin /></PageTitle>} />
          <Route path="/tenant/register" element={<PageTitle title="Tenant Registration"><TenantRegister /></PageTitle>} />
          <Route path="/tenant/login" element={<PageTitle title="Tenant Login"><TenantLogin /></PageTitle>} />
          <Route path="/login" element={<PageTitle title="Login"><TenantLogin /></PageTitle>} />
          <Route path="/admin/login" element={<PageTitle title="Admin Login"><AdminLogin /></PageTitle>} />
        </Route>

        {/* ── Owner Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['owner']} />}>
          <Route path="/owner/dashboard" element={<PageTitle title="Owner Dashboard"><OwnerDashboard /></PageTitle>} />
          <Route path="/owner/listings/create" element={<PageTitle title="Create Listing"><CreateListing /></PageTitle>} />
          <Route path="/owner/listings" element={<PageTitle title="My Listings"><MyListings /></PageTitle>} />
          <Route path="/owner/listings/:id/edit" element={<PageTitle title="Edit Listing"><EditListing /></PageTitle>} />
          <Route path="/owner/interests" element={<PageTitle title="Interest Requests"><InterestRequests /></PageTitle>} />
          <Route path="/owner/chat" element={<PageTitle title="Messages"><OwnerChat /></PageTitle>} />
          <Route path="/owner/chat/:conversationId" element={<PageTitle title="Messages"><OwnerChat /></PageTitle>} />
          <Route path="/owner/profile" element={<PageTitle title="My Profile"><OwnerProfile /></PageTitle>} />
        </Route>

        {/* ── Tenant Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['tenant']} />}>
          <Route path="/tenant/dashboard" element={<PageTitle title="Tenant Dashboard"><TenantDashboard /></PageTitle>} />
          <Route path="/tenant/profile/create" element={<PageTitle title="Create Profile"><TenantProfile /></PageTitle>} />
          <Route path="/tenant/matches" element={<PageTitle title="My Matches"><MyMatches /></PageTitle>} />
          <Route path="/tenant/requests" element={<PageTitle title="My Requests"><MyRequests /></PageTitle>} />
          <Route path="/tenant/saved" element={<PageTitle title="Saved Rooms"><SavedListings /></PageTitle>} />
          <Route path="/tenant/chat" element={<PageTitle title="Messages"><TenantChat /></PageTitle>} />
          <Route path="/tenant/chat/:conversationId" element={<PageTitle title="Messages"><TenantChat /></PageTitle>} />
          <Route path="/tenant/profile" element={<PageTitle title="My Profile"><TenantProfile /></PageTitle>} />
        </Route>

        {/* ── Admin Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin/dashboard" element={<PageTitle title="Admin Dashboard"><AdminDashboard /></PageTitle>} />
          <Route path="/admin/users" element={<PageTitle title="User Management"><UserManagement /></PageTitle>} />
          <Route path="/admin/listings" element={<PageTitle title="Listing Management"><ListingManagement /></PageTitle>} />
        </Route>

        {/* ── Fallback ─────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
