const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['trainee', 'employer', 'provider', 'admin'],
      required: true,
    },
    googleId: { type: String, sparse: true },
    email: { type: String, sparse: true },
    phone: { type: String, sparse: true },
    name: { type: String, required: true },
    outcomeId: { type: String, sparse: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
