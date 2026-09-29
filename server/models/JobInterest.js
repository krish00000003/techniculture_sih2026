const mongoose = require('mongoose');

const jobInterestSchema = new mongoose.Schema(
  {
    traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['interested', 'applied', 'interviewing', 'hired'],
      default: 'interested',
    },
    notes: { type: String },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobInterestSchema.index({ traineeId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('JobInterest', jobInterestSchema);
