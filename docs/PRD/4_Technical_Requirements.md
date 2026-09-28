# Technical Requirements

## 1. Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React + Material UI (MUI), React Router, Axios |
| Devices | Responsive web (mobile-first) + PWA; Android, iOS and desktop browsers |
| Backend | Node.js + Express REST API |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Google Sign-In (Employer, Provider, Admin); Magic Link via WhatsApp/SMS (Trainee); JWT sessions |
| Integrations | WhatsApp/SMS gateway, IVR provider, UPI / mobile recharge payout API, GST and MCA registry APIs |

## 2. File Structure
```
/client
  /public            (manifest.json, service-worker.js, icons)
  /src
    /api             (axios instance, per-module calls)
    /components      (Navbar, Sidebar, DataTable, StatCard, AlertBanner, Loader)
    /context         (AuthContext, ThemeContext)
    /hooks           (useAuth, useFetch)
    /layouts         (PublicLayout, DashboardLayout)
    /pages
      /auth          (Login, MagicLink)
      /trainee       (Dashboard, DigitalCV, Consent, Rewards, Jobs, CheckIn)
      /employer      (Talent, Verify, Profile)
      /provider      (Upload, CohortAlerts)
      /admin         (Rankings, SkillGaps, Actions, Attrition, Duplicates, Settings)
    /routes          (ProtectedRoute, role routing)
    /theme           (muiTheme.js)
    App.js, index.js
/server
  /config            (db.js, env)
  /models            (one file per collection)
  /routes            (auth, trainee, employer, provider, admin, survey, consent)
  /controllers
  /middleware        (authJWT, roleGuard, rateLimit, velocityCap)
  /services          (magicLink, escalation, payout, registry, dedupe, ranking, alerts)
  /jobs              (scheduled check-ins at 3/6/12/24 months)
  server.js
```

## 3. Database Structure (MongoDB Atlas)
- **users**: `_id, role (trainee|employer|provider|admin), googleId, email, phone, name, outcomeId, status, createdAt`
- **trainees**: `userId, outcomeId, dob, gender, district, language, backupContact{name, phone}, coordinatorId, jobPoolOptIn, employmentStatus`
- **outcomeIds**: `outcomeId (pseudonymous), linkedTraineeIds[], matchScore, reviewStatus`
- **magicLinks**: `token (hashed), userId, expiresAt, usedAt, channel`
- **providers**: `userId, name, district, courses[], verified`
- **courses**: `providerId, title, sector, skills[], durationWeeks`
- **enrollments**: `traineeId, courseId, batchId, status (enrolled|completed|dropped), attendancePct, assessmentScore, dropReason`
- **credentials**: `traineeId, courseId, certificateUrl, score, issuedAt`
- **employers**: `userId, companyName, gstin, cin, registryStatus, verified`
- **jobs**: `employerId, title, skills[], district, wageBand, active`
- **employments**: `traineeId, employerId, role, startDate, endDate, verifiedByEmployer, verifyToken, wage`
- **selfEmployment**: `traineeId, businessType, incomeBand, daysWorked, photoUrl, geo{lat,lng}, verifiedBy`
- **apprenticeships**: `traineeId, employerId, stipend, startDate, stage, convertedToJob`
- **surveys**: `traineeId, milestone (3|6|12|24), channelLevel, answers{}, status, completedAt`
- **escalations**: `surveyId, step (whatsapp|ivr|backup|coordinator), attemptedAt, result`
- **rewards**: `traineeId, surveyId, type (upi|recharge), amount, status, paidAt`
- **consents**: `traineeId, granteeId, scope[], grantedAt, revokedAt`
- **accessLogs**: `traineeId, accessedBy, scope, at`
- **alerts**: `type, targetId, severity, message, status, createdAt`
- **rankings**: `providerId, period, rawScore, adjustedScore, cohortDifficulty, districtEconomyIndex`

## 4. Key API Groups
- `/auth`: google login, request magic link, verify token
- `/trainee`: dashboard, CV, jobs, rewards
- `/consent`: list, grant, revoke, access log
- `/survey`: get, save, submit
- `/employer`: profile, talent search, verify (token link)
- `/provider`: upload CSV, API ingestion, cohort alerts
- `/admin`: rankings, skill gaps, alerts, attrition, duplicates, settings

## 5. Core Logic
- **Escalation:** scheduled job creates a survey per milestone; if no response in the set window, moves to the next channel (WhatsApp/SMS → IVR → backup contact → coordinator). Stops on completion.
- **Reward velocity cap:** middleware checks per-person, per-day and total-budget limits before payout.
- **De-duplication:** score on phone (highest weight), name similarity and DOB. Above high threshold = auto-merge; middle band = admin review.
- **Ranking adjustment:** adjusted score = raw outcome score corrected for cohort difficulty and district economy index.
- **Alerts:** daily job evaluates rules (dropout rate, failing course, long unemployment) and writes to `alerts`.

## 6. Security and Privacy
- Role-based access on every API route (`roleGuard`).
- Magic-link and verification tokens stored hashed, single-use, with expiry.
- Phone and DOB encrypted at rest; analytics use Outcome ID only.
- Access to trainee data checked against `consents` and written to `accessLogs`.
- Rate limiting on login, link requests and uploads.
- Compliance with India's DPDP Act (consent, revoke, deletion on request).

## 7. Performance and Compatibility
- Page load under 3 seconds on 4G.
- PWA installable on Android and iOS; works in current Chrome, Safari, Edge and Firefox.
- Breakpoints: mobile <600px, tablet 600–1024px, desktop >1024px.

## 8. Environment and Deployment
- Environment variables for MongoDB URI, JWT secret, Google client ID, gateway and registry keys.
- MongoDB Atlas with daily backups.
- HTTPS everywhere; separate dev and production environments.
