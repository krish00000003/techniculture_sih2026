# Product Requirements: Vocational Training Outcome Tracking Platform

## 1. Purpose
Track what happens to trainees after vocational training (jobs, income, dropouts). Give trainees a portable digital CV. Give providers, employers and government reliable, verified outcome data.

## 2. Problem Statement
- Training outcomes are rarely tracked after course completion.
- The same person appears in several programs and gets counted twice.
- Follow-up is hard: trainees change phones, move, or work informally.
- Providers are judged on raw placement numbers, which ignores how hard their cohort or local economy is.

## 3. Users
| User | Need |
|---|---|
| Trainee | One place for courses, certificates and jobs, with full control over their data |
| Employer | Find certified graduates and confirm hires quickly |
| Training Provider | Submit data easily and spot dropout risk early |
| Admin / Government | Fair provider comparison, skill gaps, and triggers for action |

## 4. Goals
1. Collect verified outcome data at 3, 6, 12 and 24 months.
2. Zero-friction access for trainees (no password, no app install).
3. One person = one Outcome ID across all programs.
4. Turn data into action: rankings, skill-gap reports and alerts.
5. Respect privacy: trainee consent controls who sees their data.

## 5. Success Metrics
- Survey response rate at each milestone (target set by admin).
- Share of employment claims verified by employers.
- Duplicate profiles detected and merged.
- Provider data upload completion rate.
- Time from dropout-risk signal to provider action.

## 6. Scope

**In scope (v1):** web app (responsive + installable PWA) for all four user groups, magic-link and Google login, survey escalation, micro-rewards, employer verification, consent ledger, admin analytics, provider uploads.

**Out of scope (v1):** in-app chat, LMS/course delivery, large payments, native mobile apps, payroll.

## 7. Assumptions
- Most trainees use WhatsApp/SMS and a basic smartphone.
- Providers can supply enrollment data as CSV or API.
- GST/MCA registry APIs and a UPI/recharge payout partner are available.

## 8. Risks
| Risk | Mitigation |
|---|---|
| Low survey response | Rewards + multi-step escalation to coordinator |
| Fake employment claims | One-tap employer verification + registry check |
| Reward abuse | Velocity caps per person, per day, and per budget |
| Privacy concerns | Consent ledger, pseudonymous Outcome ID, access logs |
| Duplicate identities | Probabilistic matching + admin review |

## 9. Release Plan
1. Auth (Google + magic link) and role routing
2. Provider upload, trainee dashboard and digital CV
3. Surveys, escalation and rewards
4. Employer verification and job matching
5. Consent ledger
6. Admin analytics and alerts
