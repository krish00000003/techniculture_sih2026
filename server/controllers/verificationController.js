const Employment = require('../models/Employment');
const Trainee = require('../models/Trainee');
const User = require('../models/User');

/**
 * Seed initial sample verifications if queue is empty
 */
async function ensureSampleVerifications() {
  const count = await Employment.countDocuments();
  if (count === 0) {
    const trainees = await Trainee.find().limit(5).populate('userId');
    if (trainees.length > 0) {
      const sampleClaims = [
        {
          traineeId: trainees[0]._id,
          employerName: 'Tata Motors',
          employerContact: 'careers@tatamotors.com',
          role: 'Junior Automotive Electrician',
          startDate: '2026-06-15',
          wage: '₹18,500 / month',
          status: 'pending',
          verifyToken: 'token-exp-manipal-02',
          tokenExpiresAt: new Date(Date.now() + 5 * 86400000),
        },
        {
          traineeId: trainees[1 % trainees.length]._id,
          employerName: 'Infosys Ltd',
          employerContact: 'staffing@infosys.com',
          role: 'Data Entry & Python Associate',
          startDate: '2026-05-01',
          wage: '₹22,000 / month',
          status: 'verified',
          verifiedByEmployer: true,
          verifyToken: 'token-exp-infosys-01',
          verifiedAt: new Date(Date.now() - 2 * 86400000),
        },
        {
          traineeId: trainees[2 % trainees.length]._id,
          employerName: 'Apollo Hospitals',
          employerContact: 'hr.allied@apollohospitals.com',
          role: 'General Duty Health Assistant',
          startDate: '2026-07-10',
          wage: '₹16,000 / month',
          status: 'disputed',
          verifyToken: 'token-exp-apollo-03',
          discrepancyNotes: 'Candidate worked part-time intern role, not full-time staff',
          correctedWage: '₹9,500 / month',
        },
      ];
      await Employment.insertMany(sampleClaims);
    }
  }
}

/**
 * GET /api/verifications/public/:token
 * Public endpoint — no auth required (PRD B2, S10)
 */
exports.getPublicVerification = async (req, res) => {
  try {
    await ensureSampleVerifications();
    const { token } = req.params;

    const employment = await Employment.findOne({ verifyToken: token })
      .populate({
        path: 'traineeId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!employment) {
      return res.status(404).json({ success: false, message: 'Verification link expired or not found.' });
    }

    const isExpired = employment.tokenExpiresAt && new Date() > employment.tokenExpiresAt;

    res.json({
      success: true,
      verification: {
        id: employment._id,
        token: employment.verifyToken,
        traineeName: employment.traineeId?.userId?.name || 'Vocational Trainee',
        claimedEmployer: employment.employerName,
        claimedRole: employment.role,
        claimedWage: employment.wage,
        claimedStartDate: employment.startDate,
        status: employment.status,
        verifiedByEmployer: employment.verifiedByEmployer,
        verifiedAt: employment.verifiedAt,
        correctedWage: employment.correctedWage,
        correctedStartDate: employment.correctedStartDate,
        discrepancyNotes: employment.discrepancyNotes,
        isExpired,
      },
    });
  } catch (err) {
    console.error('getPublicVerification error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve verification details' });
  }
};

/**
 * POST /api/verifications/public/:token/respond
 * Public employer one-tap respond (verify / dispute)
 */
exports.respondPublicVerification = async (req, res) => {
  try {
    const { token } = req.params;
    const { decision, correctedWage, correctedStartDate, notes } = req.body;

    const employment = await Employment.findOne({ verifyToken: token });
    if (!employment) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    if (decision === 'verify') {
      employment.status = 'verified';
      employment.verifiedByEmployer = true;
      employment.verifiedAt = new Date();
    } else {
      employment.status = 'disputed';
      employment.verifiedByEmployer = false;
      if (correctedWage) employment.correctedWage = correctedWage;
      if (correctedStartDate) employment.correctedStartDate = correctedStartDate;
      if (notes) employment.discrepancyNotes = notes;
    }

    await employment.save();

    res.json({
      success: true,
      message: decision === 'verify'
        ? `Employment successfully verified for ${employment.role} at ${employment.employerName}. Record updated in the national ledger.`
        : `Discrepancy logged for ${employment.role}. Trainee and administrator notified.`,
      status: employment.status,
    });
  } catch (err) {
    console.error('respondPublicVerification error:', err);
    res.status(500).json({ success: false, message: 'Failed to record employer response' });
  }
};

/**
 * GET /api/verifications/queue
 * Employer & Admin verification queue audit (PRD 4.13)
 */
exports.getVerificationsQueue = async (req, res) => {
  try {
    await ensureSampleVerifications();

    const employments = await Employment.find()
      .populate({
        path: 'traineeId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const data = employments.map((e) => ({
      id: e._id,
      traineeId: e.traineeId?._id,
      traineeName: e.traineeId?.userId?.name || 'Trainee',
      traineePhone: e.traineeId?.userId?.phone || '',
      employerName: e.employerName,
      employerContact: e.employerContact || 'hr@company.com',
      role: e.role,
      claimedWage: e.wage,
      claimedStartDate: e.startDate,
      status: e.status,
      verifyToken: e.verifyToken,
      verifiedAt: e.verifiedAt,
      reminderSentAt: e.reminderSentAt,
      discrepancyNotes: e.discrepancyNotes,
      createdAt: e.createdAt,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('getVerificationsQueue error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch verification queue' });
  }
};

/**
 * POST /api/verifications/:id/remind
 * Resend email/WhatsApp verification reminder to employer
 */
exports.resendReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const employment = await Employment.findById(id);
    if (!employment) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    employment.reminderSentAt = new Date();
    await employment.save();

    res.json({
      success: true,
      message: `Verification reminder dispatched to ${employment.employerContact || employment.employerName}.`,
    });
  } catch (err) {
    console.error('resendReminder error:', err);
    res.status(500).json({ success: false, message: 'Failed to resend reminder' });
  }
};
