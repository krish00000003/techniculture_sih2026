const mongoose = require('mongoose');

const traineeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    outcomeId: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    district: { type: String },
    language: { type: String, default: 'en' },
    backupContact: {
      name: String,
      phone: String,
    },
    coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jobPoolOptIn: { type: Boolean, default: false },
    employmentStatus: {
      type: String,
      enum: ['employed', 'self-employed', 'unemployed', 'apprentice', 'unknown', 'seeking'],
      default: 'unknown',
    },
    upiId: { type: String },
  },
  { timestamps: true }
);

traineeSchema.index({ outcomeId: 1 });
traineeSchema.index({ district: 1 });

module.exports = mongoose.model('Trainee', traineeSchema);
