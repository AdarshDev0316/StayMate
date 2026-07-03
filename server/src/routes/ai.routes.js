const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { isTenant } = require('../middlewares/role.middleware');
const { computeCompatibilityScore, getRecommendations } = require('../services/aiService');
const Listing = require('../models/Listing');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Get AI compatibility score for a single listing
router.post('/match', protect, isTenant, asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found.');

  const tenant = await User.findById(req.user._id);
  const result = await computeCompatibilityScore(tenant, listing);

  res.json(new ApiResponse(200, { ...result, listingId }, 'AI compatibility score computed.'));
}));

// Get personalized recommendations for tenant
router.get('/recommendations', protect, isTenant, asyncHandler(async (req, res) => {
  const tenant = await User.findById(req.user._id);
  const { limit = 20 } = req.query;

  // Fetch active listings with pre-filter based on tenant preferences
  const preFilter = { status: 'active', isApproved: true };
  const prefs = tenant.preferences || {};

  if (prefs.city) preFilter['location.city'] = { $regex: prefs.city, $options: 'i' };
  if (prefs.budgetMax) preFilter.rent = { $lte: prefs.budgetMax * 1.2 }; // 20% buffer
  if (prefs.roomType && prefs.roomType !== 'any') preFilter.roomType = prefs.roomType;

  const listings = await Listing.find(preFilter)
    .sort({ createdAt: -1 })
    .limit(50) // Score top 50 candidates
    .lean();

  if (!listings.length) {
    return res.json(new ApiResponse(200, { recommendations: [] }, 'No listings found matching your preferences.'));
  }

  const recommendations = await getRecommendations(tenant, listings);

  res.json(new ApiResponse(200, {
    recommendations: recommendations.slice(0, Number(limit)),
    total: recommendations.length,
  }, 'AI recommendations generated.'));
}));

module.exports = router;
