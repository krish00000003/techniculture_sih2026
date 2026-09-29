const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema(
  {
    traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
    milestone: { type: Number, enum: [3, 6, 12, 24], default: 3 },
    surveyType: { type: String, default: 'Post-Placement Milestone Follow-Up' },
    employmentStatus: {
      type: String,
      enum: ['Employed', 'Self-Employed', 'Apprentice', 'Unemployed'],
      required: true,
    },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    channelLevel: { type: String, default: 'web' },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'completed',
    },
    rewardAmount: { type: Number, default: 50 },
    rewardStatus: {
      type: String,
      enum: ['credited', 'processing', 'capped'],
      default: 'credited',
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

surveySchema.index({ traineeId: 1, milestone: 1 });

module.exports = mongoose.model('Survey', surveySchema);
