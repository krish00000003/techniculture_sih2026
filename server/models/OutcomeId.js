const mongoose = require('mongoose');

const outcomeIdSchema = new mongoose.Schema(
  {
    outcomeId: { type: String, required: true, unique: true },
    linkedTraineeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainee' }],
    matchScore: { type: Number, min: 0, max: 100 },
    reviewStatus: {
      type: String,
      enum: ['pending', 'merged', 'rejected', 'auto-merged'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

outcomeIdSchema.index({ reviewStatus: 1 });

module.exports = mongoose.model('OutcomeId', outcomeIdSchema);
