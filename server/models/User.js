const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['trainee', 'employer', 'provider', 'admin', 'manager', 'supervisor'],
      required: true,
    },
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, index: true, sparse: true },
    phone: { type: String, index: true, sparse: true },
    password: { type: String },
    name: { type: String, required: true },
    outcomeId: { type: String, index: true, sparse: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending_approval'],
      default: 'active',
    },
    lastLoginAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
