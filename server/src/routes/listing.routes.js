const express = require('express');
const router = express.Router();
const {
  createListing, getListings, getListing, getMyListings,
  updateListing, deleteListingImage, updateListingStatus,
  deleteListing, toggleSaveListing,
} = require('../controllers/listingController');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { isOwner, isTenant } = require('../middlewares/role.middleware');
const { uploadListingImages } = require('../config/cloudinary');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', optionalAuth, getListings);
router.get('/:id', optionalAuth, getListing);

// ── Owner Routes ──────────────────────────────────────────────────────────────
router.post('/', protect, isOwner, uploadListingImages.array('images', 10), createListing);
router.get('/owner/my-listings', protect, isOwner, getMyListings);
router.put('/:id', protect, isOwner, uploadListingImages.array('images', 10), updateListing);
router.delete('/:id/images/:imageId', protect, isOwner, deleteListingImage);
router.patch('/:id/status', protect, isOwner, updateListingStatus);
router.delete('/:id', protect, isOwner, deleteListing);

// ── Tenant Routes ─────────────────────────────────────────────────────────────
router.post('/:id/save', protect, isTenant, toggleSaveListing);

module.exports = router;
