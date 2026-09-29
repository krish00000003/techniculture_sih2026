const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Trainee = require('../models/Trainee');
const Employer = require('../models/Employer');
const Provider = require('../models/Provider');
const OutcomeId = require('../models/OutcomeId');
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
 * POST /api/auth/login
 * Body: { identifier, password }
 * identifier: email or phone number
 */
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email or phone and password are required' });
    }

    const cleanId = identifier.trim();
    // Search by email (case-insensitive) or by exact phone
    const user = await User.findOne({
      $or: [
        { email: cleanId.toLowerCase() },
        { phone: cleanId },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended. Please contact support.' });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created with Magic Link or Google Sign-In without a password. Please sign in using Magic Link or Google.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
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
        outcomeId: user.outcomeId,
      },
      message: 'Logged in successfully',
    });
  } catch (err) {
    console.error('Password login error:', err);
    res.status(500).json({ message: 'Login failed due to a server error' });
  }
};

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

    // Look for token that has not passed its expiration time
    const link = await MagicLink.findOne({
      token: hashed,
      expiresAt: { $gt: new Date() },
    });

    if (!link) {
      return res.status(400).json({ message: 'Invalid or expired link' });
    }

    // If the link was marked used more than 10 minutes ago, consider it fully spent
    if (link.usedAt && Date.now() - new Date(link.usedAt).getTime() > 10 * 60 * 1000) {
      return res.status(400).json({ message: 'This magic link has already been used' });
    }

    // Mark as used if not already marked
    if (!link.usedAt) {
      link.usedAt = new Date();
      await link.save();
    }

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
        email: user.email,
        role: user.role,
        outcomeId: user.outcomeId,
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

    if (role === 'trainee') {
      let trainee = await Trainee.findOne({ userId: user._id });
      if (!trainee) {
        await Trainee.create({
          userId: user._id,
          district: 'Kolkata',
          employmentStatus: 'unemployed',
          jobPoolOptIn: true,
        });
      }
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

/**
 * POST /api/auth/register
 * Body: { role, name, email, phone, companyName, gstin, cin, district, language }
 */
exports.register = async (req, res) => {
  try {
    const {
      role = 'trainee',
      name,
      email,
      phone,
      password,
      joinMethod = 'password',
      companyName,
      gstin,
      cin,
      district,
      language = 'en',
    } = req.body;

    if (!role || !['trainee', 'employer', 'provider'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required (trainee, employer, provider)' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    if (role === 'trainee') {
      if (!phone || !phone.trim()) {
        return res.status(400).json({ message: 'Phone number is required for trainee registration' });
      }

      const cleanPhone = phone.trim();
      let user = await User.findOne({ phone: cleanPhone });

      if (user) {
        // Complete/update existing trainee profile
        user.name = name.trim();
        if (email) user.email = email.trim().toLowerCase();
        if (hashedPassword) user.password = hashedPassword;
        if (!user.outcomeId) {
          user.outcomeId = 'OID-' + Math.floor(100000 + Math.random() * 900000);
        }
        await user.save();

        let trainee = await Trainee.findOne({ userId: user._id });
        if (!trainee) {
          trainee = await Trainee.create({
            userId: user._id,
            outcomeId: user.outcomeId,
            district: district ? district.trim() : 'Unspecified',
            language: language || 'en',
            employmentStatus: 'unemployed',
            jobPoolOptIn: true,
          });
        } else {
          if (district) trainee.district = district.trim();
          if (language) trainee.language = language;
          if (!trainee.outcomeId) trainee.outcomeId = user.outcomeId;
          await trainee.save();
        }

        // If user chose magic link, generate and send one
        if (joinMethod === 'magic-link') {
          const { raw, hashed } = generateToken();
          await MagicLink.create({
            token: hashed,
            userId: user._id,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            channel: 'whatsapp',
          });
          await sendMagicLink(cleanPhone, raw, 'whatsapp');
        }

        const token = signJWT(user);
        return res.status(200).json({
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            outcomeId: user.outcomeId,
          },
          message: 'Trainee profile completed successfully',
        });
      }

      // New trainee user
      const outcomeId = 'OID-' + Math.floor(100000 + Math.random() * 900000);

      user = await User.create({
        name: name.trim(),
        phone: cleanPhone,
        email: email ? email.trim().toLowerCase() : undefined,
        password: hashedPassword || undefined,
        role: 'trainee',
        outcomeId,
        status: 'active',
      });

      const trainee = await Trainee.create({
        userId: user._id,
        outcomeId,
        district: district ? district.trim() : 'Unspecified',
        language: language || 'en',
        employmentStatus: 'unemployed',
        jobPoolOptIn: true,
      });

      await OutcomeId.create({
        outcomeId,
        linkedTraineeIds: [trainee._id],
        matchScore: 100,
        reviewStatus: 'auto-merged',
      });

      // If trainee chose magic link, generate and send one
      if (joinMethod === 'magic-link') {
        const { raw, hashed } = generateToken();
        await MagicLink.create({
          token: hashed,
          userId: user._id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          channel: 'whatsapp',
        });
        await sendMagicLink(cleanPhone, raw, 'whatsapp');
      }

      const token = signJWT(user);
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          outcomeId: user.outcomeId,
        },
        message: 'Trainee registered successfully',
      });
    }

    if (role === 'employer') {
      if (!companyName || !companyName.trim()) {
        return res.status(400).json({ message: 'Company name is required' });
      }
      if (!email && !phone) {
        return res.status(400).json({ message: 'Email or phone number is required' });
      }

      const query = [];
      if (email) query.push({ email: email.trim().toLowerCase() });
      if (phone) query.push({ phone: phone.trim() });

      let user = null;
      if (query.length > 0) {
        user = await User.findOne({ $or: query });
      }

      if (user) {
        user.name = name.trim();
        user.role = 'employer';
        if (hashedPassword) user.password = hashedPassword;
        await user.save();

        let emp = await Employer.findOne({ userId: user._id });
        if (!emp) {
          emp = await Employer.create({
            userId: user._id,
            companyName: companyName.trim(),
            gstin: gstin ? gstin.trim().toUpperCase() : '27AAACG0000A1Z5',
            cin: cin ? cin.trim().toUpperCase() : undefined,
            registryStatus: 'verified',
            verified: true,
          });
        } else {
          emp.companyName = companyName.trim();
          if (gstin) emp.gstin = gstin.trim().toUpperCase();
          if (cin) emp.cin = cin.trim().toUpperCase();
          await emp.save();
        }

        const token = signJWT(user);
        return res.status(200).json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          message: 'Employer profile updated successfully',
        });
      }

      user = await User.create({
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        phone: phone ? phone.trim() : undefined,
        password: hashedPassword || undefined,
        role: 'employer',
        status: 'active',
      });

      await Employer.create({
        userId: user._id,
        companyName: companyName.trim(),
        gstin: gstin ? gstin.trim().toUpperCase() : '27AAACG0000A1Z5',
        cin: cin ? cin.trim().toUpperCase() : undefined,
        registryStatus: 'verified',
        verified: true,
      });

      const token = signJWT(user);
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        message: 'Employer registered successfully',
      });
    }

    if (role === 'provider') {
      if (!district || !district.trim()) {
        return res.status(400).json({ message: 'District is required for training provider' });
      }
      if (!email && !phone) {
        return res.status(400).json({ message: 'Email or phone number is required' });
      }

      const query = [];
      if (email) query.push({ email: email.trim().toLowerCase() });
      if (phone) query.push({ phone: phone.trim() });

      let user = null;
      if (query.length > 0) {
        user = await User.findOne({ $or: query });
      }

      if (user) {
        user.name = name.trim();
        user.role = 'provider';
        if (hashedPassword) user.password = hashedPassword;
        await user.save();

        let prov = await Provider.findOne({ userId: user._id });
        if (!prov) {
          prov = await Provider.create({
            userId: user._id,
            name: companyName ? companyName.trim() : name.trim(),
            district: district.trim(),
            verified: true,
          });
        } else {
          prov.name = companyName ? companyName.trim() : name.trim();
          prov.district = district.trim();
          await prov.save();
        }

        const token = signJWT(user);
        return res.status(200).json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          message: 'Training Provider profile updated successfully',
        });
      }

      user = await User.create({
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        phone: phone ? phone.trim() : undefined,
        password: hashedPassword || undefined,
        role: 'provider',
        status: 'active',
      });

      await Provider.create({
        userId: user._id,
        name: companyName ? companyName.trim() : name.trim(),
        district: district.trim(),
        verified: true,
      });

      const token = signJWT(user);
      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        message: 'Training Provider registered successfully',
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

