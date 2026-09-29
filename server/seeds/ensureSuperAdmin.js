const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Ensures the super admin account (admin@sih.in) exists with active status and password.
 * Runs on every server startup.
 */
async function ensureSuperAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@sih.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (!admin) {
      admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
      });
      console.log(`✓ Super Admin created: ${adminEmail} (password: ${adminPassword})`);
    } else {
      // Ensure password and role are active and super-admin
      admin.role = 'admin';
      admin.status = 'active';
      admin.password = hashedPassword;
      await admin.save();
      console.log(`✓ Super Admin verified & updated: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Error ensuring super admin:', err.message);
  }
}

module.exports = ensureSuperAdmin;
