const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    district: { type: String, required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

providerSchema.index({ district: 1 });

module.exports = mongoose.model('Provider', providerSchema);
