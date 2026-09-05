# PathPilot AI — remaining PRD TODO

This is the implementation backlog after Milestones 1–3. Feature IDs and ordering follow the PRD MVP table so the next hackathon work protects the highest-value demo flow first.

## Demo-critical next slice

- [ ] **FR-7 Project Mentor** — generate level-appropriate portfolio projects, cache suggestions for 24 hours, persist started projects, and connect progress evidence to Mission Mode and Career Health.
- [ ] **FR-8 Resume Analyzer** — add secure resume upload and extraction, deterministic formatting/keyword checks, AI critique, prioritized rewrites, missing-skill analysis, and score reveal. This is the highest-priority missing demo module.
- [ ] **FR-9 GitHub Analyzer** — analyze unauthenticated public profiles, score visible evidence deterministically, explain strengths/gaps, and feed project and health signals.
- [ ] **FR-10 Internship & Job Finder** — rank clearly labeled demo listings against the student profile and roadmap; never present fixture listings as live opportunities.
- [ ] **FR-11 Interview Coach** — ship text interview modes, selectable personas, adaptive questions, per-answer feedback, and scorecards. Keep voice as a prototype and coding as review-only with no execution.
- [x] **FR-13 Career Simulator** — static salary bands, deterministic readiness bands, gap analysis, timeframe, and “Convert to Mission” handoff.

## Remaining deterministic and scenario modules

- [ ] **FR-14 What-If Simulator** — compare two or three paths using the Degree Advisor and Career Simulator data with transparent, zero-AI formulas.
- [x] **FR-17 Student Timeline** — complete education-to-career timeline with deterministic stage-aware deep links.
- [ ] **FR-18 AI Future Twin** — generate 2-, 5-, and 10-year scenarios with a persistent, non-dismissible component-level disclaimer.
- [ ] **FR-20 Multi-Agent System completion** — replace the current LangGraph-ready contracts and deterministic orchestrator with a real LangGraph supervisor graph, specialist nodes, shared state, structured traces, and last-known-good fallbacks.

## Remaining collaboration, context, and trust modules

- [ ] **FR-22 Parent Alignment Score** — validate invite-only access, collect the five-question parent form, compute the real expectation diff, and generate the conversation script.
- [ ] **FR-23 Cohort Compass** — add a visibly labeled synthetic cohort and comparison view without exposing individual student data.
- [ ] **FR-24 Local Opportunity Graph** — rank a static city-tier opportunity dataset; replace it with a Places integration after the hackathon.
- [ ] **FR-25 Skill Decay Tracker** — compute deterministic recency/decay signals and recommend refresh actions.
- [ ] **FR-26 Micro-Mentor Matching** — implement the simulated matching flow with the mandatory “AI simulation” label; do not imply a real person is available.
- [ ] **FR-27 Narrative Portfolio Generator** — compose a public student story from existing analyzed projects, resume evidence, and GitHub signals without requesting duplicate inputs.
- [ ] **FR-28 Financial Reality Planner** — model costs, EMI, breakeven, and sensitivity deterministically with a persistent “not financial advice” disclaimer.
- [ ] **FR-29 Confidence Calibration Journal** — capture self-ratings, compare them with measured readiness, and generate short reflective prompts.
- [ ] **FR-30 Dynamic Mock Interview Panel** — extend the Interview Coach pipeline to multiple interviewer personas with coordinated feedback.
- [ ] **FR-31 Regret-Minimization Path Report** — personalize a clearly labeled static regret bank, show tradeoffs, and enforce the required guidance-not-authority framing.

## Production and demo release gates

- [ ] Connect and verify the hosted Clerk + Supabase Third-Party Auth configuration with real environment values.
- [ ] Apply both Drizzle and RLS migrations to a staging Supabase project; run security/performance advisors and automated cross-account isolation tests.
- [ ] Add per-user AI rate limits, structured production logs, tracing, and Sentry observability.
- [ ] Resolve the three upstream PostCSS/Sharp advisories when a patched Next.js 15 release is available, or schedule and regression-test the breaking Next.js 16 upgrade; do not use `npm audit fix --force` without that migration.
- [ ] Seed a clean demo account and pre-warm last-known-good AI responses for every live demo call.
- [ ] Complete a formal WCAG audit with keyboard-only and screen-reader coverage.
- [ ] Deploy the production build to Vercel and rehearse the six-minute PRD demo script end to end.

## Post-hackathon roadmap

- [ ] **v1.1** — replace demo job listings with a live job-board integration and complete production observability.
- [ ] **v1.2** — add Hindi/regional-language UI, GitHub OAuth for private repositories, and a live Places API for local opportunities.
- [ ] **v2.0** — launch a trust-and-safety-reviewed human mentor marketplace, counselor cohort dashboard, and native mobile app.
- [ ] **v2.1** — add a WhatsApp interface and offline-first PWA behavior for low-bandwidth access.
