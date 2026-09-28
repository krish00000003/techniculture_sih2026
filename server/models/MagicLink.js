const mongoose = require('mongoose');

const magicLinkSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, index: true }, // stored hashed
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    channel: {
      type: String,
      enum: ['whatsapp', 'sms'],
      default: 'whatsapp',
    },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-deletes expired docs
magicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('MagicLink', magicLinkSchema);
