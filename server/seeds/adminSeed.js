/**
 * Seed script — populates the database with realistic demo data
 * for the admin panel. Run: node seeds/adminSeed.js
 *
 * Idempotent: skips if data already exists.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Provider = require('../models/Provider');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Trainee = require('../models/Trainee');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Ranking = require('../models/Ranking');
const Alert = require('../models/Alert');
const OutcomeId = require('../models/OutcomeId');
const Settings = require('../models/Settings');

async function seed() {
  await connectDB();
  console.log('Seeding admin demo data...\n');

  // ── Skip if already seeded ──
  const existing = await Provider.countDocuments();
  if (existing > 0) {
    console.log('Data already exists. Skipping seed. (Delete collections to re-seed.)');
    process.exit(0);
  }

  // ── 1. Admin user ──
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@voctrack.in',
    role: 'admin',
    status: 'active',
  });
  console.log('✓ Admin user created (admin@voctrack.in)');

  // ── 2. Providers ──
  const providerData = [
    { name: 'Skill India Training Centre', district: 'Mumbai' },
    { name: 'National Skill Academy', district: 'Delhi' },
    { name: 'Pradhan Mantri Kaushal Kendra', district: 'Bangalore' },
    { name: 'IL&FS Skills Development', district: 'Chennai' },
    { name: 'NIIT Foundation', district: 'Kolkata' },
    { name: 'Tata STRIVE', district: 'Hyderabad' },
    { name: 'TeamLease Skills University', district: 'Pune' },
    { name: 'Centum Learning', district: 'Ahmedabad' },
    { name: 'Don Bosco Tech Society', district: 'Jaipur' },
    { name: 'Labournet Services', district: 'Lucknow' },
  ];

  const providers = await Provider.insertMany(
    providerData.map((p) => ({ ...p, verified: true }))
  );
  console.log(`✓ ${providers.length} providers created`);

  // ── 3. Courses with skills ──
  const sectors = ['Construction', 'IT/ITES', 'Healthcare', 'Retail', 'Automotive', 'Beauty & Wellness', 'Electronics', 'Textile'];
  const skillPool = {
    Construction: ['welding', 'plumbing', 'masonry', 'carpentry', 'painting', 'electrical wiring'],
    'IT/ITES': ['data entry', 'computer basics', 'MS Office', 'tally accounting', 'web development', 'python programming'],
    Healthcare: ['general duty assistant', 'phlebotomy', 'ECG technician', 'pharmacy assistant', 'home health aide'],
    Retail: ['retail sales', 'visual merchandising', 'cashier operations', 'inventory management', 'customer service'],
    Automotive: ['two-wheeler repair', 'four-wheeler service', 'auto electrician', 'auto body painting', 'CNC machining'],
    'Beauty & Wellness': ['beautician', 'hair styling', 'spa therapy', 'nail art', 'makeup artistry'],
    Electronics: ['mobile phone repair', 'LED TV repair', 'solar panel installation', 'CCTV installation', 'PCB assembly'],
    Textile: ['tailoring', 'fashion design basics', 'embroidery', 'fabric cutting', 'garment quality check'],
  };

  const courseEntries = [];
  providers.forEach((prov, idx) => {
    const sector = sectors[idx % sectors.length];
    const skills = skillPool[sector];
    for (let i = 0; i < 3; i++) {
      const pickedSkills = skills.slice(i, i + 3);
      courseEntries.push({
        providerId: prov._id,
        title: `${sector} - Level ${i + 1}`,
        sector,
        skills: pickedSkills,
        durationWeeks: 8 + i * 4,
      });
    }
  });
  const courses = await Course.insertMany(courseEntries);
  console.log(`✓ ${courses.length} courses created`);

  // ── 4. Trainee users + Trainee profiles + Enrollments ──
  const districts = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
  const dropReasons = [
    'Low wages in the sector',
    'Transport / commute issues',
    'Curriculum not relevant',
    'Family responsibilities',
    'Found informal work',
    'Health issues',
    'Migration to another city',
    'Language barrier',
    'Lack of placement support',
    'Poor infrastructure',
  ];

  const traineeUsers = [];
  const traineeProfiles = [];
  const enrollments = [];

  for (let t = 0; t < 120; t++) {
    const phone = `+91 ${9000000000 + t}`;
    traineeUsers.push({
      name: `Trainee ${t + 1}`,
      phone,
      role: 'trainee',
      status: 'active',
    });
  }
  const createdUsers = await User.insertMany(traineeUsers);

  createdUsers.forEach((u, t) => {
    const genders = ['male', 'female', 'other'];
    traineeProfiles.push({
      userId: u._id,
      outcomeId: `OID-${String(t + 1).padStart(5, '0')}`,
      dob: new Date(1998 + (t % 8), t % 12, 1 + (t % 28)),
      gender: genders[t % 3],
      district: districts[t % districts.length],
      employmentStatus: ['employed', 'unemployed', 'self-employed', 'apprentice', 'unknown'][t % 5],
    });
  });
  const trainees = await Trainee.insertMany(traineeProfiles);

  // Assign 1-2 enrollments per trainee
  trainees.forEach((tr, t) => {
    const course = courses[t % courses.length];
    const statuses = ['enrolled', 'completed', 'completed', 'dropped'];
    const st = statuses[t % statuses.length];
    enrollments.push({
      traineeId: tr._id,
      courseId: course._id,
      batchId: `BATCH-${Math.ceil((t + 1) / 10)}`,
      status: st,
      attendancePct: st === 'dropped' ? 20 + Math.floor(Math.random() * 40) : 60 + Math.floor(Math.random() * 40),
      assessmentScore: st === 'dropped' ? 10 + Math.floor(Math.random() * 30) : 50 + Math.floor(Math.random() * 50),
      dropReason: st === 'dropped' ? dropReasons[t % dropReasons.length] : undefined,
    });
  });
  await Enrollment.insertMany(enrollments);
  console.log(`✓ ${trainees.length} trainees + ${enrollments.length} enrollments created`);

  // ── 5. Employers + Jobs ──
  const employers = await Employer.insertMany([
    { companyName: 'Tata Motors', gstin: '27AABCT1234A1ZV', verified: true, registryStatus: 'verified' },
    { companyName: 'Infosys Ltd', gstin: '29AABCI1234B2ZW', verified: true, registryStatus: 'verified' },
    { companyName: 'Apollo Hospitals', gstin: '33AABCA1234C3ZX', verified: true, registryStatus: 'verified' },
    { companyName: 'Reliance Retail', gstin: '27AABCR1234D4ZY', verified: true, registryStatus: 'verified' },
    { companyName: 'Maruti Suzuki', gstin: '06AABCM1234E5ZZ', verified: true, registryStatus: 'verified' },
  ]);

  const jobEntries = [];
  const demandedSkills = [
    ['welding', 'plumbing', 'electrical wiring', 'CNC machining'],
    ['data entry', 'python programming', 'web development', 'tally accounting', 'MS Office'],
    ['general duty assistant', 'phlebotomy', 'ECG technician', 'pharmacy assistant'],
    ['retail sales', 'customer service', 'inventory management', 'cashier operations'],
    ['two-wheeler repair', 'four-wheeler service', 'auto electrician'],
  ];
  employers.forEach((emp, i) => {
    const skills = demandedSkills[i];
    skills.forEach((sk) => {
      jobEntries.push({
        employerId: emp._id,
        title: `${sk.charAt(0).toUpperCase() + sk.slice(1)} Associate`,
        skills: [sk],
        district: districts[i % districts.length],
        wageBand: ['₹8k-12k', '₹12k-18k', '₹15k-25k', '₹10k-15k'][i % 4],
        active: true,
      });
    });
  });
  await Job.insertMany(jobEntries);
  console.log(`✓ ${employers.length} employers + ${jobEntries.length} jobs created`);

  // ── 6. Rankings ──
  const rankingEntries = providers.map((prov, i) => ({
    providerId: prov._id,
    period: 'Q3-2026',
    rawScore: 55 + Math.floor(Math.random() * 40),
    adjustedScore: 50 + Math.floor(Math.random() * 45),
    retentionPct: 60 + Math.floor(Math.random() * 35),
    wageGrowthPct: 5 + Math.floor(Math.random() * 25),
    cohortDifficulty: +(0.3 + Math.random() * 0.6).toFixed(2),
    districtEconomyIndex: +(0.4 + Math.random() * 0.5).toFixed(2),
  }));
  await Ranking.insertMany(rankingEntries);
  console.log(`✓ ${rankingEntries.length} rankings created`);

  // ── 7. Alerts ──
  const alertEntries = [
    { type: 'high_dropout', severity: 'critical', targetType: 'provider', targetName: 'Centum Learning', message: 'Dropout rate at 38%, exceeds 20% threshold', suggestedAction: 'Schedule audit and bridge course for current batch' },
    { type: 'failing_course', severity: 'critical', targetType: 'course', targetName: 'Construction - Level 3', message: 'Average assessment score 28% — below 40% threshold', suggestedAction: 'Review curriculum and instructor quality' },
    { type: 'chronic_unemployment', severity: 'warning', targetType: 'provider', targetName: 'Don Bosco Tech Society', message: '12 trainees unemployed beyond 6 months post-completion', suggestedAction: 'Activate targeted job matching for affected trainees' },
    { type: 'low_attendance', severity: 'warning', targetType: 'course', targetName: 'IT/ITES - Level 1', message: 'Batch BATCH-5 attendance at 42% — below 60% threshold', suggestedAction: 'Contact low-attendance trainees via coordinator' },
    { type: 'high_dropout', severity: 'warning', targetType: 'provider', targetName: 'Labournet Services', message: 'Dropout rate at 25%, trending upward over 2 quarters', suggestedAction: 'Review intake process and counseling support' },
    { type: 'chronic_unemployment', severity: 'info', targetType: 'provider', targetName: 'NIIT Foundation', message: '5 trainees self-reporting job search difficulties', suggestedAction: 'Connect with local employer network' },
    { type: 'failing_course', severity: 'critical', targetType: 'course', targetName: 'Automotive - Level 2', message: 'Pass rate dropped to 35% this quarter', suggestedAction: 'Deploy additional practical training sessions' },
    { type: 'low_attendance', severity: 'info', targetType: 'course', targetName: 'Retail - Level 1', message: 'Slight attendance dip to 65% — monitor next week', suggestedAction: 'Send reminder notifications' },
  ];
  await Alert.insertMany(alertEntries);
  console.log(`✓ ${alertEntries.length} alerts created`);

  // ── 8. Potential Duplicates ──
  const dupePairs = [
    { matchScore: 87, trainees: [trainees[0]._id, trainees[60]._id] },
    { matchScore: 72, trainees: [trainees[10]._id, trainees[70]._id] },
    { matchScore: 65, trainees: [trainees[20]._id, trainees[80]._id] },
    { matchScore: 91, trainees: [trainees[5]._id, trainees[55]._id] },
    { matchScore: 78, trainees: [trainees[15]._id, trainees[95]._id] },
  ];
  await OutcomeId.insertMany(
    dupePairs.map((d, i) => ({
      outcomeId: `DUP-${String(i + 1).padStart(4, '0')}`,
      linkedTraineeIds: d.trainees,
      matchScore: d.matchScore,
      reviewStatus: 'pending',
    }))
  );
  console.log(`✓ ${dupePairs.length} duplicate pairs created`);

  // ── 9. Default Settings ──
  await Settings.create({ key: 'global' });
  console.log('✓ Default settings created');

  console.log('\n✅ Seed complete! You can now log in as admin@voctrack.in');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
