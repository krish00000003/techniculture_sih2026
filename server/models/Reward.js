const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    traineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
    surveyMilestone: { type: Number, enum: [3, 6, 12, 24] },
    title: { type: String, default: 'Milestone Check-in Reward' },
    type: {
      type: String,
      enum: ['upi', 'recharge'],
      default: 'upi',
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['paid', 'processing', 'capped', 'pending'],
      default: 'paid',
    },
    payoutMethod: { type: String }, // UPI ID or phone
    transactionRef: { type: String },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

rewardSchema.index({ traineeId: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
