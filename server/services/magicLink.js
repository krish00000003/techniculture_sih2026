const crypto = require('crypto');

/**
 * Generate a random magic-link token.
 * Returns both the raw token (sent to the user) and the hashed version (stored in DB).
 */
function generateToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
}

/**
 * Hash a raw token for DB look-up.
 */
function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * Mock: send magic link via WhatsApp or SMS.
 * Replace with a real gateway integration when ready.
 */
async function sendMagicLink(phone, token, channel = 'whatsapp') {
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/magic-link/${token}`;

  // ---- MOCK ---- //
  console.log(`\n========== MAGIC LINK (${channel.toUpperCase()}) ==========`);
  console.log(`Phone : ${phone}`);
  console.log(`Link  : ${link}`);
  console.log('================================================\n');
  // ---- END MOCK ---- //

  return { success: true, channel };
}

module.exports = { generateToken, hashToken, sendMagicLink };
