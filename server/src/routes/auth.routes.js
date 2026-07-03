const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  googleCallback,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../config/cloudinary');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  googleCallback
);

// ── Protected Routes ──────────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
