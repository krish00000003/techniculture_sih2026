const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    title: { type: String, required: true },
    sector: { type: String, required: true },
    skills: [{ type: String }],
    durationWeeks: { type: Number },
  },
  { timestamps: true }
);

courseSchema.index({ sector: 1 });
courseSchema.index({ providerId: 1 });

module.exports = mongoose.model('Course', courseSchema);
