const Interest = require('../models/Interest');
const Listing = require('../models/Listing');
const { Conversation, Message } = require('../models/Conversation');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { emitToUser } = require('../config/socket');
const {
  sendInterestReceivedEmail,
  sendInterestAcceptedEmail,
  sendInterestDeclinedEmail,
} = require('../services/emailService');
const { computeCompatibilityScore } = require('../services/aiService');
const User = require('../models/User');

// ─── Send Interest ────────────────────────────────────────────────────────────
const sendInterest = asyncHandler(async (req, res) => {
  const { listingId, message } = req.body;

  const listing = await Listing.findById(listingId).populate('owner', 'name email');
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.status !== 'active') throw new ApiError(400, 'This listing is no longer available.');
  if (listing.owner._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot express interest in your own listing.');
  }

  // Check duplicate
  const existing = await Interest.findOne({ listing: listingId, tenant: req.user._id });
  if (existing) throw new ApiError(409, 'You have already expressed interest in this listing.');

  // Compute AI score
  const tenant = await User.findById(req.user._id);
  let aiResult = { score: null, confidence: null, explanation: null, pros: [], cons: [], recommendations: [], fallback: false };

  try {
    aiResult = await computeCompatibilityScore(tenant, listing);
  } catch (err) {
    console.warn('AI scoring failed:', err.message);
  }

  const interest = await Interest.create({
    listing: listingId,
    tenant: req.user._id,
    owner: listing.owner._id,
    message,
    aiScore: aiResult.score,
    aiConfidence: aiResult.confidence,
    aiExplanation: aiResult.explanation,
    aiPros: aiResult.pros,
    aiCons: aiResult.cons,
    aiRecommendations: aiResult.recommendations,
    aiFallback: aiResult.fallback,
  });

  // Increment listing interest count
  await Listing.findByIdAndUpdate(listingId, { $inc: { interestedCount: 1 } });

  // Create in-app notification for owner
  const notification = await Notification.create({
    user: listing.owner._id,
    type: 'interest_received',
    title: 'New Interest Request',
    body: `${tenant.name} is interested in "${listing.title}"${aiResult.score ? ` (${aiResult.score}% match)` : ''}`,
    data: { interestId: interest._id, listingId, tenantId: req.user._id },
  });

  // Push real-time notification to owner if online
  emitToUser(listing.owner._id.toString(), 'new_notification', { notification });

  // Send email to owner for high-match interests (score >= 70) or if no score
  if (aiResult.score === null || aiResult.score >= 70) {
    sendInterestReceivedEmail(listing.owner, tenant, listing, interest).catch(() => {});
  }

  await interest.populate([
    { path: 'tenant', select: 'name avatar email preferences' },
    { path: 'listing', select: 'title location rent roomType images' },
  ]);

  res.status(201).json(
    new ApiResponse(201, { interest }, 'Interest sent successfully.')
  );
});

// ─── Get Owner's Interests ────────────────────────────────────────────────────
const getOwnerInterests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { owner: req.user._id };
  if (status && status !== 'all') query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [interests, total] = await Promise.all([
    Interest.find(query)
      .populate('tenant', 'name avatar email preferences lastSeen')
      .populate('listing', 'title location rent roomType images status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Interest.countDocuments(query),
  ]);

  // Count by status
  const counts = await Interest.aggregate([
    { $match: { owner: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const statusCounts = { all: 0, pending: 0, accepted: 0, declined: 0 };
  counts.forEach(c => {
    statusCounts[c._id] = c.count;
    statusCounts.all += c.count;
  });

  res.status(200).json(
    new ApiResponse(200, {
      interests,
      statusCounts,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'Interests fetched.')
  );
});

// ─── Get Tenant's Interests ───────────────────────────────────────────────────
const getTenantInterests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { tenant: req.user._id };
  if (status && status !== 'all') query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [interests, total] = await Promise.all([
    Interest.find(query)
      .populate('owner', 'name avatar email lastSeen')
      .populate('listing', 'title location rent roomType images status furnishing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Interest.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      interests,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'Your requests fetched.')
  );
});

// ─── Accept Interest ──────────────────────────────────────────────────────────
const acceptInterest = asyncHandler(async (req, res) => {
  const interest = await Interest.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('tenant', 'name email avatar')
    .populate('listing', 'title location rent');

  if (!interest) throw new ApiError(404, 'Interest request not found.');
  if (interest.status !== 'pending') throw new ApiError(400, `Interest is already ${interest.status}.`);

  // Create conversation
  const conversation = await Conversation.create({
    participants: [req.user._id, interest.tenant._id],
    interest: interest._id,
    listing: interest.listing._id,
  });

  // Send system message
  await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: `Hi ${interest.tenant.name}! I've accepted your interest. Let's discuss the details.`,
    type: 'system',
  });

  await Conversation.findByIdAndUpdate(conversation._id, { lastMessageAt: new Date() });

  // Update interest
  interest.status = 'accepted';
  interest.conversationId = conversation._id;
  await interest.save();

  // Create notification for tenant
  const notification = await Notification.create({
    user: interest.tenant._id,
    type: 'interest_accepted',
    title: 'Interest Accepted! 🎉',
    body: `${req.user.name} accepted your interest in "${interest.listing.title}"`,
    data: { interestId: interest._id, conversationId: conversation._id },
  });

  emitToUser(interest.tenant._id.toString(), 'new_notification', { notification });
  sendInterestAcceptedEmail(interest.tenant, req.user, interest.listing).catch(() => {});

  res.status(200).json(
    new ApiResponse(200, { interest, conversationId: conversation._id }, 'Interest accepted. Chat enabled!')
  );
});

// ─── Decline Interest ─────────────────────────────────────────────────────────
const declineInterest = asyncHandler(async (req, res) => {
  const interest = await Interest.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('tenant', 'name email')
    .populate('listing', 'title');

  if (!interest) throw new ApiError(404, 'Interest request not found.');
  if (interest.status !== 'pending') throw new ApiError(400, `Interest is already ${interest.status}.`);

  interest.status = 'declined';
  await interest.save();

  // Notification for tenant
  const notification = await Notification.create({
    user: interest.tenant._id,
    type: 'interest_declined',
    title: 'Interest Update',
    body: `Your interest in "${interest.listing.title}" was not accepted this time.`,
    data: { interestId: interest._id },
  });

  emitToUser(interest.tenant._id.toString(), 'new_notification', { notification });
  sendInterestDeclinedEmail(interest.tenant, interest.listing).catch(() => {});

  res.status(200).json(
    new ApiResponse(200, { interest }, 'Interest declined.')
  );
});

module.exports = {
  sendInterest,
  getOwnerInterests,
  getTenantInterests,
  acceptInterest,
  declineInterest,
};
