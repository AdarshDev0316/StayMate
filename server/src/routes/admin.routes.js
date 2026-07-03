const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Interest = require('../models/Interest');
const { Conversation } = require('../models/Conversation');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ── Platform Stats ────────────────────────────────────────────────────────────
router.get('/stats', protect, isAdmin, asyncHandler(async (req, res) => {
  const [totalUsers, totalOwners, totalTenants, totalListings, activeListings, filledListings, totalInterests, acceptedInterests] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'owner' }),
    User.countDocuments({ role: 'tenant' }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'active' }),
    Listing.countDocuments({ status: 'filled' }),
    Interest.countDocuments(),
    Interest.countDocuments({ status: 'accepted' }),
  ]);

  // Recent growth (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [newUsers, newListings] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Listing.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  res.json(new ApiResponse(200, {
    totalUsers, totalOwners, totalTenants,
    totalListings, activeListings, filledListings,
    totalInterests, acceptedInterests,
    successRate: totalInterests > 0 ? Math.round((acceptedInterests / totalInterests) * 100) : 0,
    recentActivity: { newUsers, newListings },
  }));
}));

// ── Get All Users ─────────────────────────────────────────────────────────────
router.get('/users', protect, isAdmin, asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json(new ApiResponse(200, { users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } }));
}));

// ── Suspend/Unsuspend User ────────────────────────────────────────────────────
router.patch('/users/:id/suspend', protect, isAdmin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(403, 'Cannot suspend another admin.');

  user.isActive = !user.isActive;
  await user.save();

  res.json(new ApiResponse(200, { user }, `User ${user.isActive ? 'reactivated' : 'suspended'}.`));
}));

// ── Get All Listings (Admin) ───────────────────────────────────────────────────
router.get('/listings', protect, isAdmin, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    Listing.find(query).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Listing.countDocuments(query),
  ]);

  res.json(new ApiResponse(200, { listings, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } }));
}));

// ── Approve/Reject Listing ────────────────────────────────────────────────────
router.patch('/listings/:id/approve', protect, isAdmin, asyncHandler(async (req, res) => {
  const { approved } = req.body;
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { isApproved: approved },
    { new: true }
  );
  if (!listing) throw new ApiError(404, 'Listing not found.');
  res.json(new ApiResponse(200, { listing }, `Listing ${approved ? 'approved' : 'rejected'}.`));
}));

// ── Delete Listing (Admin) ────────────────────────────────────────────────────
router.delete('/listings/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found.');
  res.json(new ApiResponse(200, {}, 'Listing removed by admin.'));
}));

module.exports = router;
