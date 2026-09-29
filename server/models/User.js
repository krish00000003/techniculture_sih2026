const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['trainee', 'employer', 'provider', 'admin'],
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
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
