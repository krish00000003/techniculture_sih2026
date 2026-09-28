const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    period: { type: String, required: true }, // e.g. 'Q1-2026'
    rawScore: { type: Number, required: true },
    adjustedScore: { type: Number, required: true },
    retentionPct: { type: Number },
    wageGrowthPct: { type: Number },
    cohortDifficulty: { type: Number },
    districtEconomyIndex: { type: Number },
  },
  { timestamps: true }
);

rankingSchema.index({ providerId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Ranking', rankingSchema);
