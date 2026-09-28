const Ranking = require('../models/Ranking');
const Provider = require('../models/Provider');
const Course = require('../models/Course');
const Job = require('../models/Job');
const Alert = require('../models/Alert');
const Enrollment = require('../models/Enrollment');
const OutcomeId = require('../models/OutcomeId');
const Trainee = require('../models/Trainee');
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
    const User = require('../models/User');
    const [
      totalTrainees,
      totalProviders,
      totalEmployers,
      totalCourses,
      totalEnrollments,
      activeAlerts,
      pendingDuplicates,
    ] = await Promise.all([
      User.countDocuments({ role: 'trainee' }),
      Provider.countDocuments(),
      User.countDocuments({ role: 'employer' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Alert.countDocuments({ status: 'pending' }),
      OutcomeId.countDocuments({ reviewStatus: 'pending' }),
    ]);

    res.json({
      totalTrainees,
      totalProviders,
      totalEmployers,
      totalCourses,
      totalEnrollments,
      activeAlerts,
      pendingDuplicates,
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
