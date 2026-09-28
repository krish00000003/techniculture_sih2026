const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['high_dropout', 'failing_course', 'chronic_unemployment', 'low_attendance', 'other'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId }, // provider, course, or trainee
    targetType: { type: String, enum: ['provider', 'course', 'trainee'] },
    targetName: { type: String },
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      required: true,
    },
    message: { type: String, required: true },
    suggestedAction: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

alertSchema.index({ status: 1 });
alertSchema.index({ severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
