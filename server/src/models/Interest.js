const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
    // ── AI Compatibility ──────────────────────────────────────────────────────
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    aiConfidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: null,
    },
    aiExplanation: { type: String, default: null },
    aiPros: [{ type: String }],
    aiCons: [{ type: String }],
    aiRecommendations: [{ type: String }],
    aiFallback: { type: Boolean, default: false }, // true if rule-based was used

    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      trim: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Prevent duplicate interest by same tenant for same listing
interestSchema.index({ listing: 1, tenant: 1 }, { unique: true });
interestSchema.index({ owner: 1, status: 1, createdAt: -1 });
interestSchema.index({ tenant: 1, status: 1, createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
interestSchema.virtual('isHighMatch').get(function () {
  return this.aiScore !== null && this.aiScore >= 80;
});

const Interest = mongoose.model('Interest', interestSchema);
module.exports = Interest;
