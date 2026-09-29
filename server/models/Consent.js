const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema(
  {
    traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
    granteeName: { type: String, required: true },
    granteeType: {
      type: String,
      enum: ['employer', 'provider', 'government', 'placement_agency', 'other'],
      default: 'employer',
    },
    granteeId: { type: mongoose.Schema.Types.ObjectId },
    scope: [{ type: String }], // e.g. ['Certifications & Scores', 'Contact Details', 'Attendance Records']
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

consentSchema.index({ traineeId: 1 });

module.exports = mongoose.model('Consent', consentSchema);
