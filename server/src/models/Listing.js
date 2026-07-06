const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      trim: true,
    },
    location: {
      address: { type: String, trim: true },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true,
      },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      landmark: { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    rent: {
      type: Number,
      required: [true, 'Rent is required'],
      min: [0, 'Rent cannot be negative'],
      index: true,
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, 'Deposit cannot be negative'],
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: {
        values: ['single', 'double', 'shared', 'entire'],
        message: 'Room type must be single, double, shared, or entire',
      },
      index: true,
    },
    furnishing: {
      type: String,
      required: [true, 'Furnishing status is required'],
      enum: {
        values: ['fully', 'semi', 'unfurnished'],
        message: 'Furnishing must be fully, semi, or unfurnished',
      },
      index: true,
    },
    amenities: [
      {
        type: String,
        enum: [
          'WiFi', 'AC', 'Geyser', 'Washing Machine', 'Parking',
          'Security', 'Power Backup', 'Lift', 'CCTV', 'Gas Pipeline',
          'Gym', 'Swimming Pool', 'Garden', 'Play Area', 'Clubhouse',
        ],
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    availableFrom: {
      type: Date,
      required: [true, 'Available from date is required'],
    },
    // ── Owner Preferences for Tenants ────────────────────────────────────────
    preferences: {
      gender: {
        type: String,
        enum: ['any', 'male', 'female'],
        default: 'any',
      },
      occupation: {
        type: String,
        enum: ['any', 'student', 'professional'],
        default: 'any',
      },
      smoking: { type: Boolean, default: false },
      pets: { type: Boolean, default: false },
      vegetarian: { type: Boolean, default: false },
      maxTenants: { type: Number, default: 1 },
    },
    status: {
      type: String,
      enum: ['active', 'filled', 'archived'],
      default: 'active',
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approved; admin can toggle
      index: true,
    },
    views: { type: Number, default: 0 },
    interestedCount: { type: Number, default: 0 },
    isDummy: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
listingSchema.index({ 'location.city': 1, status: 1, rent: 1 });
listingSchema.index({ owner: 1, status: 1 });
listingSchema.index({ status: 1, isApproved: 1, createdAt: -1 });
listingSchema.index(
  { title: 'text', description: 'text', 'location.address': 'text', 'location.city': 'text' },
  { name: 'listing_text_search' }
);

// ─── Virtual: Primary Image ───────────────────────────────────────────────────
listingSchema.virtual('primaryImage').get(function () {
  return this.images?.[0]?.url || null;
});

// ─── Virtual: Is Available ────────────────────────────────────────────────────
listingSchema.virtual('isAvailable').get(function () {
  return this.status === 'active' && this.availableFrom <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
