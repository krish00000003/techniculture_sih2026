# UI/UX Requirements

## 1. Design Principles
- Clean and minimal: white space, soft-radius cards (8px), one primary action per screen.
- Mobile-first; works on Android, iOS and desktop browsers.
- Simple language, large touch targets (≥44px).

## 2. Colour Theme
| Use | Colour |
|---|---|
| Page background | `#E3FDFD` |
| Cards / surfaces | `#CBF1F5` |
| Hover / secondary | `#A6E3E9` |
| Primary buttons / active state | `#71C9CE` |
| Text | `#1F2D2E` (dark grey, for contrast) |

Typography: Roboto, 16px base.

## 3. Layout and Navigation
- **Mobile (<600px):** top bar + bottom nav (max 4 tabs).
- **Tablet (600–1024px):** collapsible sidebar.
- **Desktop (>1024px):** left sidebar + top bar with profile menu and logout.

## 4. Global Behavior
- Loading skeletons on every data screen.
- Empty states with one clear action.
- Snackbar for success and error messages.
- Inline form validation.
- Language toggle (English + one regional language).
- Users only see screens for their role.

## 5. Screen Specifications

### Public / Auth

**S1. Login**
- UI: logo, "Continue with Google" button, phone input with "Get magic link".
- Actions: Google sign-in; request link by WhatsApp/SMS.
- Navigation: success → role home (Trainee Home, Employer Talent, Provider Upload, Admin Rankings).
- Behavior: 3 link requests/hour; role comes from the account.

**S2. Magic Link Landing**
- UI: spinner, "Signing you in…".
- Actions: auto-validate token.
- Navigation: valid → Trainee Home; expired → "Send new link" → S1.

### Trainee (bottom nav: Home, CV, Jobs, Me)

**S3. Course Dashboard (Home)**
- UI: tabs (Ongoing, Completed, Recommended) with course cards; banner for pending survey with reward amount.
- Actions: open course; tap survey banner.
- Navigation: banner → S8.

**S4. Digital CV**
- UI: profile header, certificates, scores, work history with "Verified" chip.
- Actions: download/share CV; toggle job-pool opt-in.

**S5. Jobs**
- UI: matched job cards (title, employer, district, wage band).
- Actions: "Interested", "I got hired".
- Behavior: visible only if opted in and unemployed.

**S6. Consent Ledger** (under Me)
- UI: list of parties with access (name, scope, date) + Revoke button; access history below.
- Actions: Grant / Revoke with confirmation dialog.

**S7. Rewards** (under Me)
- UI: history list (amount, status), payout method field.
- Actions: save UPI ID / mobile number.
- Behavior: shows a clear message if the velocity cap blocks a payout.

**S8. Check-in Survey**
- UI: one question per step, progress bar, large buttons. Branches: Employed, Self-employed, Apprentice, Unemployed.
- Actions: answer, submit; self-employed adds business type, income band, days worked, optional photo.
- Navigation: submit → success screen with reward → Home.
- Behavior: autosave; resumable from the same link.

### Employer (sidebar: Talent, Verifications, Profile)

**S9. Talent Portal**
- UI: filter panel (skill, district, course) + result cards (anonymized until consent).
- Actions: filter, view profile, "Request contact".

**S10. One-Tap Verification** (opens from link, no login)
- UI: "Did [Name] work with you as [Role]?" with Yes / No buttons.
- Actions: Yes = verified, No = flagged.

**S11. Employer Profile**
- UI: company name, GSTIN, CIN, verification status chip.
- Actions: save, re-check registry.

### Provider (sidebar: Upload, Cohort Alerts)

**S12. Data Upload**
- UI: drag-and-drop CSV area, template download, API key box, upload history table.
- Actions: upload, download template, generate API key.
- Behavior: shows validation errors per row.

**S13. Cohort Alerts**
- UI: table of at-risk trainees (name, batch, reason, attendance %) with severity chip.
- Actions: mark "Contacted", add note.

### Admin (sidebar: Rankings, Skill Gaps, Actions, Attrition, Duplicates, Settings)

**S14. Provider Rankings**
- UI: sortable table (rank, provider, adjusted score, retention, wage growth), district filter.
- Actions: filter, open provider detail, export CSV.

**S15. Skill Gaps**
- UI: bar chart (taught vs. demanded) + gap table.
- Actions: filter by sector / district.

**S16. Action Center**
- UI: alert list with severity and reason for trigger.
- Actions: approve suggested action, dismiss.

**S17. Attrition and Non-Placement**
- UI: chart of reasons + recent free-text themes.
- Actions: filter by provider, course, period.

**S18. Duplicate Review**
- UI: side-by-side profile cards with match score.
- Actions: Merge / Not same person.

**S19. Settings**
- UI: escalation timing, reward amounts, velocity caps, alert thresholds.
- Actions: edit, save.
