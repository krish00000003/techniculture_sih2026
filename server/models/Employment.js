const mongoose = require('mongoose');

const employmentSchema = new mongoose.Schema(
  {
    traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
    employerName: { type: String, required: true },
    employerContact: { type: String }, // HR email or phone
    role: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    wage: { type: String },
    status: {
      type: String,
      enum: ['pending', 'verified', 'disputed', 'flagged'],
      default: 'pending',
    },
    verifiedByEmployer: { type: Boolean, default: false },
    verifyToken: { type: String, unique: true, sparse: true },
    tokenExpiresAt: { type: Date },
    verifiedAt: { type: Date },
    correctedWage: { type: String },
    correctedStartDate: { type: String },
    discrepancyNotes: { type: String },
    reminderSentAt: { type: Date },
  },
  { timestamps: true }
);

employmentSchema.index({ traineeId: 1 });

module.exports = mongoose.model('Employment', employmentSchema);
