const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
    title: { type: String, required: true },
    skills: [{ type: String }],
    district: { type: String },
    wageBand: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ district: 1 });
jobSchema.index({ active: 1 });

module.exports = mongoose.model('Job', jobSchema);
