const crypto = require('crypto');
const Trainee = require('../models/Trainee');
const User = require('../models/User');
const Survey = require('../models/Survey');
const Reward = require('../models/Reward');
const Employment = require('../models/Employment');
const Employer = require('../models/Employer');

/**
 * POST /api/surveys/submit
 * Trainee submits follow-up milestone check-in survey (PRD S8, A6, C1)
 */
exports.submitSurvey = async (req, res) => {
  try {
    const { milestone = 3, employmentStatus, answers = {} } = req.body;
    const userId = req.user.id;

    let trainee = await Trainee.findOne({ userId });
    if (!trainee) {
      return res.status(404).json({ message: 'Trainee profile not found' });
    }

    const user = await User.findById(userId);

    // Map status string
    const statusLower = (employmentStatus || 'employed').toLowerCase();
    trainee.employmentStatus = statusLower.includes('self')
      ? 'self-employed'
      : statusLower.includes('apprentice')
      ? 'apprentice'
      : statusLower.includes('unemployed')
      ? 'unemployed'
      : 'employed';
    await trainee.save();

    // Reward amount by milestone (PRD A6)
    const rewardAmounts = { 3: 50, 6: 100, 12: 150, 24: 200 };
    const amount = rewardAmounts[milestone] || 50;
    const payoutMethod = trainee.upiId || `${user?.phone ? user.phone.replace(/\D/g, '') : '9876543210'}@upi`;
    const transactionRef = `UPI-TXN-${Date.now().toString().slice(-7)}`;

    // Create Survey record
    const survey = await Survey.create({
      traineeId: trainee._id,
      milestone,
      surveyType: `${milestone}-Month Post-Placement Outcome Check-In`,
      employmentStatus,
      answers,
      status: 'completed',
      rewardAmount: amount,
      rewardStatus: 'credited',
    });

    // Create Reward record
    const reward = await Reward.create({
      traineeId: trainee._id,
      surveyMilestone: milestone,
      title: `${milestone}-Month Check-in Survey Reward`,
      type: 'upi',
      amount,
      status: 'paid',
      payoutMethod,
      transactionRef,
      paidAt: new Date(),
    });

    let employment = null;
    // If Employed, create pending Employment claim with verification token (PRD B2, S10)
    if (trainee.employmentStatus === 'employed') {
      const employerName = answers.employerName || 'Partner Employer';
      const role = answers.role || 'Associate';
      const wage = answers.monthlyWage ? `₹${answers.monthlyWage} / month` : answers.wage || '₹18,000 / month';
      const startDate = answers.startDate || new Date().toISOString().split('T')[0];
      const employerContact = answers.employerContact || 'hr@company.com';

      // Find matching Employer if registered
      const matchedEmployer = await Employer.findOne({
        companyName: new RegExp(`^${employerName}$`, 'i'),
      });

      const token = `token-${crypto.randomBytes(8).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 days (PRD B2)

      employment = await Employment.create({
        traineeId: trainee._id,
        employerId: matchedEmployer?._id,
        employerName,
        employerContact,
        role,
        startDate,
        wage,
        status: 'pending',
        verifiedByEmployer: false,
        verifyToken: token,
        tokenExpiresAt: expiresAt,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Survey submitted successfully! Reward credited to your UPI wallet.',
      survey,
      reward: {
        amount: reward.amount,
        status: 'credited',
        payoutMethod: reward.payoutMethod,
        transactionRef: reward.transactionRef,
      },
      employment: employment ? {
        id: employment._id,
        verifyToken: employment.verifyToken,
        status: employment.status,
      } : null,
    });
  } catch (err) {
    console.error('submitSurvey error:', err);
    res.status(500).json({ message: 'Failed to submit milestone survey' });
  }
};
