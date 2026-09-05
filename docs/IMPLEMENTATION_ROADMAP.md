# PathPilot AI implementation roadmap

This roadmap is derived from the complete product specification. The MVP sequence protects the load-bearing user loop first and leaves clean boundaries for later modules.

## Milestone 1 — Production foundation

- Next.js 15 App Router, strict TypeScript, Tailwind CSS, shadcn/ui source primitives, Framer Motion
- Dark token system, Geist UI type, Fraunces editorial accent, responsive accessibility baseline
- Polished public landing page and Clerk sign-in/sign-up surfaces
- Credential-aware local preview mode so the project remains runnable before services are connected
- Clerk middleware, Supabase Third-Party Auth client boundary, Drizzle/Postgres schema, RLS migration scaffold
- Responsive dashboard shell: 264px/72px desktop sidebar, sticky navbar, mobile bottom navigation
- Reusable product components and route-level placeholders for every future module
- LangGraph-ready agent output contract and specialist registry

Verification gate: install, Drizzle migration validation/generation, lint, strict typecheck, production build, desktop/mobile runtime smoke test.

## Milestone 2 — Core guidance loop

Status: complete and browser-verified.

- Six-step student onboarding with shared Zod schemas and saved draft state
- Deterministic career taxonomy filtering followed by explained Career Strategist ranking
- Smart College Finder over a 300-entry India-wide demo dataset with hard constraints, explained ranking, grid/list results, and tabbed details
- Entrance Exam Navigator with rule-based goal mapping, hybrid explanation, static tips, and permanently labeled mock dates
- Degree Advisor with a reusable comparison table and personalized narrative over six static degree paths
- Decision Memory accept/reject/snooze actions and visible history
- Versioned Career Roadmap generation and refresh changelog
- Learning Coach retrieval interface over seeded resources, pgvector-ready
- End-to-end onboarding → Discovery → Roadmap → Mission handoff

## Milestone 3 — Flagship progress experience

Status: complete and browser-verified.

- Mission Mode goal setup, health-based level bands, weighted milestone progress, deterministic next action, and achievement shelf
- Progress Dashboard aggregation with eight readiness dimensions, seven-day trends, roadmap focus, and Radar preview
- Deterministic Career Health Score with all seven category weights visible, weekly delta, evidence provenance, and optional fallback narration
- Opportunity Radar over clearly labeled static program patterns, profile-driven ranking, filters, search, why-relevant explanations, and saved/tracked state
- Existing versioned Career Roadmap connected directly to Mission Mode and the shared progress model
- Student Timeline with deterministic, stage-aware deep links and evidence-based progress states

## Milestone 4 — Simulation and timeline

Status: complete.

- Career Simulator with visible skill gaps, static salary-band context, transparent readiness bands, adjustable weekly capacity, and Convert to Mission handoff

## Milestone 5 — Proof-of-readiness modules

- Resume upload/text extraction, deterministic checks, LLM critique and prioritized rewrites
- GitHub public-profile analyzer and deterministic scoring
- Interview Coach text modes, persona variants, streaming feedback, scorecard
- Project Mentor suggestions with 24-hour cache and Start Project persistence

## Milestone 6 — Complete hackathon feature table

- Opportunity Finder using visibly labeled demo fixtures with real ranking
- What-If Simulator, Future Twin, Financial Planner, Confidence Journal
- Narrative Portfolio and guardian/counselor sharing flows
- Parent Alignment, Cohort Compass, Local Opportunity Graph, Skill Decay, simulated Micro-Mentor, Regret Report
- All mocked entities and dates labeled in the UI; all mandatory disclaimers enforced at component level

## Milestone 7 — Hardening and demo release

- Seeded demo account and pre-warmed last-known-good AI responses
- Per-user AI rate limits, structured logs, failure fallbacks, query/index review
- RLS and cross-account isolation tests, Supabase advisors, migration verification
- Mobile performance pass, reduced-motion pass, keyboard and screen-reader pass
- Full six-minute demo rehearsal and production deployment

## Post-hackathon waves

- v1.1: live job data, Sentry, formal WCAG audit
- v1.2: Hindi/regional languages, GitHub OAuth, live Places data
- v2.0: trust-and-safety-reviewed human mentor marketplace, school cohort dashboard, native app
- v2.1: WhatsApp access and offline-first PWA

The feature-level release backlog is maintained in [`PRD_TODO.md`](./PRD_TODO.md).
