import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Actions ──────────────────────────────────────────────────────────
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Set tokens + user after login/verify
      setAuth: ({ user, accessToken, refreshToken }) => {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true, error: null });
      },

      // Register
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', data);
          set({ isLoading: false });
          return { success: true, message: res.data.message };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      // Verify Email
      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/verify-email', { token });
          const { user, accessToken, refreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Verification failed';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      // Get current user
      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data.user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      // Update profile
      updateProfile: async (formData) => {
        set({ isLoading: true });
        try {
          const res = await api.put('/auth/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set({ user: res.data.data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Update failed';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        window.location.href = '/';
      },
    }),
    {
      name: 'staymate-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
