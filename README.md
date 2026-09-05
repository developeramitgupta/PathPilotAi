# PathPilot AI

Your AI-powered Student Success Operating System.

PathPilot AI is a long-term guidance platform for Indian students, from choosing a stream after Class 10 through landing a first job. It keeps a persistent profile and decision history, explains every recommendation using the student's own inputs, and turns goals into trackable missions.

## Stack

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4
- shadcn/ui source components, Framer Motion, Lucide icons
- Clerk authentication with Supabase Third-Party Auth
- Supabase Postgres, pgvector-ready data model, Drizzle ORM
- LangGraph-ready agent contracts

## Local development

```bash
npm install
copy .env.example .env.local
npm run db:generate
npm run dev
```

Without credentials, the app runs in an explicitly labeled local preview mode. Connected environments use Clerk route protection and Clerk session tokens for Supabase RLS.

The current MVP flow includes six-step onboarding, explained career discovery, Smart College Finder, Entrance Exam Navigator, Degree Advisor, visible Decision Memory, versioned career roadmaps, milestone-level learning-resource retrieval, Mission Mode, the Progress Dashboard, a transparent Career Health Score, Opportunity Radar, and the shared Ask PathPilot orchestrator. Deterministic fallbacks keep the complete demo flow available when an OpenAI key is not configured.

## Quality checks

```bash
npm run check
```

See `docs/IMPLEMENTATION_ROADMAP.md` for milestone scope and module sequencing.
