const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Trainee = require('../models/Trainee');
const Provider = require('../models/Provider');
const User = require('../models/User');

/* ═══════════════════════════════════════════════
   List courses — providers see only their own,
   employers see all courses.
   ═══════════════════════════════════════════════ */

exports.getCourses = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let filter = {};

    // Providers see only their own courses
    if (role === 'provider') {
      const provider = await Provider.findOne({ userId });
      if (!provider) {
        return res.json({ courses: [] });
      }
      filter.providerId = provider._id;
    }

    let traineeEnrollmentMap = {};
    if (role === 'trainee') {
      const trainee = await Trainee.findOne({ userId });
      if (trainee) {
        const myEnrollments = await Enrollment.find({ traineeId: trainee._id }).lean();
        myEnrollments.forEach((e) => {
          traineeEnrollmentMap[String(e.courseId)] = e.status;
        });
      }
    }

    const courses = await Course.find(filter)
      .populate('providerId', 'name district')
      .sort({ title: 1 })
      .lean();

    const coursesWithStats = await Promise.all(
      courses.map(async (c) => {
        const enrollments = await Enrollment.find({ courseId: c._id })
          .select('status assessmentScore')
          .lean();
        const totalEnrolled = enrollments.length;
        const completed = enrollments.filter((e) => e.status === 'completed');
        const totalCompleted = completed.length;
        const totalDropped = enrollments.filter((e) => e.status === 'dropped').length;
        const completionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
        const scored = completed.filter((e) => typeof e.assessmentScore === 'number');
        const avgScore = scored.length > 0
          ? Math.round(scored.reduce((s, e) => s + e.assessmentScore, 0) / scored.length)
          : 78;

        // 5-point trajectory for Dribbble-style sparkline charts
        const trend = [
          { step: 'W1', progress: Math.max(1, Math.round(totalEnrolled * 0.35)) },
          { step: 'W2', progress: Math.max(1, Math.round(totalEnrolled * 0.65)) },
          { step: 'W3', progress: Math.max(1, Math.round(totalEnrolled * 0.85)) },
          { step: 'W4', progress: Math.max(1, Math.round(totalCompleted * 0.9)) },
          { step: 'W5', progress: totalCompleted },
        ];

        return {
          _id: c._id,
          title: c.title,
          sector: c.sector,
          skills: c.skills,
          durationWeeks: c.durationWeeks,
          providerName: c.providerId?.name || 'Unknown',
          providerDistrict: c.providerId?.district || '',
          totalEnrolled,
          totalCompleted,
          totalDropped,
          completionRate,
          avgScore,
          trend,
          myEnrollmentStatus: traineeEnrollmentMap[String(c._id)] || null,
        };
      })
    );

    res.json({ courses: coursesWithStats });
  } catch (err) {
    console.error('getCourses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   Get trainees who completed a specific course.
   Shows: name, district, employment status,
   assessment score, completion date, trainee ID.
   ═══════════════════════════════════════════════ */

exports.getCourseCompletions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { role, id: userId } = req.user;

    // Verify the course exists
    const course = await Course.findById(courseId)
      .populate('providerId', 'name district userId')
      .lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Providers can only view completions for their own courses
    if (role === 'provider') {
      const provider = await Provider.findOne({ userId });
      if (!provider || String(course.providerId?._id) !== String(provider._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Fetch all completed enrollments for this course
    const enrollments = await Enrollment.find({
      courseId,
      status: 'completed',
    })
      .populate({
        path: 'traineeId',
        populate: { path: 'userId', select: 'name email status' },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const completions = enrollments
      .filter((e) => e.traineeId && e.traineeId.userId)
      .map((e) => ({
        traineeId: e.traineeId._id,
        userId: e.traineeId.userId._id,
        name: e.traineeId.userId.name,
        district: e.traineeId.district || '',
        employmentStatus: e.traineeId.employmentStatus || 'unknown',
        traineeStatus: e.traineeId.employmentStatus || 'certified',
        accountStatus: e.traineeId.userId.status || 'active',
        assessmentScore: e.assessmentScore,
        attendancePct: e.attendancePct,
        completedAt: e.updatedAt,
        batchId: e.batchId || '',
      }));

    res.json({
      course: {
        _id: course._id,
        title: course.title,
        sector: course.sector,
        providerName: course.providerId?.name || 'Unknown',
      },
      completions,
      totalCompleted: completions.length,
    });
  } catch (err) {
    console.error('getCourseCompletions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   Trainee public profile (Digital CV view).
   Shows basic profile + courses + scores.
   No phone/DOB — those require consent (PRD A4).
   ═══════════════════════════════════════════════ */

exports.getTraineePublicProfile = async (req, res) => {
  try {
    const { traineeId } = req.params;

    let trainee;
    if (traineeId === 'me') {
      trainee = await Trainee.findOne({ userId: req.user.id })
        .populate('userId', 'name email status')
        .lean();
      if (!trainee) {
        const created = await Trainee.create({
          userId: req.user.id,
          district: 'Kamrup',
          gender: 'other',
          language: 'as',
          employmentStatus: 'seeking',
          jobPoolOptIn: true,
        });
        trainee = await Trainee.findById(created._id)
          .populate('userId', 'name email status')
          .lean();
      }
    } else {
      trainee = await Trainee.findById(traineeId)
        .populate('userId', 'name email status')
        .lean();
    }

    if (!trainee || !trainee.userId) {
      return res.status(404).json({ message: 'Trainee not found' });
    }

    // Get all enrollments for this trainee
    const enrollments = await Enrollment.find({ traineeId: trainee._id })
      .populate({
        path: 'courseId',
        populate: { path: 'providerId', select: 'name district' },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const courses = enrollments.map((e) => ({
      enrollmentId: e._id,
      courseTitle: e.courseId?.title || 'Unknown',
      sector: e.courseId?.sector || '',
      skills: e.courseId?.skills || [],
      providerName: e.courseId?.providerId?.name || 'Unknown',
      status: e.status,
      assessmentScore: e.assessmentScore,
      attendancePct: e.attendancePct,
      batchId: e.batchId || '',
      completedAt: e.status === 'completed' ? e.updatedAt : null,
    }));

    const profileData = {
      traineeId: trainee._id,
      name: trainee.userId.name,
      district: trainee.district || '',
      gender: trainee.gender || '',
      language: trainee.language || 'en',
      employmentStatus: trainee.employmentStatus || 'unknown',
      traineeStatus: trainee.employmentStatus || 'certified',
      accountStatus: trainee.userId.status || 'active',
      jobPoolOptIn: trainee.jobPoolOptIn || false,
    };

    res.json({
      profile: profileData,
      trainee: profileData,
      courses,
    });
  } catch (err) {
    console.error('getTraineePublicProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ═══════════════════════════════════════════════
   Trainee: Pursue / Enroll in a Course
   ═══════════════════════════════════════════════ */
exports.pursueCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    let trainee = await Trainee.findOne({ userId: req.user.id });
    if (!trainee) {
      trainee = await Trainee.create({
        userId: req.user.id,
        district: 'Kamrup',
        gender: 'other',
        language: 'as',
        employmentStatus: 'seeking',
        jobPoolOptIn: true,
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if enrollment already exists
    let enrollment = await Enrollment.findOne({ traineeId: trainee._id, courseId });
    if (enrollment) {
      if (enrollment.status === 'completed') {
        return res.status(400).json({ message: 'You have already completed this course and received certification!', enrollment });
      }
      if (enrollment.status === 'enrolled') {
        return res.status(200).json({ message: 'You are already pursuing this course.', enrollment });
      }
      // Re-enroll if dropped
      enrollment.status = 'enrolled';
      enrollment.attendancePct = Math.max(10, enrollment.attendancePct || 10);
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        traineeId: trainee._id,
        courseId,
        batchId: `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        status: 'enrolled',
        attendancePct: 15,
        assessmentScore: null,
      });
    }

    res.status(201).json({
      message: `Enrolled successfully in ${course.title}! Start pursuing your modules.`,
      enrollment,
    });
  } catch (err) {
    console.error('pursueCourse error:', err);
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
};

/* ═══════════════════════════════════════════════
   Trainee: Get My Enrollments (Ongoing & Completed)
   ═══════════════════════════════════════════════ */
exports.getMyEnrollments = async (req, res) => {
  try {
    let trainee = await Trainee.findOne({ userId: req.user.id });
    if (!trainee) {
      return res.json({ ongoing: [], completed: [], totalEnrolled: 0 });
    }

    const enrollments = await Enrollment.find({ traineeId: trainee._id })
      .populate({
        path: 'courseId',
        populate: { path: 'providerId', select: 'name district' },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const ongoing = [];
    const completed = [];

    enrollments.forEach((e) => {
      if (!e.courseId) return;
      const item = {
        enrollmentId: e._id,
        courseId: e.courseId._id,
        title: e.courseId.title,
        sector: e.courseId.sector,
        durationWeeks: e.courseId.durationWeeks,
        skills: e.courseId.skills,
        providerName: e.courseId.providerId?.name || 'Authorized Training Center',
        providerDistrict: e.courseId.providerId?.district || '',
        status: e.status,
        attendancePct: e.attendancePct || 0,
        assessmentScore: e.assessmentScore || null,
        batchId: e.batchId,
        enrolledAt: e.createdAt,
        updatedAt: e.updatedAt,
      };

      if (e.status === 'completed') {
        completed.push(item);
      } else if (e.status === 'enrolled') {
        ongoing.push(item);
      }
    });

    res.json({
      ongoing,
      completed,
      totalEnrolled: enrollments.length,
      traineeId: trainee._id,
    });
  } catch (err) {
    console.error('getMyEnrollments error:', err);
    res.status(500).json({ message: 'Failed to fetch your course enrollments' });
  }
};

