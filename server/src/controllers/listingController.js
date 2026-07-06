const Listing = require('../models/Listing');
const Interest = require('../models/Interest');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { deleteImage } = require('../config/cloudinary');

// ─── Create Listing ───────────────────────────────────────────────────────────
const createListing = asyncHandler(async (req, res) => {
  const { title, description, location, rent, deposit, roomType, furnishing, amenities, availableFrom, preferences } = req.body;

  const images = req.files?.map(file => ({
    url: file.path,
    publicId: file.filename,
  })) || [];

  const listing = await Listing.create({
    owner: req.user._id,
    title,
    description,
    location: typeof location === 'string' ? JSON.parse(location) : location,
    rent: Number(rent),
    deposit: Number(deposit || 0),
    roomType,
    furnishing,
    amenities: typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []),
    availableFrom,
    preferences: typeof preferences === 'string' ? JSON.parse(preferences) : (preferences || {}),
    images,
  });

  await listing.populate('owner', 'name avatar email');

  res.status(201).json(
    new ApiResponse(201, { listing }, 'Listing created successfully.')
  );
});

// ─── Get All Listings (Public, with filters) ──────────────────────────────────
const getListings = asyncHandler(async (req, res) => {
  const {
    city, minRent, maxRent, roomType, furnishing, amenities,
    availableFrom, page = 1, limit = 12, sort = 'createdAt', search
  } = req.query;

  const query = { status: 'active', isApproved: true };

  if (city) query['location.city'] = { $regex: city, $options: 'i' };
  if (minRent || maxRent) {
    query.rent = {};
    if (minRent) query.rent.$gte = Number(minRent);
    if (maxRent) query.rent.$lte = Number(maxRent);
  }
  if (roomType && roomType !== 'any') query.roomType = roomType;
  if (furnishing && furnishing !== 'any') query.furnishing = furnishing;
  if (amenities) {
    const amenitiesArr = typeof amenities === 'string' ? amenities.split(',') : amenities;
    query.amenities = { $all: amenitiesArr };
  }
  if (availableFrom) query.availableFrom = { $lte: new Date(availableFrom) };
  if (search) query.$text = { $search: search };

  const sortOptions = {
    'createdAt': { createdAt: -1 },
    'rent_asc': { rent: 1 },
    'rent_desc': { rent: -1 },
    'views': { views: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    Listing.find(query)
      .populate('owner', 'name avatar lastSeen')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Listing.countDocuments(query),
  ]);

  // Increment views for fetched listings (fire-and-forget)
  Listing.updateMany({ _id: { $in: listings.map(l => l._id) } }, { $inc: { views: 1 } }).catch(() => {});

  res.status(200).json(
    new ApiResponse(200, {
      listings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }, 'Listings fetched.')
  );
});

// ─── Get Single Listing ───────────────────────────────────────────────────────
const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('owner', 'name avatar email lastSeen createdAt');

  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.status !== 'active' && !req.user) throw new ApiError(404, 'Listing not found.');

  // Increment views
  listing.views += 1;
  await listing.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, { listing }, 'Listing fetched.')
  );
});

// ─── Get Owner's Listings ─────────────────────────────────────────────────────
const getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { owner: req.user._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Listing.countDocuments(query),
  ]);

  // Get interest counts per listing
  const listingIds = listings.map(l => l._id);
  const interestCounts = await Interest.aggregate([
    { $match: { listing: { $in: listingIds } } },
    { $group: { _id: '$listing', count: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } } } },
  ]);

  const countMap = {};
  interestCounts.forEach(ic => { countMap[ic._id.toString()] = ic; });

  const listingsWithCounts = listings.map(l => ({
    ...l,
    interestCount: countMap[l._id.toString()]?.count || 0,
    pendingInterests: countMap[l._id.toString()]?.pending || 0,
  }));

  res.status(200).json(
    new ApiResponse(200, {
      listings: listingsWithCounts,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'Your listings fetched.')
  );
});

// ─── Update Listing ───────────────────────────────────────────────────────────
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({ _id: req.params.id, owner: req.user._id });
  if (!listing) throw new ApiError(404, 'Listing not found or access denied.');
  if (listing.isDummy) throw new ApiError(403, 'Cannot modify or delete dummy data.');

  const updates = { ...req.body };
  if (updates.location && typeof updates.location === 'string') updates.location = JSON.parse(updates.location);
  if (updates.amenities && typeof updates.amenities === 'string') updates.amenities = JSON.parse(updates.amenities);
  if (updates.preferences && typeof updates.preferences === 'string') updates.preferences = JSON.parse(updates.preferences);

  // Add new images if uploaded
  if (req.files?.length) {
    const newImages = req.files.map(file => ({ url: file.path, publicId: file.filename }));
    updates.images = [...(listing.images || []), ...newImages];
  }

  Object.assign(listing, updates);
  await listing.save();

  res.status(200).json(
    new ApiResponse(200, { listing }, 'Listing updated successfully.')
  );
});

// ─── Delete Listing Image ─────────────────────────────────────────────────────
const deleteListingImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const listing = await Listing.findOne({ _id: req.params.id, owner: req.user._id });
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.isDummy) throw new ApiError(403, 'Cannot modify or delete dummy data.');

  const imgIndex = listing.images.findIndex(img => img._id.toString() === imageId || img.publicId === imageId);
  if (imgIndex === -1) throw new ApiError(404, 'Image not found.');

  const img = listing.images[imgIndex];
  if (img.publicId) await deleteImage(img.publicId);

  listing.images.splice(imgIndex, 1);
  await listing.save();

  res.status(200).json(
    new ApiResponse(200, {}, 'Image deleted.')
  );
});

// ─── Update Listing Status ─────────────────────────────────────────────────────
const updateListingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'filled', 'archived'].includes(status)) {
    throw new ApiError(400, 'Invalid status value.');
  }

  const listing = await Listing.findOne({ _id: req.params.id, owner: req.user._id });
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.isDummy) throw new ApiError(403, 'Cannot modify or delete dummy data.');

  listing.status = status;
  await listing.save();

  res.status(200).json(
    new ApiResponse(200, { listing }, `Listing marked as ${status}.`)
  );
});

// ─── Delete Listing ───────────────────────────────────────────────────────────
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({ _id: req.params.id, owner: req.user._id });
  if (!listing) throw new ApiError(404, 'Listing not found.');
  if (listing.isDummy) throw new ApiError(403, 'Cannot modify or delete dummy data.');

  // Delete all images from Cloudinary
  await Promise.allSettled(
    listing.images.map(img => img.publicId ? deleteImage(img.publicId) : Promise.resolve())
  );

  await listing.deleteOne();

  res.status(200).json(
    new ApiResponse(200, {}, 'Listing deleted successfully.')
  );
});

// ─── Toggle Save Listing (Tenant) ─────────────────────────────────────────────
const toggleSaveListing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const listingId = req.params.id;

  const isSaved = user.savedListings.includes(listingId);
  if (isSaved) {
    user.savedListings.pull(listingId);
  } else {
    user.savedListings.addToSet(listingId);
  }
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { saved: !isSaved }, isSaved ? 'Listing unsaved.' : 'Listing saved.')
  );
});

module.exports = {
  createListing,
  getListings,
  getListing,
  getMyListings,
  updateListing,
  deleteListingImage,
  updateListingStatus,
  deleteListing,
  toggleSaveListing,
};
