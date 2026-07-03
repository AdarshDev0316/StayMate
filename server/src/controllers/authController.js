const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');

// ─── Helper: Generate Tokens ──────────────────────────────────────────────────
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check duplicate
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Validate role
  if (!['owner', 'tenant'].includes(role)) {
    throw new ApiError(400, 'Role must be either owner or tenant.');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
    verificationTokenExpiry,
    isVerified: true, // Auto-verify for local testing
  });

  // Skip sending email in development to make testing easier
  // await sendVerificationEmail(user, verificationToken);

  res.status(201).json(
    new ApiResponse(201, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    }, 'Registration successful. Please check your email to verify your account.')
  );
});

// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) throw new ApiError(400, 'Verification token is required.');

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  }).select('+verificationToken +verificationTokenExpiry');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification link. Please request a new one.');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  // Send welcome email
  await sendWelcomeEmail(user);

  const { accessToken, refreshToken } = generateTokens(user._id);

  res.status(200).json(
    new ApiResponse(200, {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    }, 'Email verified successfully. Welcome to StayMate!')
  );
});

// ─── Login ────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.password) {
    throw new ApiError(401, 'This account uses Google Sign-In. Please log in with Google.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email before logging in.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been suspended. Contact support.');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  res.status(200).json(
    new ApiResponse(200, {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    }, 'Login successful.')
  );
});

// ─── Google OAuth Callback ────────────────────────────────────────────────────
const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, 'Google authentication failed.');

  const { accessToken, refreshToken } = generateTokens(user._id);

  // Redirect to frontend with tokens
  const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${user.role}`;
  res.redirect(redirectUrl);
});

// ─── Get Current User ─────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedListings', 'title location.city rent status');

  res.status(200).json(
    new ApiResponse(200, { user: user.toSafeObject() }, 'User profile fetched.')
  );
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new ApiError(400, 'Refresh token is required.');

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new ApiError(401, 'Invalid refresh token.');

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    res.status(200).json(
      new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed.')
    );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond success to prevent email enumeration
  if (user && user.password) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, resetToken);
  }

  res.status(200).json(
    new ApiResponse(200, {}, 'If an account exists with this email, you will receive a password reset link.')
  );
});

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpiry');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset link. Please request a new one.');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, {}, 'Password reset successfully. Please log in with your new password.')
  );
});

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

  // Handle avatar upload
  if (req.file) {
    updateData.avatar = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, { user: user.toSafeObject() }, 'Profile updated successfully.')
  );
});

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new ApiError(400, 'Current password is incorrect.');

  user.password = newPassword;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, {}, 'Password changed successfully.')
  );
});

module.exports = {
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
};
