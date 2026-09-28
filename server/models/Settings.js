const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    escalation: {
      surveyWindowDays: { type: Number, default: 14 },
      whatsappDelayHours: { type: Number, default: 0 },
      ivrDelayHours: { type: Number, default: 48 },
      backupContactDelayHours: { type: Number, default: 96 },
      coordinatorDelayHours: { type: Number, default: 168 },
    },
    rewards: {
      surveyCompletionAmount: { type: Number, default: 50 },
      currency: { type: String, default: 'INR' },
    },
    velocityCaps: {
      perPersonPerDay: { type: Number, default: 1 },
      perPersonTotal: { type: Number, default: 10 },
      dailyBudget: { type: Number, default: 10000 },
      monthlyBudget: { type: Number, default: 200000 },
    },
    alertThresholds: {
      dropoutRatePercent: { type: Number, default: 20 },
      failingScorePercent: { type: Number, default: 40 },
      unemploymentMonths: { type: Number, default: 6 },
      lowAttendancePercent: { type: Number, default: 60 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
