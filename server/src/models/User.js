const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned by default
    },
    role: {
      type: String,
      enum: {
        values: ['owner', 'tenant', 'admin'],
        message: 'Role must be owner, tenant, or admin',
      },
      required: [true, 'Role is required'],
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },

    // ── Tenant Preferences ───────────────────────────────────────────────
    preferences: {
      location: { type: String, trim: true },
      city: { type: String, trim: true },
      budgetMin: { type: Number, min: 0 },
      budgetMax: { type: Number, min: 0 },
      moveInDate: { type: Date },
      roomType: {
        type: String,
        enum: ['single', 'double', 'shared', 'entire', 'any'],
        default: 'any',
      },
      furnishing: {
        type: String,
        enum: ['fully', 'semi', 'unfurnished', 'any'],
        default: 'any',
      },
      lifestyle: {
        smoking: { type: Boolean, default: false },
        pets: { type: Boolean, default: false },
        vegetarian: { type: Boolean, default: false },
        workSchedule: {
          type: String,
          enum: ['day', 'night', 'flexible', 'any'],
          default: 'any',
        },
      },
      amenities: [{ type: String }],
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'any'],
        default: 'any',
      },
      occupation: {
        type: String,
        enum: ['student', 'professional', 'any'],
        default: 'any',
      },
      bio: { type: String, maxlength: 500 },
    },

    savedListings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],

    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    isDummy: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ 'preferences.city': 1 });

// ─── Virtual: Avatar URL with Fallback ───────────────────────────────────────
userSchema.virtual('avatarUrl').get(function () {
  return this.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=4C5CE7&color=fff&size=128`;
});

// ─── Pre-save: Hash Password ──────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Method: Compare Password ─────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: Safe User Object ─────────────────────────────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationTokenExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
