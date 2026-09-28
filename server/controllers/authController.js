const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MagicLink = require('../models/MagicLink');
const {
  generateToken,
  hashToken,
  sendMagicLink,
} = require('../services/magicLink');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signJWT(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * POST /api/auth/google
 * Body: { credential } — Google ID token from the client
 */
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      // New Google user — default role is 'employer'.
      // Admins and providers are seeded or promoted manually.
      user = await User.create({
        googleId,
        email,
        name,
        role: 'employer',
      });
    }

    const token = signJWT(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

/**
 * POST /api/auth/magic-link
 * Body: { phone, channel? }
 */
exports.requestMagicLink = async (req, res) => {
  try {
    const { phone, channel = 'whatsapp' } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Find or create trainee user by phone
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        phone,
        name: phone, // placeholder until trainee updates profile
        role: 'trainee',
      });
    }

    // Generate token pair
    const { raw, hashed } = generateToken();

    // Store hashed token with 15-minute expiry
    await MagicLink.create({
      token: hashed,
      userId: user._id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      channel,
    });

    // Send (mock for now — logs to console)
    await sendMagicLink(phone, raw, channel);

    res.json({ message: 'Magic link sent', channel });
  } catch (err) {
    console.error('Magic link error:', err);
    res.status(500).json({ message: 'Failed to send magic link' });
  }
};

/**
 * GET /api/auth/magic-link/verify/:token
 */
exports.verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.params;
    const hashed = hashToken(token);

    const link = await MagicLink.findOne({
      token: hashed,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!link) {
      return res.status(400).json({ message: 'Invalid or expired link' });
    }

    // Mark as used (single-use)
    link.usedAt = new Date();
    await link.save();

    const user = await User.findById(link.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const jwtToken = signJWT(user);
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Verify magic link error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

/**
 * POST /api/auth/dev-login
 * Body: { role } - dev only bypass for quick local testing
 */
exports.devLogin = async (req, res) => {
  try {
    const { role = 'admin' } = req.body;
    let user = await User.findOne({ role });
    if (!user) {
      user = await User.create({
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
        email: `${role}@voctrack.in`,
        role,
        status: 'active',
      });
    }

    const token = signJWT(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Dev login error:', err);
    res.status(500).json({ message: 'Dev login failed' });
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

