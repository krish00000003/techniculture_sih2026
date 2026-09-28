# Feature Requirements

Each feature lists what it does and the key rules it must follow.

## A. Trainee Features

**A1. Frictionless Magic Link Access**
- Secure link sent by WhatsApp or SMS; no password, no app download.
- Token is single-use, expires in 15 minutes; session lasts 30 days on that device.
- Max 3 link requests per hour per phone.

**A2. Unified Course Dashboard**
- Shows ongoing, completed and recommended courses from all programs under one Outcome ID.

**A3. Digital CV / Wallet**
- Compiles certificates, assessment scores and employer-verified work history.
- Only employer-verified jobs get a "Verified" tag.
- Trainee can download or share the CV and opt in or out of the job pool.

**A4. Consent Ledger**
- Lists who can access the trainee's data, for what scope, and since when.
- Trainee can grant or revoke access; revoke applies immediately.
- Every access is logged and visible to the trainee.

**A5. Targeted Job Matching**
- Matches unemployed, opted-in trainees to jobs by skill and district.
- Trainee can mark "Interested" or report "I got hired".

**A6. Micropayment Survey Rewards**
- Small UPI payout or mobile recharge after each completed survey.
- Velocity caps (per person, per day, total budget) prevent misuse.
- Trainee saves a UPI ID or mobile number as the payout method.

## B. Employer Features

**B1. Hiring / Talent Portal**
- Search and filter opted-in graduates by skill, district and course.
- Contact details unlock only after trainee consent.

**B2. One-Tap Job Verification**
- When a trainee reports being hired, the employer gets a link with Yes / No.
- No login needed; link is single-use and expires in 7 days.

**B3. Registry Linkage (GST, MCA)**
- Employer's GSTIN / CIN is checked automatically on sign-up.
- Unverified employers cannot use the talent portal.

## C. Tracking and Data Collection

**C1. Omnichannel Escalation**
- Check-ins at 3, 6, 12 and 24 months.
- Order: WhatsApp/SMS → local-language IVR call → backup family contact → local coordinator.
- Escalation stops as soon as the survey is completed. Timing set by admin.

**C2. Informal Work and Self-Employment Tracker**
- Short check-in: business type, income band, days worked.
- Optional geo-tagged workspace photo, or verification by a community coordinator.

**C3. Apprenticeship Tracking**
- Tracks stage from start and stipend payments to conversion into full-time job.

**C4. Identity De-Duplication (Outcome ID)**
- Matches on phone, name and DOB to assign one pseudonymous Outcome ID.
- High-confidence matches merge automatically; medium matches go to admin review.

## D. Admin / Government Features

**D1. Risk-Adjusted Provider Rankings**
- Ranks providers on retention and wage progression.
- Adjusts for cohort difficulty and local district economy; shows raw and adjusted scores.

**D2. Skill Gap Identification**
- Compares skills taught by providers with skills demanded in employer job posts.

**D3. Action-Triggering Engine**
- Daily rules create alerts: high dropout, failing course, chronically unemployed trainees.
- Suggests an action (bridge course, audit); admin approves or dismisses.

**D4. Attrition and Non-Placement Diagnosis**
- Captures reasons for dropout or no placement (wages, transport, curriculum, etc.).
- Free text is grouped into themes.

## E. Training Provider Features

**E1. Batch CSV / API Ingestion**
- Upload enrollment, attendance and graduation data via CSV or API key.
- Row-level validation report; downloadable CSV template.

**E2. Cohort Early-Warning Alerts**
- Flags trainees whose attendance or scores suggest dropout risk.
- Provider can mark "Contacted" and add a note.
