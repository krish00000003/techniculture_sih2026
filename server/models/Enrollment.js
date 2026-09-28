const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    batchId: { type: String },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped'],
      default: 'enrolled',
    },
    attendancePct: { type: Number, min: 0, max: 100 },
    assessmentScore: { type: Number, min: 0, max: 100 },
    dropReason: { type: String },
  },
  { timestamps: true }
);

enrollmentSchema.index({ traineeId: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ status: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
