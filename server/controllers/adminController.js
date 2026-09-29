const Ranking = require('../models/Ranking');
const Provider = require('../models/Provider');
const Course = require('../models/Course');
const Job = require('../models/Job');
const Alert = require('../models/Alert');
const Enrollment = require('../models/Enrollment');
const OutcomeId = require('../models/OutcomeId');
const Trainee = require('../models/Trainee');
const Employer = require('../models/Employer');
const User = require('../models/User');
const Settings = require('../models/Settings');

/* ═══════════════════════════════════════════════
   S14 — Provider Rankings
   ═══════════════════════════════════════════════ */

exports.getRankings = async (req, res) => {
  try {
    const { district, period, sort = 'adjustedScore', order = 'desc' } = req.query;

    const match = {};
    if (period) match.period = period;

    let rankings = await Ranking.find(match)
      .populate('providerId', 'name district verified')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .lean();

    // Filter by provider district if specified
    if (district) {
      rankings = rankings.filter(
        (r) => r.providerId?.district?.toLowerCase() === district.toLowerCase()
      );
    }

    // Add rank numbers
    rankings = rankings.map((r, i) => ({
      _id: r._id,
      rank: i + 1,
      providerName: r.providerId?.name || 'Unknown',
      district: r.providerId?.district || '',
      verified: r.providerId?.verified || false,
      period: r.period,
      rawScore: r.rawScore,
      adjustedScore: r.adjustedScore,
      retentionPct: r.retentionPct,
      wageGrowthPct: r.wageGrowthPct,
      cohortDifficulty: r.cohortDifficulty,
      districtEconomyIndex: r.districtEconomyIndex,
    }));

    // Get distinct districts and periods for filters
    const allProviders = await Provider.distinct('district');
    const allPeriods = await Ranking.distinct('period');

    res.json({ rankings, districts: allProviders, periods: allPeriods });
  } catch (err) {
    console.error('getRankings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   S15 — Skill Gaps
   ═══════════════════════════════════════════════ */

exports.getSkillGaps = async (req, res) => {
  try {
    const { sector, district } = req.query;

    // Skills taught — from courses
    const courseMatch = {};
    if (sector) courseMatch.sector = sector;
    // If district filter, get providers from that district first
    if (district) {
      const providers = await Provider.find({ district }).select('_id');
      courseMatch.providerId = { $in: providers.map((p) => p._id) };
    }

    const courses = await Course.find(courseMatch).lean();
    const taughtMap = {};
    courses.forEach((c) => {
      (c.skills || []).forEach((s) => {
        taughtMap[s] = (taughtMap[s] || 0) + 1;
      });
    });

    // Skills demanded — from jobs
    const jobMatch = { active: true };
    if (district) jobMatch.district = district;
    const jobs = await Job.find(jobMatch).lean();
    const demandedMap = {};
    jobs.forEach((j) => {
      (j.skills || []).forEach((s) => {
        demandedMap[s] = (demandedMap[s] || 0) + 1;
      });
    });

    // Merge into gap table
    const allSkills = [...new Set([...Object.keys(taughtMap), ...Object.keys(demandedMap)])];
    const gaps = allSkills
      .map((skill) => {
        const taught = taughtMap[skill] || 0;
        const demanded = demandedMap[skill] || 0;
        return {
          skill,
          taught,
          demanded,
          gap: demanded - taught,
          status: demanded > taught ? 'deficit' : demanded < taught ? 'surplus' : 'balanced',
        };
      })
      .sort((a, b) => b.gap - a.gap);

    // Distinct sectors for filter
    const sectors = await Course.distinct('sector');
    const districts = await Provider.distinct('district');

    res.json({ gaps, sectors, districts });
  } catch (err) {
    console.error('getSkillGaps error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   S16 — Action Center (Alerts)
   ═══════════════════════════════════════════════ */

exports.getAlerts = async (req, res) => {
  try {
    const { status, severity } = req.query;
    const match = {};
    if (status) match.status = status;
    if (severity) match.severity = severity;

    const alerts = await Alert.find(match).sort({ createdAt: -1 }).lean();

    // Summary counts
    const counts = {
      total: await Alert.countDocuments(),
      critical: await Alert.countDocuments({ severity: 'critical' }),
      pending: await Alert.countDocuments({ status: 'pending' }),
      resolved: await Alert.countDocuments({ status: { $ne: 'pending' } }),
    };

    res.json({ alerts, counts });
  } catch (err) {
    console.error('getAlerts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'dismissed'

    if (!['approved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or dismissed' });
    }

    const alert = await Alert.findByIdAndUpdate(id, { status }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    res.json({ alert });
  } catch (err) {
    console.error('updateAlert error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   S17 — Attrition & Non-Placement
   ═══════════════════════════════════════════════ */

exports.getAttrition = async (req, res) => {
  try {
    const { provider, course, period } = req.query;

    const match = { status: 'dropped' };
    if (course) match.courseId = course;

    // If provider filter, get their courses first
    if (provider) {
      const courses = await Course.find({ providerId: provider }).select('_id');
      match.courseId = { $in: courses.map((c) => c._id) };
    }

    // Date filter
    if (period) {
      const months = parseInt(period) || 6;
      match.createdAt = { $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000) };
    }

    // Aggregate drop reasons
    const reasonAgg = await Enrollment.aggregate([
      { $match: { ...match, dropReason: { $ne: null, $exists: true } } },
      { $group: { _id: '$dropReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const reasons = reasonAgg.map((r) => ({ reason: r._id, count: r.count }));

    // Summary stats
    const totalDropped = await Enrollment.countDocuments(match);
    const totalEnrolled = await Enrollment.countDocuments(
      provider
        ? { courseId: match.courseId }
        : {}
    );

    // Get filter options
    const providers = await Provider.find().select('_id name').lean();
    const courses = await Course.find().select('_id title').lean();

    res.json({
      reasons,
      totalDropped,
      totalEnrolled,
      dropoutRate: totalEnrolled > 0 ? ((totalDropped / totalEnrolled) * 100).toFixed(1) : 0,
      providers,
      courses,
    });
  } catch (err) {
    console.error('getAttrition error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   S18 — Duplicate Review
   ═══════════════════════════════════════════════ */

exports.getDuplicates = async (req, res) => {
  try {
    const duplicates = await OutcomeId.find({ reviewStatus: 'pending' })
      .populate({
        path: 'linkedTraineeIds',
        populate: { path: 'userId', select: 'name phone email' },
      })
      .sort({ matchScore: -1 })
      .lean();

    res.json({ duplicates });
  } catch (err) {
    console.error('getDuplicates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.mergeDuplicate = async (req, res) => {
  try {
    const { id } = req.params;
    const oid = await OutcomeId.findByIdAndUpdate(
      id,
      { reviewStatus: 'merged' },
      { new: true }
    );
    if (!oid) return res.status(404).json({ message: 'Not found' });
    res.json({ outcomeId: oid });
  } catch (err) {
    console.error('mergeDuplicate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectDuplicate = async (req, res) => {
  try {
    const { id } = req.params;
    const oid = await OutcomeId.findByIdAndUpdate(
      id,
      { reviewStatus: 'rejected' },
      { new: true }
    );
    if (!oid) return res.status(404).json({ message: 'Not found' });
    res.json({ outcomeId: oid });
  } catch (err) {
    console.error('rejectDuplicate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   S19 — Settings
   ═══════════════════════════════════════════════ */

exports.getSettings = async (_req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      settings = await Settings.create({ key: 'global' });
    }
    res.json({ settings });
  } catch (err) {
    console.error('getSettings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { escalation, rewards, velocityCaps, alertThresholds } = req.body;
    const update = {};
    if (escalation) update.escalation = escalation;
    if (rewards) update.rewards = rewards;
    if (velocityCaps) update.velocityCaps = velocityCaps;
    if (alertThresholds) update.alertThresholds = alertThresholds;

    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: update },
      { new: true, upsert: true }
    );

    res.json({ settings });
  } catch (err) {
    console.error('updateSettings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   Dashboard stats
   ═══════════════════════════════════════════════ */

exports.getStats = async (_req, res) => {
  try {
    const [
      totalTrainees,
      totalProviders,
      totalEmployers,
      totalCourses,
      totalEnrollments,
      activeAlerts,
      pendingDuplicates,
      totalManagers,
      pendingApprovals,
    ] = await Promise.all([
      User.countDocuments({ role: 'trainee' }),
      Provider.countDocuments(),
      User.countDocuments({ role: 'employer' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Alert.countDocuments({ status: 'pending' }),
      OutcomeId.countDocuments({ reviewStatus: 'pending' }),
      User.countDocuments({ role: { $in: ['manager', 'supervisor'] } }),
      User.countDocuments({ status: 'pending_approval' }),
    ]);

    res.json({
      totalTrainees,
      totalProviders,
      totalEmployers,
      totalCourses,
      totalEnrollments,
      activeAlerts,
      pendingDuplicates,
      totalManagers,
      pendingApprovals,
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   User Directory & Minute-by-Minute Data Audit
   ═══════════════════════════════════════════════ */

exports.getUsersMinuteData = async (req, res) => {
  try {
    const { role, status, search, limit = 100, page = 1 } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { outcomeId: regex },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Attach role-specific summary data
    const userIds = users.map((u) => u._id);
    const [trainees, employers, providers] = await Promise.all([
      Trainee.find({ userId: { $in: userIds } }).lean(),
      Employer.find({ userId: { $in: userIds } }).lean(),
      Provider.find({ userId: { $in: userIds } }).lean(),
    ]);

    const traineeMap = new Map(trainees.map((t) => [String(t.userId), t]));
    const employerMap = new Map(employers.map((e) => [String(e.userId), e]));
    const providerMap = new Map(providers.map((p) => [String(p.userId), p]));

    const enrichedUsers = users.map((u) => {
      const uId = String(u._id);
      let details = null;
      if (u.role === 'trainee') {
        details = traineeMap.get(uId) || null;
      } else if (u.role === 'employer') {
        details = employerMap.get(uId) || null;
      } else if (u.role === 'provider') {
        details = providerMap.get(uId) || null;
      }

      return {
        _id: u._id,
        name: u.name,
        email: u.email || '—',
        phone: u.phone || '—',
        role: u.role,
        status: u.status,
        outcomeId: u.outcomeId || (details && details.outcomeId) || '—',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        lastLoginAt: u.lastLoginAt || null,
        approvedAt: u.approvedAt || null,
        details,
      };
    });

    const [pendingCount, roleCounts] = await Promise.all([
      User.countDocuments({ status: 'pending_approval' }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    const countsByRole = {};
    roleCounts.forEach((r) => {
      countsByRole[r._id] = r.count;
    });

    res.json({
      users: enrichedUsers,
      total,
      page: parseInt(page),
      pendingCount,
      countsByRole,
    });
  } catch (err) {
    console.error('getUsersMinuteData error:', err);
    res.status(500).json({ message: 'Server error retrieving users audit' });
  }
};

/**
 * GET /api/admin/users/:id/details
 * Fetch granular minute data for a specific user
 */
exports.getUserDetailedMinuteData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    let enrollments = [];
    let jobs = [];
    let courses = [];
    let linkedOutcomes = [];

    if (user.role === 'trainee') {
      profile = await Trainee.findOne({ userId: user._id }).lean();
      if (profile) {
        enrollments = await Enrollment.find({ traineeId: profile._id })
          .populate('courseId', 'title sector skills durationWeeks')
          .sort({ createdAt: -1 })
          .lean();
        linkedOutcomes = await OutcomeId.find({ linkedTraineeIds: profile._id }).lean();
      }
    } else if (user.role === 'employer') {
      profile = await Employer.findOne({ userId: user._id }).lean();
      if (profile) {
        jobs = await Job.find({ employerId: profile._id }).sort({ createdAt: -1 }).lean();
      }
    } else if (user.role === 'provider') {
      profile = await Provider.findOne({ userId: user._id }).lean();
      if (profile) {
        courses = await Course.find({ providerId: profile._id }).sort({ createdAt: -1 }).lean();
      }
    }

    res.json({
      user,
      profile,
      enrollments,
      jobs,
      courses,
      linkedOutcomes,
      auditTimestamps: {
        registeredMinute: user.createdAt,
        lastProfileUpdateMinute: user.updatedAt,
        lastLoginMinute: user.lastLoginAt || null,
        approvedMinute: user.approvedAt || null,
      },
    });
  } catch (err) {
    console.error('getUserDetailedMinuteData error:', err);
    res.status(500).json({ message: 'Server error retrieving user details' });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Admin-only: Promote or reassign roles (manager, supervisor, etc.)
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['trainee', 'employer', 'provider', 'admin', 'manager', 'supervisor'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protect primary super admin
    if (user.email === 'admin@sih.in' && role !== 'admin') {
      return res.status(403).json({ message: 'The primary Super Admin role cannot be demoted' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `Role successfully updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Server error updating role' });
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Admin / Manager / Supervisor: Approve, reject, or suspend a user
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'suspended', 'pending_approval'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status specified' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protect primary super admin
    if (user.email === 'admin@sih.in' && status !== 'active') {
      return res.status(403).json({ message: 'The primary Super Admin cannot be suspended' });
    }

    user.status = status;
    if (status === 'active') {
      user.approvedBy = req.user.id;
      user.approvedAt = new Date();
    }
    await user.save();

    // Sync verification status to role profiles
    if (user.role === 'employer') {
      await Employer.updateOne(
        { userId: user._id },
        { verified: status === 'active', registryStatus: status === 'active' ? 'verified' : 'pending_verification' }
      );
    } else if (user.role === 'provider') {
      await Provider.updateOne(
        { userId: user._id },
        { verified: status === 'active' }
      );
    }

    res.json({
      message: `User status successfully updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approvedAt: user.approvedAt,
      },
    });
  } catch (err) {
    console.error('updateUserStatus error:', err);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

